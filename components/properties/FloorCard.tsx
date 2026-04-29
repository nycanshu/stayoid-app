import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import {
  CaretDownIcon, CaretUpIcon,
  DoorOpenIcon, UsersIcon, BedIcon, PlusIcon, ArrowSquareOutIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { OccupancyBar } from './OccupancyBar';
import { UnitFormModal } from './UnitFormModal';
import { SlotFormModal } from './SlotFormModal';
import { UnitDetailSheet } from './UnitDetailSheet';
import { useUnits } from '../../lib/hooks/use-units';
import { formatFloorName, formatCurrency } from '../../lib/utils/formatters';
import { getPropertyTypeLabels } from '../../lib/constants/property-type-meta';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Slot, Unit, PropertyType } from '../../types/property';

interface UnitGroup {
  unit_number: string;
  unit_slug: string;
  slots: Slot[];
}

interface FloorCardProps {
  floorNumber: number;
  slots: Slot[];
  propertyId: string;
  floorId: string;
  /** Drives label vocabulary: PG → "Room"/"Bed", FLAT → "Flat"/"Room". */
  propertyType?: PropertyType;
  /** Slugs needed to deep-link to the floor detail page. */
  propertySlug?: string;
  floorSlug?: string;
  /** Property name shown as breadcrumb in the unit-detail sheet. */
  propertyName?: string;
}

function getFloorBadgeClasses(floorNumber: number): { bg: string; fg: string } {
  if (floorNumber < 0)   return { bg: 'bg-muted',       fg: 'text-muted-foreground' };
  if (floorNumber === 0) return { bg: 'bg-warning-bg',  fg: 'text-warning' };
  return                       { bg: 'bg-info-bg',     fg: 'text-info' };
}

function SlotRow({ slot }: { slot: Slot }) {
  const tenant = slot.active_tenant;
  const occupied = slot.is_occupied;
  const rent = Number(slot.monthly_rent);

  return (
    <Pressable
      onPress={() => {
        if (tenant) router.push(`/tenants/${tenant.slug}`);
      }}
      android_ripple={null}
      disabled={!tenant}
      className="flex-row items-center gap-2.5 px-3 py-2.5 border-t border-border"
    >
      <View
        className={cn(
          'size-7 rounded-lg items-center justify-center',
          occupied ? 'bg-primary-bg' : 'bg-muted',
        )}
      >
        <Text
          className={cn(
            'text-[11px]',
            occupied ? 'text-primary' : 'text-muted-foreground',
          )}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {slot.slot_number}
        </Text>
      </View>
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className={cn(
            'text-[13px]',
            occupied ? 'text-foreground' : 'text-muted-foreground',
          )}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {tenant?.name ?? 'Vacant'}
        </Text>
        <Text
          className="text-muted-foreground text-[11px] mt-px"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {rent > 0 ? `${formatCurrency(rent)}/mo` : 'Rent not set'}
        </Text>
      </View>
      <View
        className={cn(
          'size-1.5 rounded-full',
          occupied ? 'bg-success' : 'bg-muted-foreground',
        )}
      />
    </Pressable>
  );
}

function UnitSection({
  unit,
  unitId,
  onAddSlot,
  onOpen,
  unitWord,
  slotWord,
}: {
  unit: UnitGroup;
  unitId: string | undefined;
  onAddSlot: (unitId: string, unitLabel: string) => void;
  onOpen?: () => void;
  /** Singular unit label like "Room" / "Flat" — drives display only. */
  unitWord: string;
  /** Singular slot label like "Bed" / "Room" — drives display only. */
  slotWord: string;
}) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const occupied = unit.slots.filter((s) => s.is_occupied).length;
  const total    = unit.slots.length;
  const unitLabel = `${unitWord} ${unit.unit_number}`;

  return (
    <View className="bg-background border border-border rounded-[10px] mt-2.5 overflow-hidden">
      <Pressable
        onPress={onOpen}
        disabled={!onOpen}
        android_ripple={null}
        className="flex-row items-center gap-2.5 px-3 py-2.5"
      >
        <View className="size-7 rounded-lg bg-muted items-center justify-center">
          <DoorOpenIcon size={14} color={palette.mutedForeground} weight="duotone" />
        </View>
        <View className="flex-1">
          <Text
            className="text-foreground text-[13px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {unitLabel}
          </Text>
          <Text
            className="text-muted-foreground text-[11px] mt-px"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {total === 0
              ? `No ${slotWord.toLowerCase()}s yet`
              : `${occupied}/${total} occupied`}
          </Text>
        </View>
        {unitId && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onAddSlot(unitId, unitLabel);
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
              {slotWord}
            </Text>
          </Pressable>
        )}
      </Pressable>
      {unit.slots.map((s) => <SlotRow key={s.id} slot={s} />)}
    </View>
  );
}

