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
import { useRecordPayment } from '../../lib/hooks/use-payments';
import { useTenants } from '../../lib/hooks/use-tenants';
import {
  paymentFormSchema, type PaymentFormValues,
} from '../../lib/validations/payment';
import {
  PAYMENT_METHODS, getPaymentMethodMeta, getPaymentStatusMeta,
} from '../../lib/constants/payment-method-meta';
import { getPropertyTypeMeta } from '../../lib/constants/property-type-meta';
import {
  formatCurrency, formatMonthYear, getInitials,
} from '../../lib/utils/formatters';
import { TenantPickerModal } from './TenantPickerModal';
import { useActionSheet } from '../ui/ActionSheet';
import type { AppColors } from '../../lib/theme/colors';
import type { PaymentMethod, PaymentStatus } from '../../types/payment';
import type { Tenant } from '../../types/tenant';

// ── Field primitives ──────────────────────────────────────────────────────────
function FieldLabel({ children, required, colors }: { children: React.ReactNode; required?: boolean; colors: AppColors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 }}>
      <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
        {children}
      </Text>
      {required && <Text style={{ color: colors.danger, fontSize: 13 }}>*</Text>}
    </View>
  );
}

function FieldError({ message, colors }: { message?: string; colors: AppColors }) {
  if (!message) return null;
  return (
    <Text style={{ color: colors.danger, fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 6 }}>
      {message}
    </Text>
  );
}

