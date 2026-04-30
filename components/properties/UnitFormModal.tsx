import {
  View, Text, TextInput, Pressable, ActivityIndicator,
} from 'react-native';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from '@/lib/utils/haptics';
import { DoorOpenIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { FormSheet } from '../ui/FormSheet';
import { useCreateUnit, useUpdateUnit } from '../../lib/hooks/use-units';
import {
  unitFormSchema, type UnitFormValues,
} from '../../lib/validations/unit';
import { getPropertyTypeLabels } from '../../lib/constants/property-type-meta';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Unit, PropertyType } from '../../types/property';

interface UnitFormModalProps {
  visible:       boolean;
  propertyId:    string;
  floorId:       string;
  /** Drives label vocabulary: PG → "Room", FLAT → "Flat". */
  propertyType?: PropertyType;
  /** Existing unit for edit mode; undefined for create. */
  unit?:         Unit;
  onClose:       () => void;
  onSuccess?:    (unit: Unit) => void;
}

export function UnitFormModal({
  visible, propertyId, floorId, propertyType, unit, onClose, onSuccess,
}: UnitFormModalProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const labels = getPropertyTypeLabels(propertyType);
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  const isEdit = !!unit;
  const isSubmitting = createUnit.isPending || updateUnit.isPending;

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
    }
  }, [visible, unit?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      onClose();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <FormSheet
      visible={visible}
      onClose={onClose}
      busy={isSubmitting}
      title={isEdit ? `Edit ${labels.unitLabel}` : `Add ${labels.unitLabel}`}
      subtitle={
        isEdit
          ? `Update this ${labels.unitLabel.toLowerCase()}'s details`
          : `Add a ${labels.unitLabel.toLowerCase()} to this floor`
      }
      Icon={DoorOpenIcon}
      iconBg={palette.infoBg}
      iconColor={palette.info}
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
                {isSubmitting ? 'Saving…' : (isEdit ? 'Save' : `Add ${labels.unitLabel}`)}
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
            {labels.unitLabel} number <Text className="text-destructive">*</Text>
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
    </FormSheet>
  );
}
