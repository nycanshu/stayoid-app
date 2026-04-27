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
import { BedIcon, XIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useCreateSlot, useUpdateSlot } from '../../lib/hooks/use-slot-mutations';
import {
  slotFormSchema, type SlotFormValues,
} from '../../lib/validations/slot';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Slot } from '../../types/property';

interface SlotFormModalProps {
  visible:    boolean;
  propertyId: string;
  floorId:    string;
  unitId:     string;
  /** Display label like "Unit 101" — shown in the header for context */
  unitLabel?: string;
  /** Existing slot for edit mode; undefined for create. */
  slot?:      Slot;
  onClose:    () => void;
  onSuccess?: (slot: Slot) => void;
}

export function SlotFormModal({
  visible, propertyId, floorId, unitId, unitLabel, slot, onClose, onSuccess,
}: SlotFormModalProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const createSlot = useCreateSlot();
  const updateSlot = useUpdateSlot();

  const isEdit = !!slot;
  const isSubmitting = createSlot.isPending || updateSlot.isPending;

  const backdrop = useSharedValue(0);
  const scale    = useSharedValue(0.92);
  const opacity  = useSharedValue(0);

  const {
    control, handleSubmit, reset,
    formState: { errors, isValid },
  } = useForm<SlotFormValues>({
    resolver: zodResolver(slotFormSchema),
    mode: 'onChange',
    defaultValues: {
      slot_number:  slot?.slot_number ?? '',
      name:         (slot as any)?.name ?? '',
      monthly_rent: slot?.monthly_rent ?? '',
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        slot_number:  slot?.slot_number ?? '',
        name:         (slot as any)?.name ?? '',
        monthly_rent: slot?.monthly_rent ?? '',
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
  }, [visible, slot?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    backdrop.value = withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) });
    scale.value    = withTiming(0.92, { duration: 160 });
    opacity.value  = withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) },
      (done) => { if (done) runOnJS(onClose)(); });
  };

  const onSubmit = async (values: SlotFormValues) => {
    const data = {
      slot_number:  values.slot_number.trim(),
      name:         values.name?.trim() || undefined,
      monthly_rent: values.monthly_rent.trim(),
    };
    try {
      let result: Slot;
      if (isEdit && slot) {
        result = await updateSlot.mutateAsync({ propertyId, floorId, unitId, slotId: slot.id, data });
      } else {
        result = await createSlot.mutateAsync({ propertyId, floorId, unitId, data });
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
            <View className="size-9 rounded-[10px] bg-primary-bg items-center justify-center">
              <BedIcon size={18} color={palette.primary} weight="duotone" />
            </View>
            <View className="flex-1">
              <Text
                className="text-foreground text-base tracking-tight"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {isEdit ? 'Edit Slot' : 'Add Slot'}
              </Text>
              <Text
                numberOfLines={1}
                className="text-muted-foreground text-xs mt-0.5"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {isEdit
                  ? "Update this slot's details"
                  : unitLabel
                    ? `Add a bed or member slot to ${unitLabel}`
                    : 'Add a bed or member slot'}
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
                Slot number <Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="slot_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="e.g. B1"
                    placeholderTextColor={palette.mutedForeground}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="characters"
                    className={cn(
                      'h-[46px] border rounded-[10px] px-3 text-sm text-foreground bg-muted',
                      errors.slot_number ? 'border-destructive' : 'border-border',
                    )}
                    style={{ fontFamily: 'Inter_400Regular' }}
                  />
                )}
              />
              {errors.slot_number && (
                <Text
                  className="text-destructive text-[11px] mt-1"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  {errors.slot_number.message}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Text
                className="text-foreground text-[13px] mb-1.5"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Monthly rent <Text className="text-destructive">*</Text>
              </Text>
              <Controller
                control={control}
                name="monthly_rent"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={cn(
                      'h-[46px] flex-row items-center border rounded-[10px] px-3 bg-muted',
                      errors.monthly_rent ? 'border-destructive' : 'border-border',
                    )}
                  >
                    <Text
                      className="text-muted-foreground text-sm mr-1.5"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      ₹
                    </Text>
                    <TextInput
                      placeholder="5000"
                      placeholderTextColor={palette.mutedForeground}
                      value={value}
                      onChangeText={(v) => onChange(v.replace(/\D/g, ''))}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      inputMode="numeric"
                      className="flex-1 text-foreground text-sm"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    />
                  </View>
                )}
              />
              {errors.monthly_rent && (
                <Text
                  className="text-destructive text-[11px] mt-1"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  {errors.monthly_rent.message}
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
                  placeholder="e.g. Bed 1, Window side"
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
                  {isSubmitting ? 'Saving…' : (isEdit ? 'Save' : 'Add Slot')}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