// ── Submit button — spring-press, loading state ───────────────────────────────
function SubmitButton({
  onPress, label, loading, disabled, colors,
}: {
  onPress: () => void; label: string; loading: boolean; disabled: boolean; colors: AppColors;
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
        style={{
          height: 50,
          backgroundColor: disabled || loading ? `${colors.primary}99` : colors.primary,
          borderRadius: 12,
          alignItems: 'center', justifyContent: 'center',
          flexDirection: 'row', gap: 8,
        }}
      >
        {loading && <ActivityIndicator size="small" color="#fff" />}
        <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
          {loading ? 'Recording…' : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Last 12 months options ────────────────────────────────────────────────────
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

// ── Date helpers — all local-time, no UTC drift ───────────────────────────────
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

// ── PaymentForm props ─────────────────────────────────────────────────────────
interface PaymentFormProps {
  preselectedTenantSlug?: string;
  onSuccess: () => void;
  onCancel: () => void;
  colors: AppColors;
}

export function PaymentForm({
  preselectedTenantSlug, onSuccess, onCancel, colors,
}: PaymentFormProps) {
  const { show: showActionSheet } = useActionSheet();
  const recordPayment = useRecordPayment();

  // Pull active tenants (used for resolving the preselected slug → ID)
  const { data: allTenants } = useTenants({ active: true, page_size: 100 });

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  // Resolve preselected slug once tenants list loads
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
  const notes         = watch('notes');

  const expectedRent = selectedTenant ? Number(selectedTenant.monthly_rent) : 0;

  // Push tenant selection into form. Whenever the tenant changes, also refresh
  // the amount to that tenant's monthly rent — switching from a ₹15k tenant to
  // a ₹20k tenant should not leave the old amount behind.
  useEffect(() => {
    if (selectedTenant) {
      setValue('tenant_id', selectedTenant.id, { shouldValidate: true });
      setValue('amount', String(expectedRent), { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedTenant?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-suggest status from amount vs expected
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

  // Confirmation summary text
  const summaryAmount = amount ? formatCurrency(amount) : null;
  const summaryStatus = getPaymentStatusMeta(status, colors);
  const summaryMethod = getPaymentMethodMeta(method, colors);

  return (
    <>
      {/* ── 1. Tenant section ── */}
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16, marginBottom: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <UsersIcon size={16} color={colors.mutedFg} weight="duotone" />
          <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
            Tenant
          </Text>
        </View>

        {selectedTenant ? (
          <Pressable
            onPress={() => setPickerOpen(true)}
            android_ripple={null}
            style={{
              backgroundColor: colors.background,
              borderWidth: 1, borderColor: colors.border,
              borderRadius: 10, padding: 12,
              flexDirection: 'row', alignItems: 'center', gap: 12,
            }}
          >
            <View style={{
              width: 38, height: 38, borderRadius: 19,
              backgroundColor: colors.mutedBg,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ color: colors.foreground, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
                {getInitials(selectedTenant.name)}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text
                  numberOfLines={1}
                  style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', flexShrink: 1 }}
                >
                  {selectedTenant.name}
                </Text>
                {(() => {
                  const tm = getPropertyTypeMeta(selectedTenant.property_type, colors);
                  return (
                    <View style={{
                      backgroundColor: tm.iconBg, borderRadius: 4,
                      paddingHorizontal: 5, paddingVertical: 1,
                    }}>
                      <Text style={{ color: tm.iconColor, fontSize: 9, fontFamily: 'Inter_600SemiBold' }}>
                        {tm.shortLabel}
                      </Text>
                    </View>
                  );
                })()}
              </View>
              <Text
                numberOfLines={1}
                style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 }}
              >
                {selectedTenant.property_name} · {selectedTenant.unit_number} · {selectedTenant.slot_number}
              </Text>
              <Text style={{ color: colors.foreground, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                {formatCurrency(selectedTenant.monthly_rent)}
                <Text style={{ color: colors.mutedFg, fontFamily: 'Inter_400Regular' }}>/mo expected</Text>
              </Text>
            </View>
            <Text style={{ color: colors.primary, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
              Change
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setPickerOpen(true)}
            android_ripple={null}
            style={{
              backgroundColor: colors.background,
              borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border,
              borderRadius: 10, padding: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <PlusIcon size={14} color={colors.primary} weight="bold" />
            <Text style={{ color: colors.primary, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
              Select Tenant
            </Text>
          </Pressable>
        )}
        <FieldError message={errors.tenant_id?.message} colors={colors} />
      </View>

      {/* ── 2. Payment details ── */}
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16, marginBottom: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <ReceiptIcon size={16} color={colors.mutedFg} weight="duotone" />
          <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
            Payment details
          </Text>
        </View>

        {/* Amount */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel required colors={colors}>Amount</FieldLabel>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: errors.amount ? colors.danger : colors.border,
                borderRadius: 10,
                paddingHorizontal: 14,
              }}>
                <Text style={{ color: colors.mutedFg, fontSize: 14, fontFamily: 'Inter_400Regular', marginRight: 6 }}>
                  ₹
                </Text>
                <TextInput
                  placeholder={expectedRent > 0 ? String(expectedRent) : 'Amount'}
                  placeholderTextColor={colors.mutedFg}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  inputMode="numeric"
                  style={{
                    flex: 1, color: colors.foreground,
                    fontSize: 14, fontFamily: 'Inter_400Regular', paddingVertical: 12,
                  }}
                />
                {selectedTenant && Number(value) !== expectedRent && expectedRent > 0 && (
                  <Pressable
                    onPress={() => onChange(String(expectedRent))}
                    android_ripple={null}
                    hitSlop={6}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  >
                    <ArrowCounterClockwiseIcon size={11} color={colors.primary} weight="bold" />
                    <Text style={{ color: colors.primary, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                      Reset
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          />
          <FieldError message={errors.amount?.message} colors={colors} />
        </View>

        {/* Period */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel required colors={colors}>For period</FieldLabel>
          <Pressable
            onPress={openPeriodPicker}
            android_ripple={null}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              backgroundColor: colors.background,
              borderWidth: 1, borderColor: colors.border,
              borderRadius: 10, paddingHorizontal: 14, height: 46,
            }}
          >
            <CalendarIcon size={14} color={colors.mutedFg} />
            <Text style={{ flex: 1, color: colors.foreground, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
              {formatMonthYear(month, year)}
            </Text>
            <CaretDownIcon size={12} color={colors.mutedFg} />
          </Pressable>
        </View>

        {/* Method */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel required colors={colors}>Payment method</FieldLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PAYMENT_METHODS.map((m) => {
              const meta = getPaymentMethodMeta(m, colors);
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
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    borderWidth: selected ? 1.5 : 1,
                    borderColor: selected ? meta.color : colors.border,
                    backgroundColor: selected ? meta.bg : colors.background,
                    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
                  }}
                >
                  <Icon size={13} color={selected ? meta.color : colors.mutedFg} weight={selected ? 'fill' : 'regular'} />
                  <Text style={{
                    color: selected ? meta.color : colors.foreground,
                    fontSize: 12, fontFamily: 'Inter_600SemiBold',
                  }}>
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Paid on */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel colors={colors}>Paid on</FieldLabel>
          <Pressable
            onPress={openDatePicker}
            android_ripple={null}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              backgroundColor: colors.background,
              borderWidth: 1, borderColor: colors.border,
              borderRadius: 10, paddingHorizontal: 14, height: 46,
            }}
          >
            <CalendarIcon size={14} color={colors.mutedFg} />
            <Text style={{ flex: 1, color: colors.foreground, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
              {formatDisplayDate(paymentDate)}
            </Text>
            <CaretDownIcon size={12} color={colors.mutedFg} />
          </Pressable>
        </View>

        {/* Status */}
        <View>
          <FieldLabel required colors={colors}>Status</FieldLabel>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['PAID', 'PARTIAL', 'PENDING'] as PaymentStatus[]).map((s) => {
              const meta = getPaymentStatusMeta(s, colors);
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
                    flex: 1,
                    borderWidth: selected ? 1.5 : 1,
                    borderColor: selected ? meta.color : colors.border,
                    backgroundColor: selected ? meta.bg : colors.background,
                    borderRadius: 10, paddingVertical: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: selected ? meta.color : colors.foreground,
                    fontSize: 12, fontFamily: 'Inter_600SemiBold',
                  }}>
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{
            color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 6, lineHeight: 16,
          }}>
            Auto-suggested from amount vs expected. Override if needed.
          </Text>
        </View>
      </View>

      {/* ── 3. Notes (collapsible) ── */}
      <View style={{ marginBottom: 12 }}>
        {!notesOpen ? (
          <Pressable
            onPress={() => setNotesOpen(true)}
            android_ripple={null}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              alignSelf: 'flex-start',
            }}
            hitSlop={6}
          >
            <PlusIcon size={12} color={colors.primary} weight="bold" />
            <Text style={{ color: colors.primary, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
              Add a note (optional)
            </Text>
          </Pressable>
        ) : (
          <View style={{
            backgroundColor: colors.card,
            borderWidth: 1, borderColor: colors.border,
            borderRadius: 12, padding: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                Notes
              </Text>
              <Pressable
                onPress={() => { setValue('notes', ''); setNotesOpen(false); }}
                android_ripple={null}
                hitSlop={6}
              >
                <XIcon size={14} color={colors.mutedFg} />
              </Pressable>
            </View>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="e.g. Paid half now, balance next week"
                  placeholderTextColor={colors.mutedFg}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1, borderColor: colors.border,
                    borderRadius: 10,
                    paddingHorizontal: 14, paddingVertical: 12,
                    color: colors.foreground,
                    fontSize: 13, fontFamily: 'Inter_400Regular',
                    minHeight: 70,
                  }}
                />
              )}
            />
          </View>
        )}
      </View>

      {/* ── 4. Confirmation summary ── */}
      {selectedTenant && summaryAmount && (
        <View style={{
          backgroundColor: colors.mutedBg,
          borderRadius: 10, padding: 12, marginBottom: 16,
        }}>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 17 }}>
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>{summaryAmount}</Text>
            {' via '}
            <Text style={{ color: summaryMethod.color, fontFamily: 'Inter_600SemiBold' }}>{summaryMethod.label}</Text>
            {' for '}
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>{selectedTenant.name}</Text>
            {' · '}
            {formatMonthYear(month, year)}
            {' (will be marked '}
            <Text style={{ color: summaryStatus.color, fontFamily: 'Inter_600SemiBold' }}>{summaryStatus.label}</Text>
            {')'}
          </Text>
        </View>
      )}

      {/* ── 5. Actions ── */}
      <View style={{ gap: 10 }}>
        <SubmitButton
          onPress={handleSubmit(onSubmit)}
          label="Record Payment"
          loading={isSubmitting}
          disabled={submitDisabled}
          colors={colors}
        />
        <Pressable
          onPress={onCancel}
          disabled={isSubmitting}
          android_ripple={null}
          style={{
            height: 48,
            borderWidth: 1, borderColor: colors.border,
            backgroundColor: colors.card,
            borderRadius: 12,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
            Cancel
          </Text>
        </Pressable>
      </View>

      {/* ── Tenant picker modal ── */}
      <TenantPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(t) => setSelectedTenant(t)}
        selectedId={selectedTenant?.id}
        colors={colors}
      />
    </>
  );
}
