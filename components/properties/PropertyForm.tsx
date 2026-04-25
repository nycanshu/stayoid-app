import {
  View, Text, TextInput, Pressable, ActivityIndicator,
} from 'react-native';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BuildingsIcon } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import { useCreateProperty, useUpdateProperty } from '../../lib/hooks/use-properties';
import { propertyFormSchema, type PropertyFormValues } from '../../lib/validations/property';
import { getAllPropertyTypeMeta, type PropertyTypeMeta } from '../../lib/constants/property-type-meta';
import { PropertyPreviewCard } from './PropertyPreviewCard';
import type { AppColors } from '../../lib/theme/colors';
import type { PropertyType } from '../../types/property';

const NAME_MAX = 255;

// ── Field primitives ──────────────────────────────────────────────────────────
function FieldLabel({ children, colors }: { children: React.ReactNode; colors: AppColors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 }}>
      <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
        {children}
      </Text>
      <Text style={{ color: colors.danger, fontSize: 13 }}>*</Text>
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

// ── Type option card ──────────────────────────────────────────────────────────
function TypeOption({
  meta, selected, onPress, colors,
}: {
  meta: PropertyTypeMeta; selected: boolean; onPress: () => void; colors: AppColors;
}) {
  const Icon = meta.Icon;
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? colors.primary : colors.border,
        borderRadius: 12,
        padding: 12,
      }}
    >
      <View style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: meta.iconBg,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
      }}>
        <Icon size={18} color={meta.iconColor} weight="fill" />
      </View>
      <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4 }}>
        {meta.longLabel}
      </Text>
      <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 15 }}>
        {meta.description}
      </Text>
    </Pressable>
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
          {loading ? (label === 'Save Changes' ? 'Saving…' : 'Creating…') : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Form component ────────────────────────────────────────────────────────────
interface PropertyFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<PropertyFormValues>;
  /** Required for edit mode — slug used for the update mutation */
  slug?: string;
  onSuccess: (newSlug: string) => void;
  onCancel: () => void;
  colors: AppColors;
}

export function PropertyForm({
  mode, defaultValues, slug, onSuccess, onCancel, colors,
}: PropertyFormProps) {
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();

  const {
    control, handleSubmit, watch, setValue, reset,
    formState: { errors, isValid, isDirty },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: defaultValues?.name ?? '',
      property_type: (defaultValues?.property_type ?? 'PG') as PropertyType,
      address: defaultValues?.address ?? '',
    },
  });

  // Reset form when defaultValues arrive (edit mode loading)
  useEffect(() => {
    if (mode === 'edit' && defaultValues) {
      reset({
        name: defaultValues.name ?? '',
        property_type: (defaultValues.property_type ?? 'PG') as PropertyType,
        address: defaultValues.address ?? '',
      });
    }
  }, [mode, defaultValues?.name, defaultValues?.property_type, defaultValues?.address, reset]);

  const name         = watch('name');
  const propertyType = watch('property_type');
  const address      = watch('address');

  const typeOptions = getAllPropertyTypeMeta(colors);

  // Soft preview opacity hint
  const previewOpacity = useSharedValue(mode === 'edit' ? 1 : 0.75);
  useEffect(() => {
    previewOpacity.value = withTiming(
      mode === 'edit' || name.trim() || address.trim() ? 1 : 0.75,
      { duration: 250 },
    );
  }, [name, address, mode]);
  const previewStyle = useAnimatedStyle(() => ({ opacity: previewOpacity.value }));

  const isSubmitting = createProperty.isPending || updateProperty.isPending;

  const onSubmit = async (values: PropertyFormValues) => {
    try {
      if (mode === 'create') {
        const created = await createProperty.mutateAsync(values);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess(created.slug);
      } else if (mode === 'edit' && slug) {
        const updated = await updateProperty.mutateAsync({ slug, data: values });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess(updated.slug);
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // For edit mode: enable submit when valid (even if !isDirty, so user can re-save)
  const submitDisabled = mode === 'create' ? (!isValid || !isDirty) : !isValid;
  const submitLabel    = mode === 'create' ? 'Create Property' : 'Save Changes';

  return (
    <>
      {/* ── Form card ── */}
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16,
        marginBottom: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <BuildingsIcon size={16} color={colors.mutedFg} weight="duotone" />
          <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
            {mode === 'create' ? 'Property Details' : 'Edit Property'}
          </Text>
        </View>

        {/* Property Name */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel colors={colors}>Property Name</FieldLabel>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="e.g. Sunrise PG"
                placeholderTextColor={colors.mutedFg}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={NAME_MAX}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: errors.name ? colors.danger : colors.border,
                  borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 14, fontFamily: 'Inter_400Regular',
                }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <FieldError message={errors.name?.message} colors={colors} />
            <Text style={{
              color: colors.mutedFg, fontSize: 11,
              fontFamily: 'Inter_400Regular', marginLeft: 'auto',
            }}>
              {(name ?? '').length}/{NAME_MAX}
            </Text>
          </View>
        </View>

        {/* Property Type */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel colors={colors}>Property Type</FieldLabel>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {typeOptions.map((opt) => (
              <TypeOption
                key={opt.value}
                meta={opt}
                selected={propertyType === opt.value}
                onPress={() => {
                  Haptics.selectionAsync();
                  setValue('property_type', opt.value as PropertyType, { shouldDirty: true });
                }}
                colors={colors}
              />
            ))}
          </View>
          <FieldError message={errors.property_type?.message} colors={colors} />
        </View>

        {/* Address */}
        <View>
          <FieldLabel colors={colors}>Address</FieldLabel>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Street, area, city, PIN"
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
                  borderColor: errors.address ? colors.danger : colors.border,
                  borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 14, fontFamily: 'Inter_400Regular',
                  minHeight: 80,
                }}
              />
            )}
          />
          <FieldError message={errors.address?.message} colors={colors} />
        </View>
      </View>

      {/* ── Live Preview ── */}
      <Animated.View style={[previewStyle, { marginBottom: 20 }]}>
        <PropertyPreviewCard
          name={name ?? ''}
          propertyType={(propertyType ?? 'PG') as PropertyType}
          address={address ?? ''}
          mode={mode}
          colors={colors}
        />
      </Animated.View>

      {/* ── Actions ── */}
      <View style={{ gap: 10 }}>
        <SubmitButton
          onPress={handleSubmit(onSubmit)}
          label={submitLabel}
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
    </>
  );
}
