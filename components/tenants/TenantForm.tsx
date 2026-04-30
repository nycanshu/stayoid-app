import {
  View, Text, TextInput, Pressable, ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserIcon, BriefcaseIcon, IdentificationCardIcon,
  UsersThreeIcon, HouseIcon, CurrencyInrIcon, MapPinIcon,
  CalendarIcon, CaretDownIcon, PlusIcon, BedIcon,
} from 'phosphor-react-native';
import * as Haptics from '@/lib/utils/haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import { useCreateTenant, useUpdateTenant } from '../../lib/hooks/use-tenants';
import {
  tenantFormSchema, type TenantFormValues,
} from '../../lib/validations/tenant';
import {
  formatCurrency, formatFloorName,
  GENDER_LABELS, WORK_TYPE_LABELS, ID_PROOF_LABELS,
} from '../../lib/utils/formatters';
import { getPropertyTypeLabels } from '../../lib/constants/property-type-meta';
import { SlotPickerModal } from './SlotPickerModal';
import { useActionSheet } from '../ui/ActionSheet';
import { Entrance } from '../animations';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type {
  Gender, WorkType, IdProofType, Tenant,
} from '../../types/tenant';
import type { Slot, Property } from '../../types/property';

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function formatDisplayDate(s?: string) {
  if (!s) return 'Pick a date';
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function unmaskPhone(s: string) { return s.replace(/\D/g, '').slice(0, 10); }
function displayPhone(s: string) {
  const d = unmaskPhone(s);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

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

function SectionCard({
  title, Icon, mutedFg, children,
}: {
  title: string;
  Icon: React.ComponentType<{ size: number; color: string; weight?: any }>;
  mutedFg: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-card border border-border rounded-xl p-4 mb-3">
      <View className="flex-row items-center gap-2 mb-[18px]">
        <Icon size={16} color={mutedFg} weight="duotone" />
        <Text
          className="text-foreground text-sm"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function FormTextInput({
  value, onChangeText, onBlur, placeholder, error, mutedFg, ...rest
}: {
  value: string; onChangeText: (v: string) => void; onBlur?: () => void;
  placeholder: string; error?: boolean; mutedFg: string;
} & Omit<React.ComponentProps<typeof TextInput>, 'value' | 'onChangeText' | 'onBlur' | 'placeholder' | 'style'>) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={mutedFg}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      className={cn(
        'bg-background border rounded-[10px] px-3.5 py-3 text-foreground text-sm',
        error ? 'border-destructive' : 'border-border',
      )}
      style={{ fontFamily: 'Inter_400Regular' }}
      {...rest}
    />
  );
}

function PillPicker<T extends string>({
  options, value, onChange, withClear,
}: {
  options: { value: T; label: string }[];
  value: T | '';
  onChange: (v: T | '') => void;
  withClear?: boolean;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {withClear && (
        <Pressable
          onPress={() => onChange('')}
          android_ripple={null}
          className={cn(
            'rounded-full px-3 py-1.5 border',
            !value ? 'bg-primary-bg border-primary' : 'bg-background border-border',
          )}
        >
          <Text
            className={cn(
              'text-xs',
              !value ? 'text-primary' : 'text-foreground',
            )}
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            None
          </Text>
        </Pressable>
      )}
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(opt.value);
            }}
            android_ripple={null}
            className={cn(
              'rounded-full px-3 py-1.5',
              selected
                ? 'bg-primary-bg border-[1.5px] border-primary'
                : 'bg-background border border-border',
            )}
          >
            <Text
              className={cn(
                'text-xs',
                selected ? 'text-primary' : 'text-foreground',
              )}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SubmitButton({
  onPress, label, loadingLabel, loading, disabled, mutedFg,
}: {
  onPress: () => void; label: string; loadingLabel: string;
  loading: boolean; disabled: boolean; mutedFg: string;
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
          {loading ? loadingLabel : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

type ShowActionSheet = ReturnType<typeof useActionSheet>['show'];

function pickDate(
  title: string,
  selected: string | undefined,
  onPick: (iso: string) => void,
  show: ShowActionSheet,
) {
  const today = new Date();
  const days = [0, 7, 14, 30, 60, 90, 180, 365];
  const opts = days.map((d) => {
    const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() - d);
    return {
      label: d === 0 ? 'Today'
        : d === 1 ? 'Yesterday'
        : d < 30 ? `${d} days ago`
        : d < 365 ? `${Math.round(d / 30)} months ago`
        : `${Math.round(d / 365)} year${d >= 730 ? 's' : ''} ago`,
      iso: toISO(dt),
    };
  });
  show({
    title,
    options: opts.map((o) => ({
      label:    o.label,
      selected: o.iso === selected,
      onPress:  () => onPick(o.iso),
    })),
  });
}

interface TenantFormProps {
  mode: 'create' | 'edit';
  tenant?: Tenant;
  lockedPropertySlug?: string;
  onSuccess: (slug: string) => void;
  onCancel: () => void;
}

export function TenantForm({
  mode, tenant, lockedPropertySlug, onSuccess, onCancel,
}: TenantFormProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { show: showActionSheet } = useActionSheet();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();

  const [pickerOpen, setPickerOpen]               = useState(false);
  const [selectedSlot, setSelectedSlot]           = useState<Slot | null>(null);
  const [selectedProperty, setSelectedProperty]   = useState<Property | null>(null);

  const today = new Date();

  const defaultValues: TenantFormValues = {
    name:                    tenant?.name ?? '',
    phone:                   tenant?.phone ?? '',
    gender:                  (tenant?.gender ?? 'MALE') as Gender,
    permanent_address:       tenant?.permanent_address ?? '',
    join_date:               tenant?.join_date ?? toISO(today),
    deposit_amount:          tenant?.deposit_amount ?? '',
    slot_id:                 '',
    email:                   tenant?.email ?? '',
    work_type:               (tenant?.work_type ?? '') as WorkType | '',
    work_location:           tenant?.work_location ?? '',
    id_proof_type:           (tenant?.id_proof_type ?? '') as IdProofType | '',
    id_proof_number:         tenant?.id_proof_number ?? '',
    emergency_contact_name:  tenant?.emergency_contact_name ?? '',
    emergency_contact_phone: tenant?.emergency_contact_phone ?? '',
  };

  const {
    control, handleSubmit, watch, setValue, reset,
    formState: { errors, isValid },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    mode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    if (mode === 'edit' && tenant) {
      reset({ ...defaultValues, slot_id: 'KEEP_CURRENT' });
    }
  }, [mode, tenant?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const joinDate = watch('join_date');
  const gender   = watch('gender');
  const workType = watch('work_type');
  const idType   = watch('id_proof_type');

  useEffect(() => {
    if (selectedSlot) {
      setValue('slot_id', selectedSlot.id, { shouldValidate: true, shouldDirty: true });
      const rent = Number(selectedSlot.monthly_rent);
      const current = watch('deposit_amount');
      if (rent > 0 && (mode === 'create' ? !current : false)) {
        setValue('deposit_amount', String(rent));
      }
    }
  }, [selectedSlot?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSubmitting = createTenant.isPending || updateTenant.isPending;

  const onSubmit = async (values: TenantFormValues) => {
    try {
      if (mode === 'create') {
        const created = await createTenant.mutateAsync({
          slot_id:                 values.slot_id,
          name:                    values.name,
          phone:                   values.phone,
          gender:                  values.gender as Gender,
          permanent_address:       values.permanent_address,
          join_date:               values.join_date,
          deposit_amount:          values.deposit_amount,
          email:                   values.email || undefined,
          work_type:               (values.work_type || undefined) as WorkType | undefined,
          work_location:           values.work_location || undefined,
          id_proof_type:           (values.id_proof_type || undefined) as IdProofType | undefined,
          id_proof_number:         values.id_proof_number || undefined,
          emergency_contact_name:  values.emergency_contact_name || undefined,
          emergency_contact_phone: values.emergency_contact_phone || undefined,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess(created.slug);
      } else if (tenant) {
        const slotChanged = values.slot_id && values.slot_id !== 'KEEP_CURRENT';
        const updated = await updateTenant.mutateAsync({
          id: tenant.id,
          data: {
            name:                    values.name,
            phone:                   values.phone,
            gender:                  values.gender as Gender,
            permanent_address:       values.permanent_address,
            join_date:               values.join_date,
            deposit_amount:          values.deposit_amount,
            email:                   values.email || undefined,
            work_type:               (values.work_type || undefined) as WorkType | undefined,
            work_location:           values.work_location || undefined,
            id_proof_type:           (values.id_proof_type || undefined) as IdProofType | undefined,
            id_proof_number:         values.id_proof_number || undefined,
            emergency_contact_name:  values.emergency_contact_name || undefined,
            emergency_contact_phone: values.emergency_contact_phone || undefined,
            ...(slotChanged ? { slot_id: values.slot_id } : {}),
          },
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess(updated.slug);
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const slotRent = selectedSlot ? Number(selectedSlot.monthly_rent) : 0;
  const submitDisabled = mode === 'create' ? (!isValid || !selectedSlot) : !isValid;
  const submitLabel    = mode === 'create' ? 'Add Tenant' : 'Save Changes';
  const loadingLabel   = mode === 'create' ? 'Adding…' : 'Saving…';

  let displaySlot: {
    propertyName: string;
    floorNumber: number | null;
    unitNumber: string;
    slotNumber: string;
    monthlyRent: number;
  } | null = null;
  if (selectedSlot) {
    displaySlot = {
      propertyName: selectedProperty?.name ?? '',
      floorNumber: selectedSlot.floor_number,
      unitNumber: selectedSlot.unit_number,
      slotNumber: selectedSlot.slot_number,
      monthlyRent: slotRent,
    };
  } else if (tenant) {
    displaySlot = {
      propertyName: tenant.property_name,
      floorNumber: null,
      unitNumber: tenant.unit_number,
      slotNumber: tenant.slot_number,
      monthlyRent: Number(tenant.monthly_rent),
    };
  }

  // Drive label vocabulary from whichever property type we know about.
  const labels = getPropertyTypeLabels(
    selectedSlot?.property_type
    ?? selectedProperty?.property_type
    ?? tenant?.property_type,
  );

  return (
    <>
      <Entrance trigger={1}>
        <SectionCard title={`${labels.slotLabel} assignment`} Icon={HouseIcon} mutedFg={palette.mutedForeground}>
          {displaySlot ? (
            <Pressable
              onPress={() => setPickerOpen(true)}
              android_ripple={null}
              className="bg-background border border-border rounded-[10px] p-3 flex-row items-center gap-3"
            >
              <View className="size-9 rounded-[10px] bg-primary-bg items-center justify-center">
                <BedIcon size={16} color={palette.primary} weight="duotone" />
              </View>
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="text-foreground text-sm"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {displaySlot.propertyName}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-muted-foreground text-[11px] mt-0.5"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {displaySlot.floorNumber !== null
                    ? `${formatFloorName(displaySlot.floorNumber)} · `
                    : ''}
                  {labels.unitLabel} {displaySlot.unitNumber} · {labels.slotLabel} {displaySlot.slotNumber}
                </Text>
                {displaySlot.monthlyRent > 0 && (
                  <Text
                    className="text-foreground text-[11px] mt-0.5"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    {formatCurrency(displaySlot.monthlyRent)}
                    <Text
                      className="text-muted-foreground"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      /mo
                    </Text>
                  </Text>
                )}
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
                Select Vacant {labels.slotLabel}
              </Text>
            </Pressable>
          )}
          {mode === 'edit' && (
            <Text
              className="text-muted-foreground text-[11px] mt-2 leading-4"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              Tap to move this tenant to a different vacant slot. Leave as-is to keep current slot.
            </Text>
          )}
          <FieldError message={errors.slot_id?.message} />
        </SectionCard>
      </Entrance>

      <Entrance trigger={1} delay={40}>
        <SectionCard title="Personal information" Icon={UserIcon} mutedFg={palette.mutedForeground}>
          <View className="mb-4">
            <FieldLabel required>Full name</FieldLabel>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormTextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. Anjali Sharma"
                  autoCapitalize="words"
                  returnKeyType="next"
                  error={!!errors.name}
                  mutedFg={palette.mutedForeground}
                />
              )}
            />
            <FieldError message={errors.name?.message} />
          </View>

          <View className="mb-4">
            <FieldLabel required>Phone</FieldLabel>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormTextInput
                  value={displayPhone(value ?? '')}
                  onChangeText={(v) => onChange(unmaskPhone(v))}
                  onBlur={onBlur}
                  placeholder="98765 43210"
                  keyboardType="phone-pad"
                  inputMode="tel"
                  maxLength={11}
                  error={!!errors.phone}
                  mutedFg={palette.mutedForeground}
                />
              )}
            />
            <FieldError message={errors.phone?.message} />
          </View>

          <View className="mb-4">
            <FieldLabel required>Gender</FieldLabel>
            <PillPicker<Gender>
              options={[
                { value: 'MALE',   label: GENDER_LABELS.MALE   },
                { value: 'FEMALE', label: GENDER_LABELS.FEMALE },
                { value: 'OTHER',  label: GENDER_LABELS.OTHER  },
              ]}
              value={gender}
              onChange={(v) => v && setValue('gender', v as Gender, { shouldValidate: true, shouldDirty: true })}
            />
          </View>

          <View>
            <FieldLabel>Email</FieldLabel>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormTextInput
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="email@example.com (optional)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!errors.email}
                  mutedFg={palette.mutedForeground}
                />
              )}
            />
            <FieldError message={errors.email?.message} />
          </View>
        </SectionCard>
      </Entrance>

      <Entrance trigger={1} delay={80}>
        <SectionCard title="Permanent address" Icon={MapPinIcon} mutedFg={palette.mutedForeground}>
          <Controller
            control={control}
            name="permanent_address"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Hometown / permanent address"
                placeholderTextColor={palette.mutedForeground}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className={cn(
                  'bg-background border rounded-[10px] px-3.5 py-3 text-foreground text-sm min-h-[70px]',
                  errors.permanent_address ? 'border-destructive' : 'border-border',
                )}
                style={{ fontFamily: 'Inter_400Regular' }}
              />
            )}
          />
          <FieldError message={errors.permanent_address?.message} />
        </SectionCard>
      </Entrance>

      <Entrance trigger={1} delay={120}>
        <SectionCard title="Work (optional)" Icon={BriefcaseIcon} mutedFg={palette.mutedForeground}>
          <View className="mb-4">
            <FieldLabel>Type</FieldLabel>
            <PillPicker<WorkType>
              options={Object.entries(WORK_TYPE_LABELS).map(([v, l]) => ({ value: v as WorkType, label: l }))}
              value={(workType ?? '') as WorkType | ''}
              onChange={(v) => setValue('work_type', v as WorkType | '', { shouldDirty: true })}
              withClear
            />
          </View>
          <View>
            <FieldLabel>Work location</FieldLabel>
            <Controller
              control={control}
              name="work_location"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormTextInput
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Company / area"
                  mutedFg={palette.mutedForeground}
                />
              )}
            />
          </View>
        </SectionCard>
      </Entrance>

      <Entrance trigger={1} delay={160}>
        <SectionCard title="ID proof (optional)" Icon={IdentificationCardIcon} mutedFg={palette.mutedForeground}>
          <View className="mb-4">
            <FieldLabel>Type</FieldLabel>
            <PillPicker<IdProofType>
              options={Object.entries(ID_PROOF_LABELS).map(([v, l]) => ({ value: v as IdProofType, label: l }))}
              value={(idType ?? '') as IdProofType | ''}
              onChange={(v) => setValue('id_proof_type', v as IdProofType | '', { shouldDirty: true })}
              withClear
            />
          </View>
          <View>
            <FieldLabel>ID number</FieldLabel>
            <Controller
              control={control}
              name="id_proof_number"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormTextInput
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter ID number"
                  autoCapitalize="characters"
                  mutedFg={palette.mutedForeground}
                />
              )}
            />
          </View>
        </SectionCard>
      </Entrance>

      <Entrance trigger={1} delay={200}>
        <SectionCard title="Emergency contact (optional)" Icon={UsersThreeIcon} mutedFg={palette.mutedForeground}>
          <View className="mb-4">
            <FieldLabel>Name</FieldLabel>
            <Controller
              control={control}
              name="emergency_contact_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormTextInput
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Contact name"
                  autoCapitalize="words"
                  mutedFg={palette.mutedForeground}
                />
              )}
            />
          </View>
          <View>
            <FieldLabel>Phone</FieldLabel>
            <Controller
              control={control}
              name="emergency_contact_phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormTextInput
                  value={displayPhone(value ?? '')}
                  onChangeText={(v) => onChange(unmaskPhone(v))}
                  onBlur={onBlur}
                  placeholder="98765 43210"
                  keyboardType="phone-pad"
                  inputMode="tel"
                  maxLength={11}
                  error={!!errors.emergency_contact_phone}
                  mutedFg={palette.mutedForeground}
                />
              )}
            />
            <FieldError message={errors.emergency_contact_phone?.message} />
          </View>
        </SectionCard>
      </Entrance>

      <Entrance trigger={1} delay={240}>
        <SectionCard title="Financial details" Icon={CurrencyInrIcon} mutedFg={palette.mutedForeground}>
          <View className="mb-4">
            <FieldLabel required>Join date</FieldLabel>
            <Pressable
              onPress={() => pickDate(
                'Join date',
                joinDate,
                (iso) => setValue('join_date', iso, { shouldValidate: true, shouldDirty: true }),
                showActionSheet,
              )}
              android_ripple={null}
              className={cn(
                'flex-row items-center gap-2.5 bg-background border rounded-[10px] px-3.5 h-[46px]',
                errors.join_date ? 'border-destructive' : 'border-border',
              )}
            >
              <CalendarIcon size={14} color={palette.mutedForeground} />
              <Text
                className="flex-1 text-foreground text-sm"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {formatDisplayDate(joinDate)}
              </Text>
              <CaretDownIcon size={12} color={palette.mutedForeground} />
            </Pressable>
            <FieldError message={errors.join_date?.message} />
          </View>

          <View>
            <FieldLabel required>Deposit amount</FieldLabel>
            <Controller
              control={control}
              name="deposit_amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className={cn(
                    'flex-row items-center bg-background border rounded-[10px] px-3.5',
                    errors.deposit_amount ? 'border-destructive' : 'border-border',
                  )}
                >
                  <Text
                    className="text-muted-foreground text-sm mr-1.5"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    ₹
                  </Text>
                  <TextInput
                    placeholder={slotRent > 0 ? String(slotRent) : '10000'}
                    placeholderTextColor={palette.mutedForeground}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    inputMode="numeric"
                    className="flex-1 text-foreground text-sm py-3"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  />
                </View>
              )}
            />
            <FieldError message={errors.deposit_amount?.message} />
            {mode === 'create' && slotRent > 0 && (
              <Text
                className="text-muted-foreground text-[11px] mt-1.5 leading-4"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Suggested from slot rent. Override if you collected a different deposit.
              </Text>
            )}
          </View>
        </SectionCard>
      </Entrance>

      <Entrance trigger={1} delay={280}>
        <View className="gap-2.5">
          <SubmitButton
            onPress={handleSubmit(onSubmit)}
            label={submitLabel}
            loadingLabel={loadingLabel}
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
      </Entrance>

      <SlotPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(slot, prop) => {
          setSelectedSlot(slot);
          setSelectedProperty(prop);
        }}
        selectedSlotId={selectedSlot?.id}
        lockedPropertySlug={lockedPropertySlug}
      />
    </>
  );
}