export function FloorCard({
  floorNumber, slots, propertyId, floorId, propertyType, propertySlug, floorSlug, propertyName,
}: FloorCardProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const labels = getPropertyTypeLabels(propertyType);
  const [expanded, setExpanded] = useState(false);
  const [unitFormOpen, setUnitFormOpen] = useState(false);
  const [slotFormState, setSlotFormState] = useState<
    { open: boolean; unitId: string; unitLabel: string }
  >({ open: false, unitId: '', unitLabel: '' });
  const [unitSheetState, setUnitSheetState] = useState<{ open: boolean; unit: Unit | null }>(
    { open: false, unit: null },
  );
  const badge = getFloorBadgeClasses(floorNumber);

  // Fetch units for this floor only when expanded — avoids preloading every floor on screen mount
  const { data: units } = useUnits(
    expanded ? propertyId : undefined,
    expanded ? floorId : undefined,
  );

  // Map unit_slug → unit_id so slot-add can look up the right unit
  const unitIdBySlug = useMemo(() => {
    const m = new Map<string, string>();
    (units ?? []).forEach((u) => m.set(u.slug, u.id));
    return m;
  }, [units]);

  const unitGroups: UnitGroup[] = Object.values(
    slots.reduce<Record<string, UnitGroup>>((acc, s) => {
      acc[s.unit_slug] ??= { unit_number: s.unit_number, unit_slug: s.unit_slug, slots: [] };
      acc[s.unit_slug].slots.push(s);
      return acc;
    }, {}),
  ).sort((a, b) => a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true }));

  // Include any units that have zero slots yet (not in `slots` flat list)
  const unitsWithoutSlots = useMemo(() => {
    if (!units) return [];
    const slottedSlugs = new Set(unitGroups.map((u) => u.unit_slug));
    return units
      .filter((u) => !slottedSlugs.has(u.slug))
      .map((u) => ({ unit_number: u.unit_number, unit_slug: u.slug, slots: [] as Slot[] }))
      .sort((a, b) => a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true }));
  }, [units, unitGroups]);

  const allUnits = [...unitGroups, ...unitsWithoutSlots];

  const totalSlots = slots.length;
  const occupied   = slots.filter((s) => s.is_occupied).length;
  const unitsCount = (units?.length ?? unitGroups.length);
  const occupancyPct = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0;

  const openSlotModal = (unitId: string, unitLabel: string) => {
    setSlotFormState({ open: true, unitId, unitLabel });
  };

  return (
    <View className="bg-card border border-border rounded-xl overflow-hidden">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        android_ripple={null}
        className="flex-row items-center gap-3 p-3.5"
      >
        <View className={cn('size-11 rounded-full items-center justify-center', badge.bg)}>
          <Text
            className={cn('text-[15px]', badge.fg)}
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {floorNumber}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-foreground text-sm"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {formatFloorName(floorNumber)}
          </Text>
          <View className="flex-row items-center gap-2.5 mt-0.5">
            <View className="flex-row items-center gap-0.5">
              <DoorOpenIcon size={11} color={palette.mutedForeground} />
              <Text
                className="text-muted-foreground text-[11px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {unitsCount} {unitsCount === 1 ? labels.unitLabel.toLowerCase() : labels.unitLabelPlural.toLowerCase()}
              </Text>
            </View>
            <View className="flex-row items-center gap-0.5">
              <BedIcon size={11} color={palette.mutedForeground} />
              <Text
                className="text-muted-foreground text-[11px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {occupied}/{totalSlots}
              </Text>
            </View>
            <View className="flex-row items-center gap-0.5">
              <UsersIcon size={11} color={palette.mutedForeground} />
              <Text
                className="text-muted-foreground text-[11px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {occupancyPct}%
              </Text>
            </View>
          </View>
        </View>
        {propertySlug && floorSlug && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: '/floors/[floorSlug]',
                params: { floorSlug, property: propertySlug },
              } as never);
            }}
            android_ripple={null}
            hitSlop={6}
            className="size-8 rounded-lg items-center justify-center mr-1"
          >
            <ArrowSquareOutIcon size={14} color={palette.mutedForeground} />
          </Pressable>
        )}
        {expanded
          ? <CaretUpIcon size={16} color={palette.mutedForeground} />
          : <CaretDownIcon size={16} color={palette.mutedForeground} />}
      </Pressable>

      {expanded && (
        <View className="px-3.5 pb-3.5 border-t border-border">
          <View className="mt-3">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text
                className="text-muted-foreground text-[11px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Occupancy rate
              </Text>
              <Text
                className="text-foreground text-[11px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {occupancyPct}%
              </Text>
            </View>
            <OccupancyBar occupied={occupied} total={totalSlots} />
          </View>

          {allUnits.map((unit) => (
            <UnitSection
              key={unit.unit_slug}
              unit={unit}
              unitId={unitIdBySlug.get(unit.unit_slug)}
              onAddSlot={openSlotModal}
              unitWord={labels.unitLabel}
              slotWord={labels.slotLabel}
              onOpen={() => {
                const fullUnit = (units ?? []).find((u) => u.slug === unit.unit_slug);
                if (fullUnit) setUnitSheetState({ open: true, unit: fullUnit });
              }}
            />
          ))}

          <Pressable
            onPress={() => setUnitFormOpen(true)}
            android_ripple={null}
            className="mt-2.5 flex-row items-center justify-center gap-2 border-[1.5px] border-dashed border-border rounded-[10px] py-3"
          >
            <PlusIcon size={13} color={palette.primary} weight="bold" />
            <Text
              className="text-primary text-[13px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Add {labels.unitLabel}
            </Text>
          </Pressable>
        </View>
      )}

      <UnitFormModal
        visible={unitFormOpen}
        propertyId={propertyId}
        floorId={floorId}
        propertyType={propertyType}
        onClose={() => setUnitFormOpen(false)}
      />

      <SlotFormModal
        visible={slotFormState.open}
        propertyId={propertyId}
        floorId={floorId}
        unitId={slotFormState.unitId}
        unitLabel={slotFormState.unitLabel}
        propertyType={propertyType}
        onClose={() => setSlotFormState((s) => ({ ...s, open: false }))}
      />

      <UnitDetailSheet
        visible={unitSheetState.open}
        unit={unitSheetState.unit}
        propertyId={propertyId}
        floorId={floorId}
        propertyType={propertyType}
        propertyName={propertyName}
        propertySlug={propertySlug}
        floorNumber={floorNumber}
        slots={
          unitSheetState.unit
            ? slots.filter((s) => s.unit_slug === unitSheetState.unit!.slug)
            : []
        }
        onClose={() => setUnitSheetState({ open: false, unit: null })}
      />
    </View>
  );
}
