import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  CaretDownIcon, CaretUpIcon,
  DoorOpenIcon, UsersIcon, BedIcon,
} from 'phosphor-react-native';
import { OccupancyBar } from './OccupancyBar';
import { formatFloorName, formatCurrency } from '../../lib/utils/formatters';
import type { AppColors } from '../../lib/theme/colors';
import type { Slot } from '../../types/property';

interface UnitGroup {
  unit_number: string;
  unit_slug: string;
  slots: Slot[];
}

interface FloorCardProps {
  floorNumber: number;
  slots: Slot[];
  colors: AppColors;
}

// ── Floor number badge color ───────────────────────────────────────────────────
function getFloorBadgeColors(floorNumber: number, colors: AppColors) {
  if (floorNumber < 0)  return { bg: colors.mutedBg, fg: colors.mutedFg };
  if (floorNumber === 0) return { bg: colors.warningBg, fg: colors.warning };
  return { bg: colors.infoBg, fg: colors.info };
}

// ── Slot row — compact, tappable when occupied ────────────────────────────────
function SlotRow({ slot, colors }: { slot: Slot; colors: AppColors }) {
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
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 12, paddingVertical: 10,
        borderTopWidth: 1, borderTopColor: colors.border,
      }}
    >
      <View style={{
        width: 28, height: 28, borderRadius: 8,
        backgroundColor: occupied ? `${colors.primary}22` : colors.mutedBg,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{
          color: occupied ? colors.primary : colors.mutedFg,
          fontSize: 11, fontFamily: 'Inter_600SemiBold',
        }}>
          {slot.slot_number}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: occupied ? colors.foreground : colors.mutedFg,
            fontSize: 13, fontFamily: 'Inter_600SemiBold',
          }}
        >
          {tenant?.name ?? 'Vacant'}
        </Text>
        <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 }}>
          {rent > 0 ? `${formatCurrency(rent)}/mo` : 'Rent not set'}
        </Text>
      </View>
      <View style={{
        width: 7, height: 7, borderRadius: 99,
        backgroundColor: occupied ? colors.success : colors.mutedFg,
      }} />
    </Pressable>
  );
}

// ── Unit section — header + slot rows ─────────────────────────────────────────
function UnitSection({ unit, colors }: { unit: UnitGroup; colors: AppColors }) {
  const occupied = unit.slots.filter((s) => s.is_occupied).length;
  const total    = unit.slots.length;

  return (
    <View style={{
      backgroundColor: colors.background,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 10, marginTop: 10, overflow: 'hidden',
    }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 12, paddingVertical: 10,
      }}>
        <View style={{
          width: 28, height: 28, borderRadius: 8,
          backgroundColor: colors.mutedBg,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <DoorOpenIcon size={14} color={colors.mutedFg} weight="duotone" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
            Unit {unit.unit_number}
          </Text>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 }}>
            {occupied}/{total} occupied
          </Text>
        </View>
      </View>
      {unit.slots.map((s) => <SlotRow key={s.id} slot={s} colors={colors} />)}
    </View>
  );
}

// ── Floor card ─────────────────────────────────────────────────────────────────
export function FloorCard({ floorNumber, slots, colors }: FloorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const badge = getFloorBadgeColors(floorNumber, colors);

  // Group slots by unit
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
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, overflow: 'hidden',
    }}>
      {/* Header (always visible) */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        android_ripple={null}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          padding: 14,
        }}
      >
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: badge.bg,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: badge.fg, fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
            {floorNumber}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
            {formatFloorName(floorNumber)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <DoorOpenIcon size={11} color={colors.mutedFg} />
              <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                {unitsCount} {unitsCount === 1 ? 'unit' : 'units'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <BedIcon size={11} color={colors.mutedFg} />
              <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                {occupied}/{totalSlots}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <UsersIcon size={11} color={colors.mutedFg} />
              <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                {occupancyPct}%
              </Text>
            </View>
          </View>
        </View>
        {expanded
          ? <CaretUpIcon size={16} color={colors.mutedFg} />
          : <CaretDownIcon size={16} color={colors.mutedFg} />}
      </Pressable>

      {/* Expanded section */}
      {expanded && (
        <View style={{
          paddingHorizontal: 14, paddingBottom: 14,
          borderTopWidth: 1, borderTopColor: colors.border,
        }}>
          <View style={{ marginTop: 12 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 6,
            }}>
              <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                Occupancy rate
              </Text>
              <Text style={{ color: colors.foreground, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                {occupancyPct}%
              </Text>
            </View>
            <OccupancyBar occupied={occupied} total={totalSlots} colors={colors} />
          </View>

          {unitGroups.map((unit) => (
            <UnitSection key={unit.unit_slug} unit={unit} colors={colors} />
          ))}
        </View>
      )}
    </View>
  );
}
