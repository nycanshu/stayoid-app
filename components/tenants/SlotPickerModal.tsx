import {
  View, Text, Pressable, FlatList, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import {
  XIcon, CheckIcon, BedIcon, ArrowLeftIcon, HouseIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useProperties, useSlots } from '../../lib/hooks/use-properties';
import { getPropertyTypeMeta, getPropertyTypeLabels } from '../../lib/constants/property-type-meta';
import { formatCurrency, formatFloorName } from '../../lib/utils/formatters';
import { Skeleton } from '../ui/skeleton';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Property, Slot } from '../../types/property';

interface SlotPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (slot: Slot, property: Property) => void;
  selectedSlotId?: string;
  lockedPropertySlug?: string;
}

export function SlotPickerModal({
  visible, onClose, onSelect, selectedSlotId, lockedPropertySlug,
}: SlotPickerModalProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { data: properties, isLoading: propsLoading } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const lockedProperty = useMemo(
    () => (lockedPropertySlug && properties)
      ? properties.find((p) => p.slug === lockedPropertySlug) ?? null
      : null,
    [lockedPropertySlug, properties],
  );

  const activeProperty = lockedProperty ?? selectedProperty;
  const labels = getPropertyTypeLabels(activeProperty?.property_type);

  const { data: slots, isLoading: slotsLoading } = useSlots(activeProperty?.id, true);

  const grouped = useMemo(() => {
    if (!slots) return [];
    const map: Record<number, { floorName: string; units: Record<string, Slot[]> }> = {};
    slots.filter((s) => !s.is_occupied).forEach((s) => {
      if (!map[s.floor_number]) {
        map[s.floor_number] = { floorName: formatFloorName(s.floor_number), units: {} };
      }
      (map[s.floor_number].units[s.unit_number] ??= []).push(s);
    });
    return Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b)
      .map((floorNum) => ({ floorNum, ...map[floorNum] }));
  }, [slots]);

  const totalVacant = (slots ?? []).filter((s) => !s.is_occupied).length;

  const handleClose = () => {
    if (!lockedProperty) setSelectedProperty(null);
    onClose();
  };

  const handleSlotTap = (slot: Slot) => {
    if (!activeProperty) return;
    onSelect(slot, activeProperty);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-row items-center px-4 pt-2 pb-3 border-b border-border">
          {activeProperty && !lockedProperty && (
            <Pressable
              onPress={() => setSelectedProperty(null)}
              android_ripple={null}
              hitSlop={6}
              className="size-8 rounded-lg bg-muted items-center justify-center mr-2.5"
            >
              <ArrowLeftIcon size={14} color={palette.foreground} />
            </Pressable>
          )}
          <View className="flex-1">
            <Text
              className="text-foreground text-lg tracking-tight"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {!activeProperty
                ? 'Select Property'
                : `Select Vacant ${getPropertyTypeLabels(activeProperty.property_type).slotLabel}`}
            </Text>
            {activeProperty && (
              <Text
                numberOfLines={1}
                className="text-muted-foreground text-xs mt-px"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {activeProperty.name}{totalVacant > 0 ? ` · ${totalVacant} vacant` : ''}
              </Text>
            )}
          </View>
          <Pressable
            onPress={handleClose}
            android_ripple={null}
            hitSlop={8}
            className="size-8 rounded-lg bg-muted items-center justify-center"
          >
            <XIcon size={16} color={palette.foreground} weight="bold" />
          </Pressable>
        </View>

        {!activeProperty ? (
          <FlatList
            data={properties ?? []}
            keyExtractor={(p) => p.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16 }}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={({ item }) => {
              const tm = getPropertyTypeMeta(item.property_type, palette);
              const Icon = tm.Icon;
              return (
                <Pressable
                  onPress={() => setSelectedProperty(item)}
                  android_ripple={null}
                  className="bg-card border border-border rounded-xl p-3 flex-row items-center gap-3"
                >
                  <View
                    style={{ backgroundColor: tm.iconBg }}
                    className="size-9 rounded-[10px] items-center justify-center"
                  >
                    <Icon size={16} color={tm.iconColor} weight="fill" />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text
                      numberOfLines={1}
                      className="text-foreground text-sm"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-muted-foreground text-[11px] mt-0.5"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      {item.address}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              propsLoading ? (
                <View className="gap-2">
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      className="bg-card border border-border rounded-xl p-3 flex-row items-center gap-3"
                    >
                      <Skeleton width={36} height={36} radius={10} />
                      <View className="flex-1 gap-1.5">
                        <Skeleton width="60%" height={12} />
                        <Skeleton width="80%" height={10} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="items-center pt-[60px]">
                  <HouseIcon size={32} color={palette.mutedForeground} weight="duotone" />
                  <Text
                    className="text-foreground text-sm mt-2.5"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    No properties yet
                  </Text>
                </View>
              )
            }
          />
        ) : (
          <FlatList
            data={grouped}
            keyExtractor={(g) => String(g.floorNum)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16 }}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item: floor }) => (
              <View>
                <Text
                  className="text-muted-foreground text-[11px] uppercase tracking-[1px] mb-2"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {floor.floorName}
                </Text>
                <View className="gap-1.5">
                  {Object.entries(floor.units).map(([unitNumber, unitSlots]) => (
                    <View
                      key={unitNumber}
                      className="bg-card border border-border rounded-xl overflow-hidden"
                    >
                      <View className="flex-row items-center gap-1.5 px-3 py-2 bg-muted">
                        <Text
                          className="text-foreground text-xs"
                          style={{ fontFamily: 'Inter_600SemiBold' }}
                        >
                          {labels.unitLabel} {unitNumber}
                        </Text>
                        <Text
                          className="text-muted-foreground text-[11px]"
                          style={{ fontFamily: 'Inter_400Regular' }}
                        >
                          · {unitSlots.length} vacant
                        </Text>
                      </View>
                      {unitSlots.map((slot) => {
                        const isSelected = slot.id === selectedSlotId;
                        const rent = Number(slot.monthly_rent);
                        return (
                          <Pressable
                            key={slot.id}
                            onPress={() => handleSlotTap(slot)}
                            android_ripple={null}
                            className={cn(
                              'flex-row items-center gap-2.5 px-3 py-2.5 border-t border-border',
                              isSelected && 'bg-primary-bg',
                            )}
                          >
                            <View className="size-[30px] rounded-lg bg-primary-bg items-center justify-center">
                              <BedIcon size={13} color={palette.primary} weight="duotone" />
                            </View>
                            <View className="flex-1">
                              <Text
                                className="text-foreground text-[13px]"
                                style={{ fontFamily: 'Inter_600SemiBold' }}
                              >
                                {labels.slotLabel} {slot.slot_number}
                              </Text>
                              <Text
                                className="text-muted-foreground text-[11px] mt-px"
                                style={{ fontFamily: 'Inter_400Regular' }}
                              >
                                {rent > 0 ? `${formatCurrency(rent)}/mo` : 'Rent not set'}
                              </Text>
                            </View>
                            {isSelected && (
                              <View className="size-[22px] rounded-full bg-primary items-center justify-center">
                                <CheckIcon size={12} color="#fff" weight="bold" />
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            )}
            ListEmptyComponent={
              slotsLoading ? (
                <View className="gap-2.5">
                  {[0, 1].map((i) => (
                    <View
                      key={i}
                      className="bg-card border border-border rounded-xl p-3 gap-2"
                    >
                      <Skeleton width={80} height={11} />
                      <Skeleton width="100%" height={36} radius={8} />
                      <Skeleton width="100%" height={36} radius={8} />
                    </View>
                  ))}
                </View>
              ) : (
                <View className="items-center pt-[60px]">
                  <View className="size-[52px] rounded-2xl bg-muted items-center justify-center mb-3">
                    <BedIcon size={24} color={palette.mutedForeground} weight="duotone" />
                  </View>
                  <Text
                    className="text-foreground text-sm mb-1"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    No vacant {labels.slotLabelPlural.toLowerCase()}
                  </Text>
                  <Text
                    className="text-muted-foreground text-xs text-center"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    All {labels.slotLabelPlural.toLowerCase()} in this property are occupied.
                  </Text>
                </View>
              )
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
