import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  CaretDownIcon, CaretUpIcon,
  DoorOpenIcon, UsersIcon, BedIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { OccupancyBar } from './OccupancyBar';
import { formatFloorName, formatCurrency } from '../../lib/utils/formatters';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Slot } from '../../types/property';

interface UnitGroup {
  unit_number: string;
  unit_slug: string;
  slots: Slot[];
}

interface FloorCardProps {
  floorNumber: number;
  slots: Slot[];
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
        if (tenant) router.push(`/(tabs)/tenants/${tenant.slug}`);
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

function UnitSection({ unit }: { unit: UnitGroup }) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const occupied = unit.slots.filter((s) => s.is_occupied).length;
  const total    = unit.slots.length;

  return (
    <View className="bg-background border border-border rounded-[10px] mt-2.5 overflow-hidden">
      <View className="flex-row items-center gap-2.5 px-3 py-2.5">
        <View className="size-7 rounded-lg bg-muted items-center justify-center">
          <DoorOpenIcon size={14} color={palette.mutedForeground} weight="duotone" />
        </View>
        <View className="flex-1">
          <Text
            className="text-foreground text-[13px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            Unit {unit.unit_number}
          </Text>
          <Text
            className="text-muted-foreground text-[11px] mt-px"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {occupied}/{total} occupied
          </Text>
        </View>
      </View>
      {unit.slots.map((s) => <SlotRow key={s.id} slot={s} />)}
    </View>
  );
}

export function FloorCard({ floorNumber, slots }: FloorCardProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const [expanded, setExpanded] = useState(false);
  const badge = getFloorBadgeClasses(floorNumber);

  const unitGroups: UnitGroup[] = Object.values(
    slots.reduce<Record<string, UnitGroup>>((acc, s) => {
      acc[s.unit_slug] ??= { unit_number: s.unit_number, unit_slug: s.unit_slug, slots: [] };
      acc[s.unit_slug].slots.push(s);
      return acc;
    }, {}),
  ).sort((a, b) => a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true }));

  const totalSlots = slots.length;
  const occupied   = slots.filter((s) => s.is_occupied).length;
  const unitsCount = unitGroups.length;
  const occupancyPct = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0;

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
                {unitsCount} {unitsCount === 1 ? 'unit' : 'units'}
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

          {unitGroups.map((unit) => (
            <UnitSection key={unit.unit_slug} unit={unit} />
          ))}
        </View>
      )}
    </View>
  );
}
