import {
  View, Text, TextInput, Pressable, ActivityIndicator,
} from 'react-native';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from '@/lib/utils/haptics';
import { StackIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { FormSheet } from '../ui/FormSheet';
import { useCreateFloor, useUpdateFloor } from '../../lib/hooks/use-floors';
import {
  floorFormSchema, type FloorFormValues,
} from '../../lib/validations/floor';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Floor } from '../../types/property';

interface FloorFormModalProps {
  visible:    boolean;
  propertyId: string;
  floor?:     Floor;
  onClose:    () => void;
  onSuccess?: (floor: Floor) => void;
}

export function FloorFormModal({
  visible, propertyId, floor, onClose, onSuccess,
}: FloorFormModalProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const createFloor = useCreateFloor();
  const updateFloor = useUpdateFloor();

  const isEdit = !!floor;
  const isSubmitting = createFloor.isPending || updateFloor.isPending;

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

  useEffect(() => {
    if (visible) {
      reset({
        floor_number: floor?.floor_number != null ? String(floor.floor_number) : '',
        name:         floor?.name ?? '',
      });
    }
  }, [visible, floor?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      title={isEdit ? 'Edit Floor' : 'Add Floor'}
      subtitle={isEdit ? "Update this floor's details" : 'Add a new floor to this property'}
      Icon={StackIcon}
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
                {isSubmitting ? 'Saving…' : (isEdit ? 'Save' : 'Add Floor')}
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <View className="mb-3.5">
        <Text
          className="text-foreground text-[13px] mb-1.5"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Floor number <Text className="text-destructive">*</Text>
        </Text>
        <Controller
          control={control}
          name="floor_number"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="e.g. 1, 2, -1 (basement)"
              placeholderTextColor={palette.mutedForeground}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numbers-and-punctuation"
              inputMode="numeric"
              className={cn(
                'h-[46px] border rounded-[10px] px-3 text-sm text-foreground bg-muted',
                errors.floor_number ? 'border-destructive' : 'border-border',
              )}
              style={{ fontFamily: 'Inter_400Regular' }}
            />
          )}
        />
        {errors.floor_number && (
          <Text
            className="text-destructive text-[11px] mt-1"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            {errors.floor_number.message}
          </Text>
        )}
        <Text
          className="text-muted-foreground text-[11px] mt-1"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          0 = ground, 1 = first, -1 = basement
        </Text>
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
              placeholder="e.g. Ground Floor"
              placeholderTextColor={palette.mutedForeground}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              className={cn(
                'h-[46px] border rounded-[10px] px-3 text-sm text-foreground bg-muted',
                errors.name ? 'border-destructive' : 'border-border',
              )}
              style={{ fontFamily: 'Inter_400Regular' }}
            />
          )}
        />
        {errors.name && (
          <Text
            className="text-destructive text-[11px] mt-1"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            {errors.name.message}
          </Text>
        )}
      </View>
    </FormSheet>
  );
}
