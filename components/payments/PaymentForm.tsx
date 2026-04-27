import {
  View, Text, TextInput, Pressable, ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ReceiptIcon, CalendarIcon, CaretDownIcon,
  PlusIcon, XIcon, ArrowCounterClockwiseIcon, UsersIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import { useRecordPayment } from '../../lib/hooks/use-payments';
import { useTenants } from '../../lib/hooks/use-tenants';
import {
  paymentFormSchema, type PaymentFormValues,
} from '../../lib/validations/payment';
import {
  PAYMENT_METHODS,
  getPaymentMethodMetaScheme,
  getPaymentStatusMetaScheme,
} from '../../lib/constants/payment-method-meta';
import { getPropertyTypeMeta } from '../../lib/constants/property-type-meta';
import {
  formatCurrency, formatMonthYear, getInitials,
} from '../../lib/utils/formatters';
import { TenantPickerModal } from './TenantPickerModal';
import { useActionSheet } from '../ui/ActionSheet';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { PaymentMethod, PaymentStatus } from '../../types/payment';
import type { Tenant } from '../../types/tenant';

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <View className="flex-row items-center gap-0.5 mb-2">
      <Text
        className="text-foreground text-[13px]"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {children}
      </Text>
      {required && <Text className="text-destructive text-[13px]">*</Text>}
    </View>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text
      className="text-destructive text-xs mt-1.5"
      style={{ fontFamily: 'Inter_400Regular' }}
    >
      {message}
    </Text>
  );
}

function SubmitButton({
  onPress, label, loading, disabled, mutedFg,
}: {
  onPress: () => void; label: string; loading: boolean; disabled: boolean; mutedFg: string;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 18, stiffness: 240 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 240 }); }}
        android_ripple={null}
        className={cn(
          'h-[50px] rounded-xl items-center justify-center flex-row gap-2',
          disabled || loading ? 'bg-muted' : 'bg-primary',
        )}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color={disabled || loading ? mutedFg : '#fff'}
          />
        )}
        <Text
          className={cn(
            'text-[15px]',
            disabled || loading ? 'text-muted-foreground' : 'text-white',
          )}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {loading ? 'Recording…' : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function buildLast12Months(): { month: number; year: number; label: string }[] {
  const out: { month: number; year: number; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      month: d.getMonth() + 1,
      year:  d.getFullYear(),
      label: formatMonthYear(d.getMonth() + 1, d.getFullYear()),
    });
  }
  return out;
}

