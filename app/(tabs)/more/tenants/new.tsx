import {
  View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeftIcon, UserIcon, BriefcaseIcon, IdentificationCardIcon,
  UsersThreeIcon, HouseIcon, CurrencyInrIcon, MapPinIcon,
  CalendarIcon, CaretDownIcon, PlusIcon, BedIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { useCreateTenant } from '../../../../lib/hooks/use-tenants';
import { useColors } from '../../../../lib/hooks/use-colors';
import {
  tenantFormSchema, type TenantFormValues,
} from '../../../../lib/validations/tenant';
import {
  formatCurrency, formatFloorName,
  GENDER_LABELS, WORK_TYPE_LABELS, ID_PROOF_LABELS,
} from '../../../../lib/utils/formatters';
import { SlotPickerModal } from '../../../../components/tenants/SlotPickerModal';
import { Entrance } from '../../../../components/animations';
import type { AppColors } from '../../../../lib/theme/colors';
import type {
  Gender, WorkType, IdProofType,
} from '../../../../types/tenant';
import type { Slot, Property } from '../../../../types/property';

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

// ── Reusable text-input with consistent styling ───────────────────────────────
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

// ── Pill picker (for gender, work type, id proof type) ────────────────────────
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

// ── Submit button ─────────────────────────────────────────────────────────────
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
          {loading ? 'Adding…' : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Date picker via Alert sheet ────────────────────────────────────────────────
function pickDate(
  title: string,
  onPick: (iso: string) => void,
  range: 'past' | 'recent' = 'past',
) {
  const today = new Date();
  const days = range === 'recent' ? [0, 1, 2, 3, 7] : [0, 7, 14, 30, 60, 90, 180, 365];
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

// ── Screen ────────────────────────────────────────────────────────────────────
export default function NewTenantScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ property?: string; slot?: string }>();
  const createTenant = useCreateTenant();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const today = new Date();

  const {
    control, handleSubmit, watch, setValue,
    formState: { errors, isValid },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    mode: 'onChange',
    defaultValues: {
      name:                    '',
      phone:                   '',
      gender:                  'MALE',
      permanent_address:       '',
      join_date:               toISO(today),
      deposit_amount:          '',
      slot_id:                 '',
      email:                   '',
      work_type:               '',
      work_location:           '',
      id_proof_type:           '',
      id_proof_number:         '',
      emergency_contact_name:  '',
      emergency_contact_phone: '',
    },
  });

  const joinDate = watch('join_date');
  const gender   = watch('gender');
  const workType = watch('work_type');
  const idType   = watch('id_proof_type');

  // Push slot selection into form. Refresh deposit suggestion to monthly_rent
  // when a slot is picked (user can override).
  useEffect(() => {
    if (selectedSlot) {
      setValue('slot_id', selectedSlot.id, { shouldValidate: true });
      const rent = Number(selectedSlot.monthly_rent);
      if (rent > 0) {
        const current = watch('deposit_amount');
        if (!current) setValue('deposit_amount', String(rent));
      }
    }
  }, [selectedSlot?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSubmitting = createTenant.isPending;

  const onSubmit = async (values: TenantFormValues) => {
    try {
      await createTenant.mutateAsync({
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
      router.replace('/(tabs)/more/tenants');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const slotRent = selectedSlot ? Number(selectedSlot.monthly_rent) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <Entrance trigger={1} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Pressable
                onPress={() => router.back()}
                android_ripple={null}
                hitSlop={8}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  borderWidth: 1, borderColor: colors.border,
                  backgroundColor: colors.card,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ArrowLeftIcon size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <Text style={{
              color: colors.foreground,
              fontSize: 22, fontFamily: 'Inter_600SemiBold',
              letterSpacing: -0.3, paddingRight: 0.3,
            }}>
              Add Tenant
            </Text>
            <Text style={{
              color: colors.mutedFg, fontSize: 13,
              fontFamily: 'Inter_400Regular', marginTop: 2,
            }}>
              {params.property
                ? 'Property pre-selected — pick a vacant slot'
                : 'Add a tenant and assign them to a vacant slot'}
            </Text>
          </Entrance>

          {/* ── 1. Slot assignment (top — most important) ── */}
          <Entrance trigger={1} delay={60}>
            <SectionCard title="Slot assignment" Icon={HouseIcon} colors={colors}>
              {selectedSlot && selectedProperty ? (
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
                      {selectedProperty.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}
                    >
                      {formatFloorName(selectedSlot.floor_number)} · Unit {selectedSlot.unit_number} · Slot {selectedSlot.slot_number}
                    </Text>
                    {slotRent > 0 && (
                      <Text style={{ color: colors.foreground, fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 2 }}>
                        {formatCurrency(slotRent)}<Text style={{ color: colors.mutedFg, fontFamily: 'Inter_400Regular' }}>/mo</Text>
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
              <FieldError message={errors.slot_id?.message} colors={colors} />
            </SectionCard>
          </Entrance>

          {/* ── 2. Personal information ── */}
          <Entrance trigger={1} delay={100}>
            <SectionCard title="Personal information" Icon={UserIcon} colors={colors}>
              {/* Name */}
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

              {/* Phone */}
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
                      maxLength={11}  // 10 digits + 1 space
                      error={!!errors.phone}
                      colors={colors}
                    />
                  )}
                />
                <FieldError message={errors.phone?.message} colors={colors} />
              </View>

              {/* Gender */}
              <View style={{ marginBottom: 16 }}>
                <FieldLabel required colors={colors}>Gender</FieldLabel>
                <PillPicker<Gender>
                  options={[
                    { value: 'MALE',   label: GENDER_LABELS.MALE   },
                    { value: 'FEMALE', label: GENDER_LABELS.FEMALE },
                    { value: 'OTHER',  label: GENDER_LABELS.OTHER  },
                  ]}
                  value={gender}
                  onChange={(v) => v && setValue('gender', v as Gender, { shouldValidate: true })}
                  colors={colors}
                />
              </View>

              {/* Email (optional) */}
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

          {/* ── 3. Address ── */}
          <Entrance trigger={1} delay={140}>
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

          {/* ── 4. Work information (optional) ── */}
          <Entrance trigger={1} delay={180}>
            <SectionCard title="Work (optional)" Icon={BriefcaseIcon} colors={colors}>
              <View style={{ marginBottom: 16 }}>
                <FieldLabel colors={colors}>Type</FieldLabel>
                <PillPicker<WorkType>
                  options={Object.entries(WORK_TYPE_LABELS).map(([v, l]) => ({ value: v as WorkType, label: l }))}
                  value={(workType ?? '') as WorkType | ''}
                  onChange={(v) => setValue('work_type', v as WorkType | '')}
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

          {/* ── 5. ID proof (optional) ── */}
          <Entrance trigger={1} delay={220}>
            <SectionCard title="ID proof (optional)" Icon={IdentificationCardIcon} colors={colors}>
              <View style={{ marginBottom: 16 }}>
                <FieldLabel colors={colors}>Type</FieldLabel>
                <PillPicker<IdProofType>
                  options={Object.entries(ID_PROOF_LABELS).map(([v, l]) => ({ value: v as IdProofType, label: l }))}
                  value={(idType ?? '') as IdProofType | ''}
                  onChange={(v) => setValue('id_proof_type', v as IdProofType | '')}
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

          {/* ── 6. Emergency contact (optional) ── */}
          <Entrance trigger={1} delay={260}>
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
          <Entrance trigger={1} delay={300}>
            <SectionCard title="Financial details" Icon={CurrencyInrIcon} colors={colors}>
              <View style={{ marginBottom: 16 }}>
                <FieldLabel required colors={colors}>Join date</FieldLabel>
                <Pressable
                  onPress={() => pickDate('Join date', (iso) => setValue('join_date', iso, { shouldValidate: true }))}
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
                {slotRent > 0 && (
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
          <Entrance trigger={1} delay={340}>
            <View style={{ gap: 10 }}>
              <SubmitButton
                onPress={handleSubmit(onSubmit)}
                label="Add Tenant"
                loading={isSubmitting}
                disabled={!isValid || !selectedSlot}
                colors={colors}
              />
              <Pressable
                onPress={() => router.back()}
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
        </ScrollView>
      </KeyboardAvoidingView>

      <SlotPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(slot, prop) => {
          setSelectedSlot(slot);
          setSelectedProperty(prop);
        }}
        selectedSlotId={selectedSlot?.id}
        lockedPropertySlug={params.property}
        colors={colors}
      />
    </SafeAreaView>
  );
}
