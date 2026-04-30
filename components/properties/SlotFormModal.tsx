import {
  View, Text, TextInput, Pressable, ActivityIndicator,
} from 'react-native';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from '@/lib/utils/haptics';
import { BedIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { FormSheet } from '../ui/FormSheet';
import { useCreateSlot, useUpdateSlot } from '../../lib/hooks/use-slot-mutations';
import {
  slotFormSchema, type SlotFormValues,
} from '../../lib/validations/slot';
import { getPropertyTypeLabels } from '../../lib/constants/property-type-meta';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Slot, PropertyType } from '../../types/property';

interface SlotFormModalProps {
  visible:       boolean;
  propertyId:    string;
  floorId:       string;
  unitId:        string;
  /** Display label like "Room 101" — shown in the header for context */
  unitLabel?:    string;
  /** Drives label vocabulary: PG → "Bed", FLAT → "Room". */
  propertyType?: PropertyType;
  /** Existing slot for edit mode; undefined for create. */
  slot?:         Slot;
  onClose:       () => void;
  onSuccess?:    (slot: Slot) => void;
}

export function SlotFormModal({
  visible, propertyId, floorId, unitId, unitLabel, propertyType, slot, onClose, onSuccess,
}: SlotFormModalProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const labels = getPropertyTypeLabels(propertyType);
  const createSlot = useCreateSlot();
  const updateSlot = useUpdateSlot();

  const isEdit = !!slot;
  const isSubmitting = createSlot.isPending || updateSlot.isPending;

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
    }
  }, [visible, slot?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      onClose();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const slotWord = labels.slotLabel.toLowerCase();
  let headerSubtitle: string;
  if (isEdit) {
    headerSubtitle = `Update this ${slotWord}'s details`;
  } else if (unitLabel) {
    headerSubtitle = `Add a ${slotWord} to ${unitLabel}`;
  } else {
    headerSubtitle = `Add a ${slotWord}`;
  }

  return (
    <FormSheet
      visible={visible}
      onClose={onClose}
      busy={isSubmitting}
      title={isEdit ? `Edit ${labels.slotLabel}` : `Add ${labels.slotLabel}`}
      subtitle={headerSubtitle}
      Icon={BedIcon}
      iconBg={palette.primaryBg}
      iconColor={palette.primary}
      footer={
        <View className="flex-row w-full">
          <View className="w-1/2 pr-1">
            <Pressable
              onPress={isSubmitting ? undefined : onClose}
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
                {isSubmitting ? 'Saving…' : (isEdit ? 'Save' : `Add ${labels.slotLabel}`)}
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <View className="flex-row gap-3 mb-3.5">
        <View className="flex-1">
          <Text
            className="text-foreground text-[13px] mb-1.5"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {labels.slotLabel} number <Text className="text-destructive">*</Text>
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

      <View>
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
    </FormSheet>
  );
}
