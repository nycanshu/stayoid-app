import {
  View, Text, TextInput, Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserIcon, BriefcaseIcon, IdentificationCardIcon,
  UsersThreeIcon, HouseIcon, CurrencyInrIcon, MapPinIcon,
  CalendarIcon, CaretDownIcon, PlusIcon, BedIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { useCreateTenant, useUpdateTenant } from '../../lib/hooks/use-tenants';
import {
  tenantFormSchema, type TenantFormValues,
} from '../../lib/validations/tenant';
import {
  formatCurrency, formatFloorName,
  GENDER_LABELS, WORK_TYPE_LABELS, ID_PROOF_LABELS,
} from '../../lib/utils/formatters';
import { SlotPickerModal } from './SlotPickerModal';
import { Entrance } from '../animations';
import type { AppColors } from '../../lib/theme/colors';
import type {
  Gender, WorkType, IdProofType, Tenant,
} from '../../types/tenant';
import type { Slot, Property } from '../../types/property';

// ── Date helpers (local, no UTC drift) ────────────────────────────────────────
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

// ── Phone mask: digits only, max 10 ───────────────────────────────────────────
function unmaskPhone(s: string) { return s.replace(/\D/g, '').slice(0, 10); }
function displayPhone(s: string) {
  const d = unmaskPhone(s);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

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

function SectionCard({
  title, Icon, colors, children,
}: {
  title: string;
  Icon: React.ComponentType<{ size: number; color: string; weight?: any }>;
  colors: AppColors;
  children: React.ReactNode;
}) {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 16, marginBottom: 12,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Icon size={16} color={colors.mutedFg} weight="duotone" />
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function FormTextInput({
  value, onChangeText, onBlur, placeholder, error, colors, ...rest
}: {
  value: string; onChangeText: (v: string) => void; onBlur?: () => void;
  placeholder: string; error?: boolean; colors: AppColors;
} & Omit<React.ComponentProps<typeof TextInput>, 'value' | 'onChangeText' | 'onBlur' | 'placeholder' | 'style'>) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.mutedFg}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      style={{
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: error ? colors.danger : colors.border,
        borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 12,
        color: colors.foreground,
        fontSize: 14, fontFamily: 'Inter_400Regular',
      }}
      {...rest}
    />
  );
}

