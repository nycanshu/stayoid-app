import {
  View, Text, ScrollView, Pressable, RefreshControl, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import {
  DotsThreeVerticalIcon, PencilIcon,
  StackIcon, DoorOpenIcon, BedIcon, UsersIcon, PlusIcon,
  CaretRightIcon,
} from 'phosphor-react-native';
import * as Haptics from '@/lib/utils/haptics';
import { useColorScheme } from 'nativewind';
import { useProperty, useSlots } from '../../../lib/hooks/use-properties';
import { useFloors, useDeleteFloor } from '../../../lib/hooks/use-floors';
import { useUnits } from '../../../lib/hooks/use-units';
import { useActionSheet } from '../../../components/ui/ActionSheet';
import { OccupancyBar } from '../../../components/properties/OccupancyBar';
import { FloorFormModal } from '../../../components/properties/FloorFormModal';
import { UnitFormModal } from '../../../components/properties/UnitFormModal';
import { SlotFormModal } from '../../../components/properties/SlotFormModal';
import { UnitDetailSheet } from '../../../components/properties/UnitDetailSheet';
import { Skeleton } from '../../../components/ui/skeleton';
import { Entrance } from '../../../components/animations';
import { formatFloorName, formatCurrency } from '../../../lib/utils/formatters';
import { getPropertyTypeLabels } from '../../../lib/constants/property-type-meta';
import { THEME } from '../../../lib/theme';
import { cn } from '../../../lib/utils';
import type { Slot, Unit } from '../../../types/property';

export default function FloorDetailScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { floorSlug, property: propertySlugParam } = useLocalSearchParams<{
    floorSlug: string;
    property?: string;
  }>();
  const { show: showActionSheet } = useActionSheet();

  const [focusTick, setFocusTick] = useState(0);
  const [editFloorOpen, setEditFloorOpen] = useState(false);
  const [unitFormOpen, setUnitFormOpen] = useState(false);
  const [slotFormState, setSlotFormState] = useState<
    { open: boolean; unitId: string; unitLabel: string }
  >({ open: false, unitId: '', unitLabel: '' });
  const [unitSheetState, setUnitSheetState] = useState<{ open: boolean; unit: Unit | null }>(
    { open: false, unit: null },
  );

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const { data: property, isLoading: propertyLoading, refetch: refetchProperty, isRefetching } = useProperty(propertySlugParam ?? '');
  const { data: floors, refetch: refetchFloors } = useFloors(property?.id);
  const { data: slots, refetch: refetchSlots } = useSlots(property?.id);
  const floor = useMemo(() => floors?.find((f) => f.slug === floorSlug), [floors, floorSlug]);
  const { data: units, refetch: refetchUnits } = useUnits(property?.id, floor?.id);
  const deleteFloor = useDeleteFloor();

  const handleRefresh = useCallback(() => {
    refetchProperty(); refetchFloors(); refetchSlots(); refetchUnits();
    setFocusTick((t) => t + 1);
  }, [refetchProperty, refetchFloors, refetchSlots, refetchUnits]);

  const isLoading = propertyLoading || (!floor && !!floors);
  const labels = getPropertyTypeLabels(property?.property_type);

  const slotsByUnitSlug = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    if (!floor) return map;
    (slots ?? [])
      .filter((s) => s.floor_number === floor.floor_number)
      .forEach((s) => { (map[s.unit_slug] ??= []).push(s); });
    return map;
  }, [slots, floor]);

  const unitsList: Unit[] = useMemo(
    () => (units ?? []).slice().sort((a, b) =>
      a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true }),
    ),
    [units],
  );

  const totalSlots = floor
    ? (slots ?? []).filter((s) => s.floor_number === floor.floor_number).length
    : 0;
  const occupied = floor
    ? (slots ?? []).filter((s) => s.floor_number === floor.floor_number && s.is_occupied).length
    : 0;
  const occupancyPct = totalSlots > 0 ? (occupied / totalSlots) * 100 : 0;

  const goBackToProperty = () => {
    if (property?.slug) {
      router.replace(`/properties/${property.slug}` as never);
    } else {
      router.back();
    }
  };

  const openMoreActions = () => {
    if (!floor || !property) return;
    showActionSheet({
      title: formatFloorName(floor.floor_number),
      options: [
        {
          label: 'Edit Floor',
          onPress: () => setEditFloorOpen(true),
        },
        {
          label: 'Delete Floor',
          destructive: true,
          onPress: () => Alert.alert(
            'Delete floor?',
            `${formatFloorName(floor.floor_number)} and all its units and slots will be permanently deleted.`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteFloor.mutateAsync({ propertyId: property.id, floorId: floor.id });
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    goBackToProperty();
                  } catch {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  }
                },
              },
            ],
            { cancelable: true },
          ),
        },
      ],
    });
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      <Stack.Screen
        options={{
          title: floor ? formatFloorName(floor.floor_number) : '',
          headerRight: () => floor ? (
            <View className="flex-row items-center gap-1">
              <Pressable
                onPress={() => setEditFloorOpen(true)}
                android_ripple={null}
                hitSlop={8}
                className="size-9 items-center justify-center"
              >
                <PencilIcon size={17} color={palette.foreground} />
              </Pressable>
              <Pressable
                onPress={openMoreActions}
                android_ripple={null}
                hitSlop={8}
                className="size-9 items-center justify-center"
              >
                <DotsThreeVerticalIcon size={20} color={palette.foreground} weight="bold" />
              </Pressable>
            </View>
          ) : null,
        }}
      />

      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={palette.primary}
          />
        }
      >
        <Entrance trigger={focusTick} style={{ marginBottom: 16 }}>
          {isLoading ? (
            <View className="gap-2">
              <Skeleton width={180} height={26} />
              <Skeleton width={240} height={13} />
            </View>
          ) : !floor ? (
            <View className="bg-card border border-border rounded-xl p-8 items-center">
              <View className="size-14 rounded-2xl bg-muted items-center justify-center mb-3.5">
                <StackIcon size={26} color={palette.mutedForeground} weight="duotone" />
              </View>
              <Text
                className="text-foreground text-[15px] mb-1.5 text-center"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Floor not found
              </Text>
              <Text
                className="text-muted-foreground text-[13px] text-center leading-5 mb-[18px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                This floor doesn't exist or has been deleted.
              </Text>
              <Pressable
                onPress={goBackToProperty}
                android_ripple={null}
                className="bg-primary rounded-[10px] px-4 py-2.5"
              >
                <Text
                  className="text-white text-[13px]"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  Go back
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {property && (
                <Pressable
                  onPress={goBackToProperty}
                  android_ripple={null}
                  hitSlop={6}
                  className="flex-row items-center gap-1 mb-1.5 self-start"
                >
                  <Text
                    className="text-muted-foreground text-[12px]"
                    style={{ fontFamily: 'Inter_500Medium' }}
                  >
                    {property.name}
                  </Text>
                  <CaretRightIcon size={11} color={palette.mutedForeground} weight="bold" />
                </Pressable>
              )}
              <Text
                className="text-foreground text-[22px] tracking-tight"
                style={{ fontFamily: 'Inter_600SemiBold', paddingRight: 0.3 }}
              >
                {formatFloorName(floor.floor_number)}
                {floor.name ? ` · ${floor.name}` : ''}
              </Text>
            </>
          )}
        </Entrance>

        {floor && (
          <>
            <Entrance trigger={focusTick} delay={60} style={{ marginBottom: 12 }}>
              <View className="bg-card border border-border rounded-xl overflow-hidden">
                <View className="p-3.5 border-b border-border">
                  <Text
                    className="text-muted-foreground text-[11px] mb-1"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    Occupancy
                  </Text>
                  <Text
                    className="text-foreground text-[26px] leading-[30px] mb-2"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    {Math.round(occupancyPct)}%
                  </Text>
                  <OccupancyBar occupied={occupied} total={totalSlots} />
                </View>
                <View className="flex-row">
                  <View className="flex-1 p-3.5 border-r border-border">
                    <Text
                      className="text-muted-foreground text-[11px] mb-1"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      {labels.unitLabelPlural}
                    </Text>
                    <Text
                      className="text-foreground text-base leading-5"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {unitsList.length}
                    </Text>
                  </View>
                  <View className="flex-1 p-3.5 border-r border-border">
                    <Text
                      className="text-muted-foreground text-[11px] mb-1"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      {labels.slotLabelPlural}
                    </Text>
                    <Text
                      className="text-foreground text-base leading-5"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {totalSlots}
                    </Text>
                  </View>
                  <View className="flex-1 p-3.5">
                    <Text
                      className="text-muted-foreground text-[11px] mb-1"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      Occupied
                    </Text>
                    <Text
                      className="text-foreground text-base leading-5"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {occupied}
                    </Text>
                  </View>
                </View>
              </View>
            </Entrance>

            <Entrance trigger={focusTick} delay={100}>
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="text-foreground text-sm"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {labels.unitLabelPlural}
                </Text>
                <Pressable
                  onPress={() => setUnitFormOpen(true)}
                  android_ripple={null}
                  hitSlop={6}
                  className="flex-row items-center gap-1 bg-primary rounded-[10px] px-2.5 py-1.5"
                >
                  <PlusIcon size={12} color="#fff" weight="bold" />
                  <Text
                    className="text-white text-xs"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    Add {labels.unitLabel}
                  </Text>
                </Pressable>
              </View>

              {unitsList.length === 0 ? (
                <View className="bg-card border border-border rounded-xl p-7 items-center">
                  <View className="size-[52px] rounded-2xl bg-info-bg items-center justify-center mb-3">
                    <DoorOpenIcon size={24} color={palette.info} weight="duotone" />
                  </View>
                  <Text
                    className="text-foreground text-sm mb-1 text-center"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    No {labels.unitLabelPlural.toLowerCase()} on this floor yet
                  </Text>
                  <Text
                    className="text-muted-foreground text-xs text-center leading-[18px]"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    Add a {labels.unitLabel.toLowerCase()} to start placing tenants on this floor.
                  </Text>
                </View>
              ) : (
                <View className="gap-2.5">
                  {unitsList.map((unit) => {
                    const unitSlots = slotsByUnitSlug[unit.slug] ?? [];
                    const unitOccupied = unitSlots.filter((s) => s.is_occupied).length;
                    return (
                      <Pressable
                        key={unit.id}
                        onPress={() => setUnitSheetState({ open: true, unit })}
                        android_ripple={null}
                        className="bg-card border border-border rounded-xl p-3.5"
                      >
                        <View className="flex-row items-center gap-3">
                          <View className="size-11 rounded-[10px] bg-info-bg items-center justify-center">
                            <DoorOpenIcon size={18} color={palette.info} weight="duotone" />
                          </View>
                          <View className="flex-1 min-w-0">
                            <Text
                              numberOfLines={1}
                              className="text-foreground text-sm"
                              style={{ fontFamily: 'Inter_600SemiBold' }}
                            >
                              {labels.unitLabel} {unit.unit_number}
                              {unit.name ? ` · ${unit.name}` : ''}
                            </Text>
                            <View className="flex-row items-center gap-2.5 mt-0.5">
                              <View className="flex-row items-center gap-0.5">
                                <BedIcon size={11} color={palette.mutedForeground} />
                                <Text
                                  className="text-muted-foreground text-[11px]"
                                  style={{ fontFamily: 'Inter_400Regular' }}
                                >
                                  {unitSlots.length} {unitSlots.length === 1 ? labels.slotLabel.toLowerCase() : labels.slotLabelPlural.toLowerCase()}
                                </Text>
                              </View>
                              <View className="flex-row items-center gap-0.5">
                                <UsersIcon size={11} color={palette.mutedForeground} />
                                <Text
                                  className="text-muted-foreground text-[11px]"
                                  style={{ fontFamily: 'Inter_400Regular' }}
                                >
                                  {unitOccupied}/{unitSlots.length || unit.capacity || 0} occupied
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              setSlotFormState({
                                open: true,
                                unitId: unit.id,
                                unitLabel: `${labels.unitLabel} ${unit.unit_number}`,
                              });
                            }}
                            android_ripple={null}
                            hitSlop={6}
                            className="flex-row items-center gap-1 bg-primary rounded-lg px-2 py-1.5"
                          >
                            <PlusIcon size={11} color="#fff" weight="bold" />
                            <Text
                              className="text-white text-[11px]"
                              style={{ fontFamily: 'Inter_600SemiBold' }}
                            >
                              {labels.slotLabel}
                            </Text>
                          </Pressable>
                        </View>

                        {unitSlots.length > 0 && (
                          <View className="mt-3 pt-3 border-t border-border gap-1.5">
                            {unitSlots.slice(0, 3).map((s) => (
                              <View key={s.id} className="flex-row items-center gap-2">
                                <View
                                  className={cn(
                                    'size-1.5 rounded-full',
                                    s.is_occupied ? 'bg-success' : 'bg-muted-foreground',
                                  )}
                                />
                                <Text
                                  numberOfLines={1}
                                  className="flex-1 text-foreground text-[12px]"
                                  style={{ fontFamily: 'Inter_400Regular' }}
                                >
                                  {labels.slotLabel} {s.slot_number}
                                  {s.active_tenant ? ` · ${s.active_tenant.name}` : ' · Vacant'}
                                </Text>
                                <Text
                                  className="text-muted-foreground text-[11px]"
                                  style={{ fontFamily: 'Inter_400Regular' }}
                                >
                                  {Number(s.monthly_rent) > 0 ? formatCurrency(s.monthly_rent) : '—'}
                                </Text>
                              </View>
                            ))}
                            {unitSlots.length > 3 && (
                              <Text
                                className="text-muted-foreground text-[11px] mt-0.5"
                                style={{ fontFamily: 'Inter_400Regular' }}
                              >
                                + {unitSlots.length - 3} more
                              </Text>
                            )}
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </Entrance>
          </>
        )}
      </ScrollView>

      {property && floor && (
        <>
          <FloorFormModal
            visible={editFloorOpen}
            propertyId={property.id}
            floor={floor}
            onClose={() => setEditFloorOpen(false)}
          />
          <UnitFormModal
            visible={unitFormOpen}
            propertyId={property.id}
            floorId={floor.id}
            propertyType={property.property_type}
            onClose={() => setUnitFormOpen(false)}
          />
          <SlotFormModal
            visible={slotFormState.open}
            propertyId={property.id}
            floorId={floor.id}
            unitId={slotFormState.unitId}
            unitLabel={slotFormState.unitLabel}
            propertyType={property.property_type}
            onClose={() => setSlotFormState((s) => ({ ...s, open: false }))}
          />
          <UnitDetailSheet
            visible={unitSheetState.open}
            unit={unitSheetState.unit}
            propertyId={property.id}
            floorId={floor.id}
            propertyType={property.property_type}
            propertyName={property.name}
            propertySlug={property.slug}
            floorNumber={floor.floor_number}
            slots={unitSheetState.unit ? slotsByUnitSlug[unitSheetState.unit.slug] ?? [] : []}
            onClose={() => setUnitSheetState({ open: false, unit: null })}
          />
        </>
      )}
    </View>
  );
}
