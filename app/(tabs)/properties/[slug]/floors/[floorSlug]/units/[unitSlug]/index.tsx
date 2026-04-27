import {
  View, Text, ScrollView, Pressable, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import {
  ArrowLeftIcon, PencilIcon, DoorOpenIcon,
  BedIcon, PlusIcon, UsersIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useProperty, useSlots } from '../../../../../../../../lib/hooks/use-properties';
import { useFloors } from '../../../../../../../../lib/hooks/use-floors';
import { useUnits } from '../../../../../../../../lib/hooks/use-units';
import { UnitFormModal } from '../../../../../../../../components/properties/UnitFormModal';
import { SlotFormModal } from '../../../../../../../../components/properties/SlotFormModal';
import { Skeleton } from '../../../../../../../../components/ui/skeleton';
import { Entrance } from '../../../../../../../../components/animations';
import { OccupancyBar } from '../../../../../../../../components/properties/OccupancyBar';
import { formatCurrency, formatFloorName, getInitials } from '../../../../../../../../lib/utils/formatters';
import { getPropertyTypeLabels } from '../../../../../../../../lib/constants/property-type-meta';
import { THEME } from '../../../../../../../../lib/theme';
import { cn } from '../../../../../../../../lib/utils';
import type { Slot } from '../../../../../../../../types/property';

export default function UnitDetailScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { slug, floorSlug, unitSlug } = useLocalSearchParams<{
    slug: string; floorSlug: string; unitSlug: string;
  }>();

  const [focusTick, setFocusTick] = useState(0);
  const [editUnitOpen, setEditUnitOpen] = useState(false);
  const [slotFormOpen, setSlotFormOpen] = useState(false);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const { data: property, isLoading: propertyLoading, refetch: refetchProperty, isRefetching } = useProperty(slug);
  const { data: floors, refetch: refetchFloors } = useFloors(property?.id);
  const { data: slots, refetch: refetchSlots } = useSlots(property?.id);
  const floor = useMemo(() => floors?.find((f) => f.slug === floorSlug), [floors, floorSlug]);
  const { data: units, refetch: refetchUnits } = useUnits(property?.id, floor?.id);
  const unit = useMemo(() => units?.find((u) => u.slug === unitSlug), [units, unitSlug]);

  const handleRefresh = useCallback(() => {
    refetchProperty(); refetchFloors(); refetchSlots(); refetchUnits();
    setFocusTick((t) => t + 1);
  }, [refetchProperty, refetchFloors, refetchSlots, refetchUnits]);

  const isLoading = propertyLoading || (!unit && !!units);
  const labels = getPropertyTypeLabels(property?.property_type);

  const unitSlots: Slot[] = useMemo(() => {
    if (!floor) return [];
    return (slots ?? [])
      .filter((s) => s.floor_number === floor.floor_number && s.unit_slug === unitSlug)
      .sort((a, b) => a.slot_number.localeCompare(b.slot_number, undefined, { numeric: true }));
  }, [slots, floor, unitSlug]);

  const totalSlots = unitSlots.length;
  const occupied = unitSlots.filter((s) => s.is_occupied).length;
  const occupancyPct = totalSlots > 0 ? (occupied / totalSlots) * 100 : 0;
  const potentialRent = unitSlots.reduce((sum, s) => sum + Number(s.monthly_rent), 0);
  const collectedRent = unitSlots.reduce(
    (sum, s) => sum + (s.is_occupied ? Number(s.monthly_rent) : 0),
    0,
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <ScrollView
        className="flex-1"
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
          <View className="flex-row items-center mb-3.5">
            <Pressable
              onPress={() => router.back()}
              android_ripple={null}
              hitSlop={8}
              className="size-10 rounded-[10px] border border-border bg-card items-center justify-center"
            >
              <ArrowLeftIcon size={18} color={palette.foreground} />
            </Pressable>
            <View className="flex-1" />
            {unit && (
              <Pressable
                onPress={() => setEditUnitOpen(true)}
                android_ripple={null}
                hitSlop={8}
                className="size-10 rounded-[10px] border border-border bg-card items-center justify-center"
              >
                <PencilIcon size={16} color={palette.foreground} />
              </Pressable>
            )}
          </View>

          {isLoading ? (
            <View className="gap-2">
              <Skeleton width={180} height={26} />
              <Skeleton width={240} height={13} />
            </View>
          ) : !unit || !floor ? (
            <View className="bg-card border border-border rounded-xl p-8 items-center">
              <View className="size-14 rounded-2xl bg-muted items-center justify-center mb-3.5">
                <DoorOpenIcon size={26} color={palette.mutedForeground} weight="duotone" />
              </View>
              <Text
                className="text-foreground text-[15px] mb-1.5 text-center"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Unit not found
              </Text>
              <Pressable
                onPress={() => router.back()}
                android_ripple={null}
                className="bg-primary rounded-[10px] px-4 py-2.5 mt-3"
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
              <Text
                className="text-foreground text-[22px] tracking-tight"
                style={{ fontFamily: 'Inter_600SemiBold', paddingRight: 0.3 }}
              >
                {labels.unitLabel} {unit.unit_number}
                {unit.name ? ` · ${unit.name}` : ''}
              </Text>
              <Text
                numberOfLines={1}
                className="text-muted-foreground text-[13px] mt-0.5"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {property?.name} · {formatFloorName(floor.floor_number)}
              </Text>
            </>
          )}
        </Entrance>

        {unit && floor && (
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
                  <Text
                    className="text-muted-foreground text-xs mt-1.5"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {totalSlots === 0
                      ? `Capacity ${unit.capacity ?? '—'} · no ${labels.slotLabelPlural.toLowerCase()} yet`
                      : `${occupied} of ${totalSlots} ${labels.slotLabelPlural.toLowerCase()} occupied · capacity ${unit.capacity}`}
                  </Text>
                </View>
                <View className="flex-row">
                  <View className="flex-1 p-3.5 border-r border-border">
                    <Text
                      className="text-muted-foreground text-[11px] mb-1"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      Collecting
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-foreground text-base leading-5"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {formatCurrency(collectedRent)}
                    </Text>
                  </View>
                  <View className="flex-1 p-3.5">
                    <Text
                      className="text-muted-foreground text-[11px] mb-1"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      Potential
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-foreground text-base leading-5"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {formatCurrency(potentialRent)}
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
                  {labels.slotLabelPlural}
                </Text>
                <Pressable
                  onPress={() => setSlotFormOpen(true)}
                  android_ripple={null}
                  hitSlop={6}
                  className="flex-row items-center gap-1 bg-primary rounded-[10px] px-2.5 py-1.5"
                >
                  <PlusIcon size={12} color="#fff" weight="bold" />
                  <Text
                    className="text-white text-xs"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    Add {labels.slotLabel}
                  </Text>
                </Pressable>
              </View>

              {unitSlots.length === 0 ? (
                <View className="bg-card border border-border rounded-xl p-7 items-center">
                  <View className="size-[52px] rounded-2xl bg-primary-bg items-center justify-center mb-3">
                    <BedIcon size={24} color={palette.primary} weight="duotone" />
                  </View>
                  <Text
                    className="text-foreground text-sm mb-1 text-center"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    No {labels.slotLabelPlural.toLowerCase()} yet
                  </Text>
                  <Text
                    className="text-muted-foreground text-xs text-center leading-[18px]"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    Add a {labels.slotLabel.toLowerCase()} to start placing tenants here.
                  </Text>
                </View>
              ) : (
                <View className="gap-2.5">
                  {unitSlots.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => {
                        if (s.active_tenant?.slug) {
                          router.push(`/(tabs)/tenants/${s.active_tenant.slug}` as never);
                        } else if (property) {
                          router.push(`/(tabs)/tenants/new?property=${property.slug}` as never);
                        }
                      }}
                      android_ripple={null}
                      className="bg-card border border-border rounded-xl p-3.5"
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          className={cn(
                            'size-11 rounded-[10px] items-center justify-center',
                            s.is_occupied ? 'bg-muted' : 'bg-primary-bg',
                          )}
                        >
                          {s.active_tenant ? (
                            <Text
                              className="text-foreground text-[13px]"
                              style={{ fontFamily: 'Inter_600SemiBold' }}
                            >
                              {getInitials(s.active_tenant.name)}
                            </Text>
                          ) : (
                            <BedIcon size={18} color={palette.primary} weight="duotone" />
                          )}
                        </View>
                        <View className="flex-1 min-w-0">
                          <View className="flex-row items-center gap-1.5 mb-0.5">
                            <Text
                              numberOfLines={1}
                              className="text-foreground text-sm shrink"
                              style={{ fontFamily: 'Inter_600SemiBold' }}
                            >
                              {s.active_tenant?.name ?? `${labels.slotLabel} ${s.slot_number}`}
                            </Text>
                            <View
                              className={cn(
                                'rounded-full px-2 py-px',
                                s.is_occupied ? 'bg-success-bg' : 'bg-primary-bg',
                              )}
                            >
                              <Text
                                className={cn(
                                  'text-[10px]',
                                  s.is_occupied ? 'text-success' : 'text-primary',
                                )}
                                style={{ fontFamily: 'Inter_600SemiBold' }}
                              >
                                {s.is_occupied ? 'Occupied' : 'Vacant'}
                              </Text>
                            </View>
                          </View>
                          <Text
                            className="text-muted-foreground text-[11px]"
                            style={{ fontFamily: 'Inter_400Regular' }}
                          >
                            {labels.slotLabel} {s.slot_number}
                            {Number(s.monthly_rent) > 0
                              ? ` · ${formatCurrency(s.monthly_rent)}/mo`
                              : ' · rent not set'}
                          </Text>
                          {s.active_tenant?.phone && (
                            <View className="flex-row items-center gap-0.5 mt-0.5">
                              <UsersIcon size={11} color={palette.mutedForeground} />
                              <Text
                                className="text-muted-foreground text-[11px]"
                                style={{ fontFamily: 'Inter_400Regular' }}
                              >
                                {s.active_tenant.phone}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </Entrance>
          </>
        )}
      </ScrollView>

      {property && floor && unit && (
        <>
          <UnitFormModal
            visible={editUnitOpen}
            propertyId={property.id}
            floorId={floor.id}
            propertyType={property.property_type}
            unit={unit}
            onClose={() => setEditUnitOpen(false)}
          />
          <SlotFormModal
            visible={slotFormOpen}
            propertyId={property.id}
            floorId={floor.id}
            unitId={unit.id}
            unitLabel={`${labels.unitLabel} ${unit.unit_number}`}
            propertyType={property.property_type}
            onClose={() => setSlotFormOpen(false)}
          />
        </>
      )}
    </SafeAreaView>
  );
}
