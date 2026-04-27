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
import { StackIcon, XIcon } from 'phosphor-react-native';
import { useColors } from '../../lib/hooks/use-colors';
import { useCreateFloor, useUpdateFloor } from '../../lib/hooks/use-floors';
import {
  floorFormSchema, type FloorFormValues,
} from '../../lib/validations/floor';
import type { Floor } from '../../types/property';

interface FloorFormModalProps {
  visible:    boolean;
  propertyId: string;
  /** Existing floor for edit mode; undefined for create. */
  floor?:     Floor;
  onClose:    () => void;
  onSuccess?: (floor: Floor) => void;
}

export function FloorFormModal({
  visible, propertyId, floor, onClose, onSuccess,
}: FloorFormModalProps) {
  const colors = useColors();
  const createFloor = useCreateFloor();
  const updateFloor = useUpdateFloor();

  const isEdit = !!floor;
  const isSubmitting = createFloor.isPending || updateFloor.isPending;

  const backdrop = useSharedValue(0);
  const scale    = useSharedValue(0.92);
  const opacity  = useSharedValue(0);

  const {
    control, handleSubmit, reset,
    formState: { errors, isValid },
  } = useForm<FloorFormValues>({
    resolver: zodResolver(floorFormSchema),
    mode: 'onChange',
    defaultValues: {
      floor_number: floor?.floor_number != null ? String(floor.floor_number) : '',
      name:         floor?.name ?? '',
    },
  });

  // Reset values when opening with a different floor
  useEffect(() => {
    if (visible) {
      reset({
        floor_number: floor?.floor_number != null ? String(floor.floor_number) : '',
        name:         floor?.name ?? '',
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
  }, [visible, floor?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    backdrop.value = withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) });
    scale.value    = withTiming(0.92, { duration: 160 });
    opacity.value  = withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) },
      (done) => { if (done) runOnJS(onClose)(); });
  };

  const onSubmit = async (values: FloorFormValues) => {
    const data = {
      floor_number: Number(values.floor_number),
      name:         values.name?.trim() || undefined,
    };
    try {
      let result: Floor;
      if (isEdit && floor) {
        result = await updateFloor.mutateAsync({ propertyId, floorId: floor.id, data });
      } else {
        result = await createFloor.mutateAsync({ propertyId, data });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.(result);
      handleClose();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value * 0.6 }));
  const cardStyle    = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const errorColor = colors.danger;

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
        style={[StyleSheet.absoluteFill, styles.center]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
            cardStyle,
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconChip, { backgroundColor: colors.primaryBg }]}>
              <StackIcon size={18} color={colors.primary} weight="duotone" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {isEdit ? 'Edit Floor' : 'Add Floor'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedFg }]}>
                {isEdit ? 'Update this floor\'s details' : 'Add a new floor to this property'}
              </Text>
            </View>
            <Pressable
              onPress={isSubmitting ? undefined : handleClose}
              hitSlop={8}
              android_ripple={null}
              style={[styles.closeBtn, { backgroundColor: colors.mutedBg }]}
            >
              <XIcon size={14} color={colors.foreground} weight="bold" />
            </Pressable>
          </View>

          {/* Floor number */}
          <View style={{ marginBottom: 14 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Floor number <Text style={{ color: errorColor }}>*</Text>
            </Text>
            <Controller
              control={control}
              name="floor_number"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="e.g. 1, 2, -1 (basement)"
                  placeholderTextColor={colors.mutedFg}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numbers-and-punctuation"
                  inputMode="numeric"
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.mutedBg,
                      borderColor: errors.floor_number ? errorColor : colors.border,
                      color: colors.foreground,
                    },
                  ]}
                />
              )}
            />
            {errors.floor_number && (
              <Text style={[styles.error, { color: errorColor }]}>
                {errors.floor_number.message}
              </Text>
            )}
            <Text style={[styles.hint, { color: colors.mutedFg }]}>
              0 = ground, 1 = first, -1 = basement
            </Text>
          </View>

          {/* Name (optional) */}
          <View style={{ marginBottom: 18 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Name <Text style={{ color: colors.mutedFg, fontFamily: 'Inter_400Regular' }}>(optional)</Text>
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="e.g. Ground Floor"
                  placeholderTextColor={colors.mutedFg}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.mutedBg,
                      borderColor: errors.name ? errorColor : colors.border,
                      color: colors.foreground,
                    },
                  ]}
                />
              )}
            />
            {errors.name && (
              <Text style={[styles.error, { color: errorColor }]}>
                {errors.name.message}
              </Text>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.row}>
            <View style={styles.halfLeft}>
              <Pressable
                onPress={isSubmitting ? undefined : handleClose}
                disabled={isSubmitting}
                android_ripple={null}
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnSecondary,
                  {
                    backgroundColor: colors.mutedBg,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : isSubmitting ? 0.6 : 1,
                  },
                ]}
              >
                <Text style={[styles.btnText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
            </View>
            <View style={styles.halfRight}>
              <Pressable
                onPress={isSubmitting ? undefined : handleSubmit(onSubmit)}
                disabled={!isValid || isSubmitting}
                android_ripple={null}
                style={({ pressed }) => [
                  styles.btn,
                  {
                    // Disabled state uses NEUTRAL theme colors (not faded green)
                    // — opacity-faded green became invisible on white cards in
                    // light mode. Now disabled = mutedBg surface, mutedFg text.
                    backgroundColor: !isValid || isSubmitting ? colors.mutedBg : colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                {isSubmitting && (
                  <ActivityIndicator
                    size="small"
                    color={!isValid || isSubmitting ? colors.mutedFg : '#fff'}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text style={[styles.btnText, {
                  color: !isValid || isSubmitting ? colors.mutedFg : '#FFFFFF',
                }]}>
                  {isSubmitting ? 'Saving…' : (isEdit ? 'Save' : 'Add Floor')}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  card: {
    width: '100%', maxWidth: 420,
    borderRadius: 18, borderWidth: 1.5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 24,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 18,
  },
  iconChip: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 16, fontFamily: 'Inter_600SemiBold', letterSpacing: -0.2 },
  subtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  closeBtn: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
  input: {
    height: 46,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  hint:  { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },
  error: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 4 },
  row: { flexDirection: 'row', width: '100%' },
  halfLeft:  { width: '50%', paddingRight: 4 },
  halfRight: { width: '50%', paddingLeft: 4 },
  btn: {
    width: '100%', height: 48,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row',
  },
  btnSecondary: { borderWidth: 1.5 },
  btnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
