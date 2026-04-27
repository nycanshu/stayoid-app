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
import { useColorScheme } from 'nativewind';
import { useCreateProperty, useUpdateProperty } from '../../lib/hooks/use-properties';
import { propertyFormSchema, type PropertyFormValues } from '../../lib/validations/property';
import { getAllPropertyTypeMeta, type PropertyTypeMeta } from '../../lib/constants/property-type-meta';
import { PropertyPreviewCard } from './PropertyPreviewCard';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { PropertyType } from '../../types/property';

const NAME_MAX = 255;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row items-center gap-0.5 mb-2">
      <Text
        className="text-foreground text-[13px]"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {children}
      </Text>
      <Text className="text-destructive text-[13px]">*</Text>
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

function TypeOption({
  meta, selected, onPress,
}: {
  meta: PropertyTypeMeta; selected: boolean; onPress: () => void;
}) {
  const Icon = meta.Icon;
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      className={cn(
        'flex-1 bg-card rounded-xl p-3',
        selected ? 'border-[1.5px] border-primary' : 'border border-border',
      )}
    >
      <View
        style={{ backgroundColor: meta.iconBg }}
        className="size-9 rounded-[10px] items-center justify-center mb-2.5"
      >
        <Icon size={18} color={meta.iconColor} weight="fill" />
      </View>
      <Text
        className="text-foreground text-[13px] mb-1"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {meta.longLabel}
      </Text>
      <Text
        className="text-muted-foreground text-[11px] leading-[15px]"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {meta.description}
      </Text>
    </Pressable>
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
          {loading ? (label === 'Save Changes' ? 'Saving…' : 'Creating…') : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface PropertyFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<PropertyFormValues>;
  slug?: string;
  onSuccess: (newSlug: string) => void;
  onCancel: () => void;
}

export function PropertyForm({
  mode, defaultValues, slug, onSuccess, onCancel,
}: PropertyFormProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
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

  const typeOptions = getAllPropertyTypeMeta(palette);

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

  const submitDisabled = mode === 'create' ? (!isValid || !isDirty) : !isValid;
  const submitLabel    = mode === 'create' ? 'Create Property' : 'Save Changes';

  const inputBaseClass = 'bg-background rounded-[10px] px-3.5 py-3 text-sm text-foreground border';

  return (
    <>
      <View className="bg-card border border-border rounded-xl p-4 mb-3">
        <View className="flex-row items-center gap-2 mb-[18px]">
          <BuildingsIcon size={16} color={palette.mutedForeground} weight="duotone" />
          <Text
            className="text-foreground text-sm"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {mode === 'create' ? 'Property Details' : 'Edit Property'}
          </Text>
        </View>

        <View className="mb-[18px]">
          <FieldLabel>Property Name</FieldLabel>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="e.g. Sunrise PG"
                placeholderTextColor={palette.mutedForeground}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={NAME_MAX}
                className={cn(inputBaseClass, errors.name ? 'border-destructive' : 'border-border')}
                style={{ fontFamily: 'Inter_400Regular' }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />
          <View className="flex-row justify-between items-center mt-1.5">
            <FieldError message={errors.name?.message} />
            <Text
              className="text-muted-foreground text-[11px] ml-auto"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {(name ?? '').length}/{NAME_MAX}
            </Text>
          </View>
        </View>

        <View className="mb-[18px]">
          <FieldLabel>Property Type</FieldLabel>
          <View className="flex-row gap-2.5">
            {typeOptions.map((opt) => (
              <TypeOption
                key={opt.value}
                meta={opt}
                selected={propertyType === opt.value}
                onPress={() => {
                  Haptics.selectionAsync();
                  setValue('property_type', opt.value as PropertyType, { shouldDirty: true });
                }}
              />
            ))}
          </View>
          <FieldError message={errors.property_type?.message} />
        </View>

        <View>
          <FieldLabel>Address</FieldLabel>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Street, area, city, PIN"
                placeholderTextColor={palette.mutedForeground}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className={cn(
                  inputBaseClass,
                  'min-h-[80px]',
                  errors.address ? 'border-destructive' : 'border-border',
                )}
                style={{ fontFamily: 'Inter_400Regular' }}
              />
            )}
          />
          <FieldError message={errors.address?.message} />
        </View>
      </View>

      <Animated.View style={previewStyle} className="mb-5">
        <PropertyPreviewCard
          name={name ?? ''}
          propertyType={(propertyType ?? 'PG') as PropertyType}
          address={address ?? ''}
          mode={mode}
        />
      </Animated.View>

      <View className="gap-2.5">
        <SubmitButton
          onPress={handleSubmit(onSubmit)}
          label={submitLabel}
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
    </>
  );
}