function toISO(d: Date) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function fromISO(s?: string) {
  if (!s) return new Date();
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function formatDisplayDate(s?: string) {
  if (!s) return 'Today';
  const d = fromISO(s);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - dd.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days > 0 && days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface PaymentFormProps {
  preselectedTenantSlug?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({
  preselectedTenantSlug, onSuccess, onCancel,
}: PaymentFormProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = THEME[scheme];

  const { show: showActionSheet } = useActionSheet();
  const recordPayment = useRecordPayment();

  const { data: allTenants } = useTenants({ active: true, page_size: 100 });

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    if (preselectedTenantSlug && !selectedTenant && allTenants) {
      const match = allTenants.find((t) => t.slug === preselectedTenantSlug);
      if (match) setSelectedTenant(match);
    }
  }, [preselectedTenantSlug, allTenants, selectedTenant]);

  const today = new Date();

  const {
    control, handleSubmit, watch, setValue,
    formState: { errors, isValid },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    mode: 'onChange',
    defaultValues: {
      tenant_id:         '',
      amount:            '',
      payment_for_month: today.getMonth() + 1,
      payment_for_year:  today.getFullYear(),
      payment_method:    'UPI',
      payment_status:    'PAID',
      payment_date:      toISO(today),
      notes:             '',
    },
  });

  const amount        = watch('amount');
  const month         = watch('payment_for_month');
  const year          = watch('payment_for_year');
  const method        = watch('payment_method');
  const status        = watch('payment_status');
  const paymentDate   = watch('payment_date');

  const expectedRent = selectedTenant ? Number(selectedTenant.monthly_rent) : 0;

  useEffect(() => {
    if (selectedTenant) {
      setValue('tenant_id', selectedTenant.id, { shouldValidate: true });
      setValue('amount', String(expectedRent), { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedTenant?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedTenant) return;
    const n = Number(amount || 0);
    let suggested: PaymentStatus = 'PENDING';
    if (n >= expectedRent && n > 0) suggested = 'PAID';
    else if (n > 0)                 suggested = 'PARTIAL';
    setValue('payment_status', suggested);
  }, [amount, expectedRent, selectedTenant?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSubmitting = recordPayment.isPending;

  const openPeriodPicker = () => {
    const opts = buildLast12Months();
    showActionSheet({
      title:   'Period',
      message: 'For which month is this payment?',
      options: opts.map((o) => ({
        label:    o.label,
        selected: o.month === month && o.year === year,
        onPress:  () => {
          setValue('payment_for_month', o.month);
          setValue('payment_for_year',  o.year);
        },
      })),
    });
  };

  const openDatePicker = () => {
    const now = new Date();
    const opts = [0, 1, 2, 3, 7].map((d) => {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
      return {
        label: d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`,
        iso:   toISO(dt),
      };
    });
    showActionSheet({
      title:   'Paid on',
      message: 'When was the payment received?',
      options: opts.map((o) => ({
        label:    o.label,
        selected: o.iso === paymentDate,
        onPress:  () => setValue('payment_date', o.iso),
      })),
    });
  };

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      await recordPayment.mutateAsync({
        tenant_id:         values.tenant_id,
        amount:            values.amount,
        payment_date:      values.payment_date ?? toISO(today),
        payment_for_month: values.payment_for_month,
        payment_for_year:  values.payment_for_year,
        payment_method:    values.payment_method,
        payment_status:    values.payment_status,
        notes:             values.notes,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const submitDisabled = !isValid || !selectedTenant;

  const summaryAmount = amount ? formatCurrency(amount) : null;
  const summaryStatus = getPaymentStatusMetaScheme(status, scheme);
  const summaryMethod = getPaymentMethodMetaScheme(method, scheme);

  const cardClass = 'bg-card border border-border rounded-xl p-4 mb-3';
  const inputBaseClass = 'bg-background border rounded-[10px]';

  return (
    <>
      <View className={cardClass}>
        <View className="flex-row items-center gap-2 mb-3.5">
          <UsersIcon size={16} color={palette.mutedForeground} weight="duotone" />
          <Text
            className="text-foreground text-sm"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            Tenant
          </Text>
        </View>

        {selectedTenant ? (
          <Pressable
            onPress={() => setPickerOpen(true)}
            android_ripple={null}
            className="bg-background border border-border rounded-[10px] p-3 flex-row items-center gap-3"
          >
            <View className="size-[38px] rounded-full bg-muted items-center justify-center">
              <Text
                className="text-foreground text-xs"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {getInitials(selectedTenant.name)}
              </Text>
            </View>
            <View className="flex-1 min-w-0">
              <View className="flex-row items-center gap-1.5 mb-0.5">
                <Text
                  numberOfLines={1}
                  className="text-foreground text-sm shrink"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {selectedTenant.name}
                </Text>
                {(() => {
                  const tm = getPropertyTypeMeta(selectedTenant.property_type, palette);
                  return (
                    <View
                      style={{ backgroundColor: tm.iconBg }}
                      className="rounded px-1 py-px"
                    >
                      <Text
                        style={{ color: tm.iconColor, fontFamily: 'Inter_600SemiBold' }}
                        className="text-[9px]"
                      >
                        {tm.shortLabel}
                      </Text>
                    </View>
                  );
                })()}
              </View>
              <Text
                numberOfLines={1}
                className="text-muted-foreground text-[11px] mb-0.5"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {selectedTenant.property_name} · {selectedTenant.unit_number} · {selectedTenant.slot_number}
              </Text>
              <Text
                className="text-foreground text-[11px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {formatCurrency(selectedTenant.monthly_rent)}
                <Text
                  className="text-muted-foreground"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  /mo expected
                </Text>
              </Text>
            </View>
            <Text
              className="text-primary text-xs"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Change
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setPickerOpen(true)}
            android_ripple={null}
            className="bg-background border-[1.5px] border-dashed border-border rounded-[10px] p-3.5 flex-row items-center justify-center gap-2"
          >
            <PlusIcon size={14} color={palette.primary} weight="bold" />
            <Text
              className="text-primary text-[13px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Select Tenant
            </Text>
          </Pressable>
        )}
        <FieldError message={errors.tenant_id?.message} />
      </View>

      <View className={cardClass}>
        <View className="flex-row items-center gap-2 mb-[18px]">
          <ReceiptIcon size={16} color={palette.mutedForeground} weight="duotone" />
          <Text
            className="text-foreground text-sm"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            Payment details
          </Text>
        </View>

        <View className="mb-[18px]">
          <FieldLabel required>Amount</FieldLabel>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={cn(
                  'flex-row items-center px-3.5',
                  inputBaseClass,
                  errors.amount ? 'border-destructive' : 'border-border',
                )}
              >
                <Text
                  className="text-muted-foreground text-sm mr-1.5"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  ₹
                </Text>
                <TextInput
                  placeholder={expectedRent > 0 ? String(expectedRent) : 'Amount'}
                  placeholderTextColor={palette.mutedForeground}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  inputMode="numeric"
                  className="flex-1 text-foreground text-sm py-3"
                  style={{ fontFamily: 'Inter_400Regular' }}
                />
                {selectedTenant && Number(value) !== expectedRent && expectedRent > 0 && (
                  <Pressable
                    onPress={() => onChange(String(expectedRent))}
                    android_ripple={null}
                    hitSlop={6}
                    className="flex-row items-center gap-1"
                  >
                    <ArrowCounterClockwiseIcon size={11} color={palette.primary} weight="bold" />
                    <Text
                      className="text-primary text-[11px]"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      Reset
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          />
          <FieldError message={errors.amount?.message} />
        </View>

        <View className="mb-[18px]">
          <FieldLabel required>For period</FieldLabel>
          <Pressable
            onPress={openPeriodPicker}
            android_ripple={null}
            className={cn(
              'flex-row items-center gap-2.5 px-3.5 h-[46px]',
              inputBaseClass,
              'border-border',
            )}
          >
            <CalendarIcon size={14} color={palette.mutedForeground} />
            <Text
              className="flex-1 text-foreground text-sm"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {formatMonthYear(month, year)}
            </Text>
            <CaretDownIcon size={12} color={palette.mutedForeground} />
          </Pressable>
        </View>

        <View className="mb-[18px]">
          <FieldLabel required>Payment method</FieldLabel>
          <View className="flex-row flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => {
              const meta = getPaymentMethodMetaScheme(m, scheme);
              const Icon = meta.Icon;
              const selected = method === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setValue('payment_method', m as PaymentMethod);
                  }}
                  android_ripple={null}
                  style={{
                    borderColor: selected ? meta.color : palette.border,
                    backgroundColor: selected ? meta.bg : palette.background,
                  }}
                  className={cn(
                    'flex-row items-center gap-1.5 rounded-[10px] px-3 py-2',
                    selected ? 'border-[1.5px]' : 'border',
                  )}
                >
                  <Icon size={13} color={selected ? meta.color : palette.mutedForeground} weight={selected ? 'fill' : 'regular'} />
                  <Text
                    style={{
                      color: selected ? meta.color : palette.foreground,
                      fontFamily: 'Inter_600SemiBold',
                    }}
                    className="text-xs"
                  >
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mb-[18px]">
          <FieldLabel>Paid on</FieldLabel>
          <Pressable
            onPress={openDatePicker}
            android_ripple={null}
            className={cn(
              'flex-row items-center gap-2.5 px-3.5 h-[46px]',
              inputBaseClass,
              'border-border',
            )}
          >
            <CalendarIcon size={14} color={palette.mutedForeground} />
            <Text
              className="flex-1 text-foreground text-sm"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {formatDisplayDate(paymentDate)}
            </Text>
            <CaretDownIcon size={12} color={palette.mutedForeground} />
          </Pressable>
        </View>

        <View>
          <FieldLabel required>Status</FieldLabel>
          <View className="flex-row gap-2">
            {(['PAID', 'PARTIAL', 'PENDING'] as PaymentStatus[]).map((s) => {
              const meta = getPaymentStatusMetaScheme(s, scheme);
              const selected = status === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setValue('payment_status', s);
                  }}
                  android_ripple={null}
                  style={{
                    borderColor: selected ? meta.color : palette.border,
                    backgroundColor: selected ? meta.bg : palette.background,
                  }}
                  className={cn(
                    'flex-1 rounded-[10px] py-2.5 items-center',
                    selected ? 'border-[1.5px]' : 'border',
                  )}
                >
                  <Text
                    style={{
                      color: selected ? meta.color : palette.foreground,
                      fontFamily: 'Inter_600SemiBold',
                    }}
                    className="text-xs"
                  >
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text
            className="text-muted-foreground text-[11px] mt-1.5 leading-4"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Auto-suggested from amount vs expected. Override if needed.
          </Text>
        </View>
      </View>

      <View className="mb-3">
        {!notesOpen ? (
          <Pressable
            onPress={() => setNotesOpen(true)}
            android_ripple={null}
            className="flex-row items-center gap-1.5 self-start"
            hitSlop={6}
          >
            <PlusIcon size={12} color={palette.primary} weight="bold" />
            <Text
              className="text-primary text-[13px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Add a note (optional)
            </Text>
          </Pressable>
        ) : (
          <View className="bg-card border border-border rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text
                className="text-foreground text-[13px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Notes
              </Text>
              <Pressable
                onPress={() => { setValue('notes', ''); setNotesOpen(false); }}
                android_ripple={null}
                hitSlop={6}
              >
                <XIcon size={14} color={palette.mutedForeground} />
              </Pressable>
            </View>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="e.g. Paid half now, balance next week"
                  placeholderTextColor={palette.mutedForeground}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="bg-background border border-border rounded-[10px] px-3.5 py-3 text-foreground text-[13px] min-h-[70px]"
                  style={{ fontFamily: 'Inter_400Regular' }}
                />
              )}
            />
          </View>
        )}
      </View>

      {selectedTenant && summaryAmount && (
        <View className="bg-muted rounded-[10px] p-3 mb-4">
          <Text
            className="text-muted-foreground text-[11px] leading-[17px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            <Text
              className="text-foreground"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {summaryAmount}
            </Text>
            {' via '}
            <Text style={{ color: summaryMethod.color, fontFamily: 'Inter_600SemiBold' }}>
              {summaryMethod.label}
            </Text>
            {' for '}
            <Text
              className="text-foreground"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {selectedTenant.name}
            </Text>
            {' · '}
            {formatMonthYear(month, year)}
            {' (will be marked '}
            <Text style={{ color: summaryStatus.color, fontFamily: 'Inter_600SemiBold' }}>
              {summaryStatus.label}
            </Text>
            {')'}
          </Text>
        </View>
      )}

      <View className="gap-2.5">
        <SubmitButton
          onPress={handleSubmit(onSubmit)}
          label="Record Payment"
          loading={isSubmitting}
          disabled={submitDisabled}
          mutedFg={palette.mutedForeground}
        />
        <Pressable
          onPress={onCancel}
          disabled={isSubmitting}
          android_ripple={null}
          className="h-12 border border-border bg-card rounded-xl items-center justify-center"
        >
          <Text
            className="text-foreground text-sm"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            Cancel
          </Text>
        </Pressable>
      </View>

      <TenantPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(t) => setSelectedTenant(t)}
        selectedId={selectedTenant?.id}
      />
    </>
  );
}