function PillPicker<T extends string>({
  options, value, onChange, colors, withClear,
}: {
  options: { value: T; label: string }[];
  value: T | '';
  onChange: (v: T | '') => void;
  colors: AppColors;
  withClear?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {withClear && (
        <Pressable
          onPress={() => onChange('')}
          android_ripple={null}
          style={{
            borderWidth: 1, borderColor: !value ? colors.primary : colors.border,
            backgroundColor: !value ? `${colors.primary}18` : colors.background,
            borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7,
          }}
        >
          <Text style={{
            color: !value ? colors.primary : colors.foreground,
            fontSize: 12, fontFamily: 'Inter_600SemiBold',
          }}>
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
            style={{
              borderWidth: selected ? 1.5 : 1,
              borderColor: selected ? colors.primary : colors.border,
              backgroundColor: selected ? `${colors.primary}18` : colors.background,
              borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7,
            }}
          >
            <Text style={{
              color: selected ? colors.primary : colors.foreground,
              fontSize: 12, fontFamily: 'Inter_600SemiBold',
            }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SubmitButton({
  onPress, label, loadingLabel, loading, disabled, colors,
}: {
  onPress: () => void; label: string; loadingLabel: string;
  loading: boolean; disabled: boolean; colors: AppColors;
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
          {loading ? loadingLabel : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function pickDate(
  title: string,
  onPick: (iso: string) => void,
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
  Alert.alert(title, undefined, [
    ...opts.map((o) => ({ text: o.label, onPress: () => onPick(o.iso) })),
    { text: 'Cancel', style: 'cancel' as const },
  ]);
}

// ── Form props ────────────────────────────────────────────────────────────────
interface TenantFormProps {
  mode: 'create' | 'edit';
  /** For edit mode — existing tenant being edited */
  tenant?: Tenant;
  /** Optional URL params */
  lockedPropertySlug?: string;
  onSuccess: (slug: string) => void;
  onCancel: () => void;
  colors: AppColors;
}

export function TenantForm({
  mode, tenant, lockedPropertySlug, onSuccess, onCancel, colors,
}: TenantFormProps) {
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();

  const [pickerOpen, setPickerOpen]               = useState(false);
  const [selectedSlot, setSelectedSlot]           = useState<Slot | null>(null);
  const [selectedProperty, setSelectedProperty]   = useState<Property | null>(null);

  const today = new Date();

  // Defaults — pre-filled in edit mode
  const defaultValues: TenantFormValues = {
    name:                    tenant?.name ?? '',
    phone:                   tenant?.phone ?? '',
    gender:                  (tenant?.gender ?? 'MALE') as Gender,
    permanent_address:       tenant?.permanent_address ?? '',
    join_date:               tenant?.join_date ?? toISO(today),
    deposit_amount:          tenant?.deposit_amount ?? '',
    slot_id:                 tenant ? '' : '',  // edit mode: only set when slot is changed
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

  // In edit mode, the slot picker is optional — if user doesn't change it,
  // we don't include slot_id in the PATCH. So we tweak validation: in edit
  // mode, slot_id can be empty (treated as "keep current slot").
  // We achieve this by setting a sentinel slot_id once the form mounts in edit
  // mode so Zod's `min(1)` passes without requiring the user to pick.
  useEffect(() => {
    if (mode === 'edit' && tenant) {
      reset({ ...defaultValues, slot_id: 'KEEP_CURRENT' });
    }
  }, [mode, tenant?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const joinDate = watch('join_date');
  const gender   = watch('gender');
  const workType = watch('work_type');
  const idType   = watch('id_proof_type');

  // Push slot selection into form when picked, and refresh deposit suggestion.
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
        // Edit mode: only send slot_id if user explicitly changed it
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

  // For display: in edit mode, fall back to tenant's existing slot info
  const displaySlot = selectedSlot
    ? {
        propertyName:  selectedProperty?.name ?? '',
        floorNumber:   selectedSlot.floor_number,
        unitNumber:    selectedSlot.unit_number,
        slotNumber:    selectedSlot.slot_number,
        monthlyRent:   slotRent,
      }
    : tenant
    ? {
        propertyName: tenant.property_name,
        floorNumber:  null as number | null,
        unitNumber:   tenant.unit_number,
        slotNumber:   tenant.slot_number,
        monthlyRent:  Number(tenant.monthly_rent),
      }
    : null;

  return (
    <>
      {/* ── 1. Slot assignment ── */}
      <Entrance trigger={1}>
        <SectionCard title="Slot assignment" Icon={HouseIcon} colors={colors}>
          {displaySlot ? (
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
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: `${colors.primary}22`,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <BedIcon size={16} color={colors.primary} weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}
                >
                  {displaySlot.propertyName}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}
                >
                  {displaySlot.floorNumber !== null
                    ? `${formatFloorName(displaySlot.floorNumber)} · `
                    : ''}
                  Unit {displaySlot.unitNumber} · Slot {displaySlot.slotNumber}
                </Text>
                {displaySlot.monthlyRent > 0 && (
                  <Text style={{ color: colors.foreground, fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 2 }}>
                    {formatCurrency(displaySlot.monthlyRent)}<Text style={{ color: colors.mutedFg, fontFamily: 'Inter_400Regular' }}>/mo</Text>
                  </Text>
                )}
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
                Select Vacant Slot
              </Text>
            </Pressable>
          )}
          {mode === 'edit' && (
            <Text style={{
              color: colors.mutedFg, fontSize: 11,
              fontFamily: 'Inter_400Regular', marginTop: 8, lineHeight: 16,
            }}>
              Tap to move this tenant to a different vacant slot. Leave as-is to keep current slot.
            </Text>
          )}
          <FieldError message={errors.slot_id?.message} colors={colors} />
        </SectionCard>
      </Entrance>

      {/* ── 2. Personal info ── */}
      <Entrance trigger={1} delay={40}>
        <SectionCard title="Personal information" Icon={UserIcon} colors={colors}>
          <View style={{ marginBottom: 16 }}>
            <FieldLabel required colors={colors}>Full name</FieldLabel>
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
                  colors={colors}
                />
              )}
            />
            <FieldError message={errors.name?.message} colors={colors} />
          </View>

          <View style={{ marginBottom: 16 }}>
            <FieldLabel required colors={colors}>Phone</FieldLabel>
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
                  colors={colors}
                />
              )}
            />
            <FieldError message={errors.phone?.message} colors={colors} />
          </View>

          <View style={{ marginBottom: 16 }}>
            <FieldLabel required colors={colors}>Gender</FieldLabel>
            <PillPicker<Gender>
              options={[
                { value: 'MALE',   label: GENDER_LABELS.MALE   },
                { value: 'FEMALE', label: GENDER_LABELS.FEMALE },
                { value: 'OTHER',  label: GENDER_LABELS.OTHER  },
              ]}
              value={gender}
              onChange={(v) => v && setValue('gender', v as Gender, { shouldValidate: true, shouldDirty: true })}
              colors={colors}
            />
          </View>

          <View>
            <FieldLabel colors={colors}>Email</FieldLabel>
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
                  colors={colors}
                />
              )}
            />
            <FieldError message={errors.email?.message} colors={colors} />
          </View>
        </SectionCard>
      </Entrance>

      {/* ── 3. Permanent address ── */}
      <Entrance trigger={1} delay={80}>
        <SectionCard title="Permanent address" Icon={MapPinIcon} colors={colors}>
          <Controller
            control={control}
            name="permanent_address"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Hometown / permanent address"
                placeholderTextColor={colors.mutedFg}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: errors.permanent_address ? colors.danger : colors.border,
                  borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 14, fontFamily: 'Inter_400Regular',
                  minHeight: 70,
                }}
              />
            )}
          />
          <FieldError message={errors.permanent_address?.message} colors={colors} />
        </SectionCard>
      </Entrance>

      {/* ── 4. Work ── */}
      <Entrance trigger={1} delay={120}>
        <SectionCard title="Work (optional)" Icon={BriefcaseIcon} colors={colors}>
          <View style={{ marginBottom: 16 }}>
            <FieldLabel colors={colors}>Type</FieldLabel>
            <PillPicker<WorkType>
              options={Object.entries(WORK_TYPE_LABELS).map(([v, l]) => ({ value: v as WorkType, label: l }))}
              value={(workType ?? '') as WorkType | ''}
              onChange={(v) => setValue('work_type', v as WorkType | '', { shouldDirty: true })}
              colors={colors}
              withClear
            />
          </View>
          <View>
            <FieldLabel colors={colors}>Work location</FieldLabel>
            <Controller
              control={control}
              name="work_location"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormTextInput
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Company / area"
                  colors={colors}
                />
              )}
            />
          </View>
        </SectionCard>
      </Entrance>

      {/* ── 5. ID proof ── */}
      <Entrance trigger={1} delay={160}>
        <SectionCard title="ID proof (optional)" Icon={IdentificationCardIcon} colors={colors}>
          <View style={{ marginBottom: 16 }}>
            <FieldLabel colors={colors}>Type</FieldLabel>
            <PillPicker<IdProofType>
              options={Object.entries(ID_PROOF_LABELS).map(([v, l]) => ({ value: v as IdProofType, label: l }))}
              value={(idType ?? '') as IdProofType | ''}
              onChange={(v) => setValue('id_proof_type', v as IdProofType | '', { shouldDirty: true })}
              colors={colors}
              withClear
            />
          </View>
          <View>
            <FieldLabel colors={colors}>ID number</FieldLabel>
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
                  colors={colors}
                />
              )}
            />
          </View>
        </SectionCard>
      </Entrance>

      {/* ── 6. Emergency contact ── */}
      <Entrance trigger={1} delay={200}>
        <SectionCard title="Emergency contact (optional)" Icon={UsersThreeIcon} colors={colors}>
          <View style={{ marginBottom: 16 }}>
            <FieldLabel colors={colors}>Name</FieldLabel>
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
                  colors={colors}
                />
              )}
            />
          </View>
          <View>
            <FieldLabel colors={colors}>Phone</FieldLabel>
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
                  colors={colors}
                />
              )}
            />
            <FieldError message={errors.emergency_contact_phone?.message} colors={colors} />
          </View>
        </SectionCard>
      </Entrance>

      {/* ── 7. Financial details ── */}
      <Entrance trigger={1} delay={240}>
        <SectionCard title="Financial details" Icon={CurrencyInrIcon} colors={colors}>
          <View style={{ marginBottom: 16 }}>
            <FieldLabel required colors={colors}>Join date</FieldLabel>
            <Pressable
              onPress={() => pickDate('Join date', (iso) => setValue('join_date', iso, { shouldValidate: true, shouldDirty: true }))}
              android_ripple={null}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: colors.background,
                borderWidth: 1, borderColor: errors.join_date ? colors.danger : colors.border,
                borderRadius: 10, paddingHorizontal: 14, height: 46,
              }}
            >
              <CalendarIcon size={14} color={colors.mutedFg} />
              <Text style={{ flex: 1, color: colors.foreground, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
                {formatDisplayDate(joinDate)}
              </Text>
              <CaretDownIcon size={12} color={colors.mutedFg} />
            </Pressable>
            <FieldError message={errors.join_date?.message} colors={colors} />
          </View>

          <View>
            <FieldLabel required colors={colors}>Deposit amount</FieldLabel>
            <Controller
              control={control}
              name="deposit_amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: errors.deposit_amount ? colors.danger : colors.border,
                  borderRadius: 10, paddingHorizontal: 14,
                }}>
                  <Text style={{ color: colors.mutedFg, fontSize: 14, fontFamily: 'Inter_400Regular', marginRight: 6 }}>
                    ₹
                  </Text>
                  <TextInput
                    placeholder={slotRent > 0 ? String(slotRent) : '10000'}
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
                </View>
              )}
            />
            <FieldError message={errors.deposit_amount?.message} colors={colors} />
            {mode === 'create' && slotRent > 0 && (
              <Text style={{
                color: colors.mutedFg, fontSize: 11,
                fontFamily: 'Inter_400Regular', marginTop: 6, lineHeight: 16,
              }}>
                Suggested from slot rent. Override if you collected a different deposit.
              </Text>
            )}
          </View>
        </SectionCard>
      </Entrance>

      {/* ── Actions ── */}
      <Entrance trigger={1} delay={280}>
        <View style={{ gap: 10 }}>
          <SubmitButton
            onPress={handleSubmit(onSubmit)}
            label={submitLabel}
            loadingLabel={loadingLabel}
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
        colors={colors}
      />
    </>
  );
}
