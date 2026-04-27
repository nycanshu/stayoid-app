import {
  View, Text, TextInput, Pressable, Modal, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  runOnJS, Easing,
} from 'react-native-reanimated';
import { DoorOpenIcon, XIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useCreateUnit, useUpdateUnit } from '../../lib/hooks/use-units';
import {
  unitFormSchema, type UnitFormValues,
} from '../../lib/validations/unit';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Unit } from '../../types/property';

interface UnitFormModalProps {
  visible:    boolean;
  propertyId: string;
  floorId:    string;
  /** Existing unit for edit mode; undefined for create. */
  unit?:      Unit;
  onClose:    () => void;
  onSuccess?: (unit: Unit) => void;
}

export function UnitFormModal({
  visible, propertyId, floorId, unit, onClose, onSuccess,
}: UnitFormModalProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  const isEdit = !!unit;
  const isSubmitting = createUnit.isPending || updateUnit.isPending;

  const backdrop = useSharedValue(0);
  const scale    = useSharedValue(0.92);
  const opacity  = useSharedValue(0);

  const {
    control, handleSubmit, reset,
    formState: { errors, isValid },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    mode: 'onChange',
    defaultValues: {
      unit_number: unit?.unit_number ?? '',
      name:        unit?.name ?? '',
      capacity:    unit?.capacity ?? 1,
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        unit_number: unit?.unit_number ?? '',
        name:        unit?.name ?? '',
        capacity:    unit?.capacity ?? 1,
      });
      requestAnimationFrame(() => {
        backdrop.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
        scale.value    = withSpring(1, { damping: 22, stiffness: 260, mass: 0.6 });
        opacity.value  = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
      });
    } else {
      backdrop.value = 0;
      scale.value    = 0.92;
      opacity.value  = 0;
    }
  }, [visible, unit?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    backdrop.value = withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) });
    scale.value    = withTiming(0.92, { duration: 160 });
    opacity.value  = withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) },
      (done) => { if (done) runOnJS(onClose)(); });
  };

  const onSubmit = async (values: UnitFormValues) => {
    const data = {
      unit_number: values.unit_number.trim(),
      name:        values.name?.trim() || undefined,
      capacity:    values.capacity,
    };
    try {
      let result: Unit;
      if (isEdit && unit) {
        result = await updateUnit.mutateAsync({ propertyId, floorId, unitId: unit.id, data });
      } else {
        result = await createUnit.mutateAsync({ propertyId, floorId, data });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.(result);
      handleClose();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value * 0.6 }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="none"
      onRequestClose={isSubmitting ? undefined : handleClose}
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdropStyle]}
      />
      <Pressable
        onPress={isSubmitting ? undefined : handleClose}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 24,
            },
            cardStyle,
          ]}
          className="w-full max-w-[420px] bg-card border-[1.5px] border-border rounded-[18px] p-5"
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View className="size-9 rounded-[10px] bg-info-bg items-center justify-center">
              <DoorOpenIcon size={18} color={palette.info} weight="duotone" />
            </View>
            <View className="flex-1">
              <Text
                className="text-foreground text-base tracking-tight"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {isEdit ? 'Edit Unit' : 'Add Unit'}
              </Text>
              <Text
                className="text-muted-foreground text-xs mt-0.5"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {isEdit ? "Update this unit's details" : 'Add a room or flat to this floor'}
              </Text>
            </View>
            <Pressable
              onPress={isSubmitting ? undefined : handleClose}
              hitSlop={8}
              android_ripple={null}
              className="size-7 rounded-lg bg-muted items-center justify-center"
            >
              <XIcon size={14} color={palette.foreground} weight="bold" />
            </Pressable>
          </View>

          <View className="flex-row gap-3 mb-3.5">
            <View className="flex-1">
              <Text
                className="text-foreground text-[13px] mb-1.5"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Unit number <Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="unit_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="e.g. 101"
                    placeholderTextColor={palette.mutedForeground}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="characters"
                    className={cn(
                      'h-[46px] border rounded-[10px] px-3 text-sm text-foreground bg-muted',
                      errors.unit_number ? 'border-destructive' : 'border-border',
                    )}
                    style={{ fontFamily: 'Inter_400Regular' }}
                  />
                )}
              />
              {errors.unit_number && (
                <Text
                  className="text-destructive text-[11px] mt-1"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  {errors.unit_number.message}
                </Text>
              )}
            </View>

            <View className="w-[110px]">
              <Text
                className="text-foreground text-[13px] mb-1.5"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Capacity <Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="capacity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="1"
                    placeholderTextColor={palette.mutedForeground}
                    value={String(value ?? '')}
                    onChangeText={(v) => onChange(v === '' ? '' : Number(v.replace(/\D/g, '')))}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={2}
                    className={cn(
                      'h-[46px] border rounded-[10px] px-3 text-sm text-foreground bg-muted',
                      errors.capacity ? 'border-destructive' : 'border-border',
                    )}
                    style={{ fontFamily: 'Inter_400Regular' }}
                  />
                )}
              />
              {errors.capacity && (
                <Text
                  className="text-destructive text-[11px] mt-1"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  {errors.capacity.message}
                </Text>
              )}
            </View>
          </View>

          <View className="mb-[18px]">
            <Text
              className="text-foreground text-[13px] mb-1.5"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Name{' '}
              <Text
                className="text-muted-foreground"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                (optional)
              </Text>
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="e.g. Master Bedroom"
                  placeholderTextColor={palette.mutedForeground}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  className={cn(
                    'h-[46px] border rounded-[10px] px-3 text-sm text-foreground bg-muted',
                    errors.name ? 'border-destructive' : 'border-border',
                  )}
                  style={{ fontFamily: 'Inter_400Regular' }}
                />
              )}
            />
          </View>

          <View className="flex-row w-full">
            <View className="w-1/2 pr-1">
              <Pressable
                onPress={isSubmitting ? undefined : handleClose}
                disabled={isSubmitting}
                android_ripple={null}
                className={cn(
                  'w-full h-12 rounded-xl items-center justify-center flex-row bg-muted border-[1.5px] border-border',
                  isSubmitting && 'opacity-60',
                )}
              >
                <Text
                  className="text-foreground text-sm"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
            <View className="w-1/2 pl-1">
              <Pressable
                onPress={isSubmitting ? undefined : handleSubmit(onSubmit)}
                disabled={!isValid || isSubmitting}
                android_ripple={null}
                className={cn(
                  'w-full h-12 rounded-xl items-center justify-center flex-row',
                  !isValid || isSubmitting ? 'bg-muted' : 'bg-primary',
                )}
              >
                {isSubmitting && (
                  <ActivityIndicator
                    size="small"
                    color={!isValid || isSubmitting ? palette.mutedForeground : '#fff'}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  className={cn(
                    'text-sm',
                    !isValid || isSubmitting ? 'text-muted-foreground' : 'text-white',
                  )}
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {isSubmitting ? 'Saving…' : (isEdit ? 'Save' : 'Add Unit')}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
