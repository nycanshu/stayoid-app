import { View, Text } from 'react-native';
import { OccupancyBar } from './OccupancyBar';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/utils/formatters';

interface PropertyStatsStripProps {
  occupied: number;
  totalSlots: number;
  vacant: number;
  floorsCount: number;
  collected: number;
  expected: number;
  slotLabel: string;
  slotLabelSingular: string;
  isLoading?: boolean;
}

function StatCell({
  label, value, sub,
}: { label: string; value: string; sub?: string }) {
  return (
    <View>
      <Text
        className="text-muted-foreground text-[11px] mb-1"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {label}
      </Text>
      <Text
        className="text-foreground text-base leading-5"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {value}
      </Text>
      {sub && (
        <Text
          className="text-muted-foreground text-[11px] mt-0.5"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {sub}
        </Text>
      )}
    </View>
  );
}

export function PropertyStatsStrip({
  occupied, totalSlots, vacant, floorsCount,
  collected, expected, slotLabel, isLoading,
}: PropertyStatsStripProps) {
  const occupancyPct = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0;

  if (isLoading) {
    return (
      <View className="bg-card border border-border rounded-xl overflow-hidden">
        <View className="p-3.5 gap-2 border-b border-border">
          <Skeleton width={70} height={10} />
          <Skeleton width={80} height={26} />
          <Skeleton width="100%" height={6} radius={99} />
          <Skeleton width={140} height={11} />
        </View>
        <View className="flex-row">
          <View className="flex-1 p-3.5 gap-1.5 border-r border-border">
            <Skeleton width={50} height={10} />
            <Skeleton width={32} height={16} />
          </View>
          <View className="flex-1 p-3.5 gap-1.5">
            <Skeleton width={60} height={10} />
            <Skeleton width={32} height={16} />
          </View>
        </View>
        <View className="h-px bg-border" />
        <View className="flex-row">
          <View className="flex-1 p-3.5 gap-1.5 border-r border-border">
            <Skeleton width={80} height={10} />
            <Skeleton width={32} height={16} />
          </View>
          <View className="flex-1 p-3.5 gap-1.5">
            <Skeleton width={70} height={10} />
            <Skeleton width={80} height={16} />
          </View>
        </View>
      </View>
    );
  }

  return (
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
          {occupancyPct}%
        </Text>
        <OccupancyBar occupied={occupied} total={totalSlots} />
        <Text
          className="text-muted-foreground text-xs mt-1.5"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {totalSlots === 0
            ? `No ${slotLabel.toLowerCase()} yet`
            : `${occupied} of ${totalSlots} ${slotLabel.toLowerCase()} occupied`}
        </Text>
      </View>

      <View className="flex-row">
        <View className="flex-1 p-3.5 border-r border-border">
          <StatCell label="Floors" value={floorsCount.toString()} />
        </View>
        <View className="flex-1 p-3.5">
          <StatCell
            label={slotLabel}
            value={totalSlots.toString()}
            sub={totalSlots > 0 ? `${vacant} vacant` : undefined}
          />
        </View>
      </View>
      <View className="h-px bg-border" />
      <View className="flex-row">
        <View className="flex-1 p-3.5 border-r border-border">
          <StatCell label="Active tenants" value={occupied.toString()} />
        </View>
        <View className="flex-1 p-3.5">
          <StatCell
            label="Rent this month"
            value={expected > 0 ? formatCurrency(collected) : '—'}
            sub={expected > 0 ? `of ${formatCurrency(expected)}` : 'No tenants yet'}
          />
        </View>
      </View>
    </View>
  );
}
