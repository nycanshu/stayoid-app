import {
  View, Text, Pressable, FlatList, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import {
  XIcon, CheckIcon, BedIcon, ArrowLeftIcon, HouseIcon,
} from 'phosphor-react-native';
import { useProperties, useSlots } from '../../lib/hooks/use-properties';
import { getPropertyTypeMeta } from '../../lib/constants/property-type-meta';
import { formatCurrency, formatFloorName } from '../../lib/utils/formatters';
import { Skeleton } from '../ui/skeleton';
import type { AppColors } from '../../lib/theme/colors';
import type { Property, Slot } from '../../types/property';

interface SlotPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (slot: Slot, property: Property) => void;
  selectedSlotId?: string;
  /** Optional: lock to a specific property (when arriving via ?property=...) */
  lockedPropertySlug?: string;
  colors: AppColors;
}

export function SlotPickerModal({
  visible, onClose, onSelect, selectedSlotId, lockedPropertySlug, colors,
}: SlotPickerModalProps) {
  const { data: properties, isLoading: propsLoading } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Auto-select locked property if provided
  const lockedProperty = useMemo(
    () => (lockedPropertySlug && properties)
      ? properties.find((p) => p.slug === lockedPropertySlug) ?? null
      : null,
    [lockedPropertySlug, properties],
  );

  const activeProperty = lockedProperty ?? selectedProperty;

  const { data: slots, isLoading: slotsLoading } = useSlots(activeProperty?.id, true);

  // Group vacant slots by floor → unit
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          {activeProperty && !lockedProperty && (
            <Pressable
              onPress={() => setSelectedProperty(null)}
              android_ripple={null}
              hitSlop={6}
              style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: colors.mutedBg,
                alignItems: 'center', justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <ArrowLeftIcon size={14} color={colors.foreground} />
            </Pressable>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{
              color: colors.foreground, fontSize: 18,
              fontFamily: 'Inter_600SemiBold', letterSpacing: -0.3,
            }}>
              {!activeProperty ? 'Select Property' : 'Select Vacant Slot'}
            </Text>
            {activeProperty && (
              <Text
                numberOfLines={1}
                style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 }}
              >
                {activeProperty.name}{totalVacant > 0 ? ` · ${totalVacant} vacant` : ''}
              </Text>
            )}
          </View>
          <Pressable
            onPress={handleClose}
            android_ripple={null}
            hitSlop={8}
            style={{
              width: 32, height: 32, borderRadius: 8,
              backgroundColor: colors.mutedBg,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <XIcon size={16} color={colors.foreground} weight="bold" />
          </Pressable>
        </View>

        {/* Body */}
        {!activeProperty ? (
          <FlatList
            data={properties ?? []}
            keyExtractor={(p) => p.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => {
              const tm = getPropertyTypeMeta(item.property_type, colors);
              const Icon = tm.Icon;
              return (
                <Pressable
                  onPress={() => setSelectedProperty(item)}
                  android_ripple={null}
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1, borderColor: colors.border,
                    borderRadius: 12, padding: 12,
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                  }}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: tm.iconBg,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color={tm.iconColor} weight="fill" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}
                    >
                      {item.address}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              propsLoading ? (
                <View style={{ gap: 8 }}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={{
                      backgroundColor: colors.card,
                      borderWidth: 1, borderColor: colors.border,
                      borderRadius: 12, padding: 12,
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                    }}>
                      <Skeleton width={36} height={36} radius={10} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <Skeleton width="60%" height={12} />
                        <Skeleton width="80%" height={10} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingTop: 60 }}>
                  <HouseIcon size={32} color={colors.mutedFg} weight="duotone" />
                  <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginTop: 10 }}>
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
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item: floor }) => (
              <View>
                <Text style={{
                  color: colors.mutedFg, fontSize: 11,
                  fontFamily: 'Inter_600SemiBold', letterSpacing: 1,
                  textTransform: 'uppercase', marginBottom: 8,
                }}>
                  {floor.floorName}
                </Text>
                <View style={{ gap: 6 }}>
                  {Object.entries(floor.units).map(([unitNumber, unitSlots]) => (
                    <View key={unitNumber} style={{
                      backgroundColor: colors.card,
                      borderWidth: 1, borderColor: colors.border,
                      borderRadius: 12, overflow: 'hidden',
                    }}>
                      <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                        paddingHorizontal: 12, paddingVertical: 8,
                        backgroundColor: colors.mutedBg,
                      }}>
                        <Text style={{ color: colors.foreground, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
                          Unit {unitNumber}
                        </Text>
                        <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
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
                            style={{
                              flexDirection: 'row', alignItems: 'center', gap: 10,
                              paddingHorizontal: 12, paddingVertical: 11,
                              borderTopWidth: 1, borderTopColor: colors.border,
                              backgroundColor: isSelected ? `${colors.primary}10` : 'transparent',
                            }}
                          >
                            <View style={{
                              width: 30, height: 30, borderRadius: 8,
                              backgroundColor: `${colors.primary}22`,
                              alignItems: 'center', justifyContent: 'center',
                            }}>
                              <BedIcon size={13} color={colors.primary} weight="duotone" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                                Slot {slot.slot_number}
                              </Text>
                              <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 }}>
                                {rent > 0 ? `${formatCurrency(rent)}/mo` : 'Rent not set'}
                              </Text>
                            </View>
                            {isSelected && (
                              <View style={{
                                width: 22, height: 22, borderRadius: 11,
                                backgroundColor: colors.primary,
                                alignItems: 'center', justifyContent: 'center',
                              }}>
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
                <View style={{ gap: 10 }}>
                  {[0, 1].map((i) => (
                    <View key={i} style={{
                      backgroundColor: colors.card,
                      borderWidth: 1, borderColor: colors.border,
                      borderRadius: 12, padding: 12, gap: 8,
                    }}>
                      <Skeleton width={80} height={11} />
                      <Skeleton width="100%" height={36} radius={8} />
                      <Skeleton width="100%" height={36} radius={8} />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingTop: 60 }}>
                  <View style={{
                    width: 52, height: 52, borderRadius: 16,
                    backgroundColor: colors.mutedBg,
                    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                  }}>
                    <BedIcon size={24} color={colors.mutedFg} weight="duotone" />
                  </View>
                  <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 4 }}>
                    No vacant slots
                  </Text>
                  <Text style={{
                    color: colors.mutedFg, fontSize: 12,
                    fontFamily: 'Inter_400Regular', textAlign: 'center',
                  }}>
                    All slots in this property are occupied.
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
