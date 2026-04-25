import { View, Text } from 'react-native';
import { OccupancyBar } from './OccupancyBar';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/utils/formatters';
import type { AppColors } from '../../lib/theme/colors';

interface PropertyStatsStripProps {
  occupied: number;
  totalSlots: number;
  vacant: number;
  floorsCount: number;
  collected: number;
  expected: number;
  slotLabel: string;       // "Beds" | "Rooms"
  slotLabelSingular: string;
  isLoading?: boolean;
  colors: AppColors;
}

function StatCell({
  label, value, sub, colors,
}: { label: string; value: string; sub?: string; colors: AppColors }) {
  return (
    <View>
      <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: 'Inter_600SemiBold', lineHeight: 20 }}>
        {value}
      </Text>
      {sub && (
        <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
          {sub}
        </Text>
      )}
    </View>
  );
}

export function PropertyStatsStrip({
  occupied, totalSlots, vacant, floorsCount,
  collected, expected, slotLabel, isLoading, colors,
}: PropertyStatsStripProps) {
  const occupancyPct = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0;

  if (isLoading) {
    return (
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, overflow: 'hidden',
      }}>
        <View style={{ padding: 14, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Skeleton width={70} height={10} />
          <Skeleton width={80} height={26} />
          <Skeleton width="100%" height={6} radius={99} />
          <Skeleton width={140} height={11} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, padding: 14, gap: 6, borderRightWidth: 1, borderRightColor: colors.border }}>
            <Skeleton width={50} height={10} />
            <Skeleton width={32} height={16} />
          </View>
          <View style={{ flex: 1, padding: 14, gap: 6 }}>
            <Skeleton width={60} height={10} />
            <Skeleton width={32} height={16} />
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, padding: 14, gap: 6, borderRightWidth: 1, borderRightColor: colors.border }}>
            <Skeleton width={80} height={10} />
            <Skeleton width={32} height={16} />
          </View>
          <View style={{ flex: 1, padding: 14, gap: 6 }}>
            <Skeleton width={70} height={10} />
            <Skeleton width={80} height={16} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, overflow: 'hidden',
    }}>
      {/* Occupancy hero */}
      <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 4 }}>
          Occupancy
        </Text>
        <Text style={{
          color: colors.foreground,
          fontSize: 26, fontFamily: 'Inter_600SemiBold', lineHeight: 30, marginBottom: 8,
        }}>
          {occupancyPct}%
        </Text>
        <OccupancyBar occupied={occupied} total={totalSlots} colors={colors} />
        <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 6 }}>
          {totalSlots === 0
            ? `No ${slotLabel.toLowerCase()} yet`
            : `${occupied} of ${totalSlots} ${slotLabel.toLowerCase()} occupied`}
        </Text>
      </View>

      {/* 2x2 grid */}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, padding: 14, borderRightWidth: 1, borderRightColor: colors.border }}>
          <StatCell label="Floors" value={floorsCount.toString()} colors={colors} />
        </View>
        <View style={{ flex: 1, padding: 14 }}>
          <StatCell
            label={slotLabel}
            value={totalSlots.toString()}
            sub={totalSlots > 0 ? `${vacant} vacant` : undefined}
            colors={colors}
          />
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, padding: 14, borderRightWidth: 1, borderRightColor: colors.border }}>
          <StatCell label="Active tenants" value={occupied.toString()} colors={colors} />
        </View>
        <View style={{ flex: 1, padding: 14 }}>
          <StatCell
            label="Rent this month"
            value={expected > 0 ? formatCurrency(collected) : '—'}
            sub={expected > 0 ? `of ${formatCurrency(expected)}` : 'No tenants yet'}
            colors={colors}
          />
        </View>
      </View>
    </View>
  );
}
