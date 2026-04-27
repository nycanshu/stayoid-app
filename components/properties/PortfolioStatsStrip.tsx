import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/utils/formatters';
import { getProgressHex } from '../../lib/utils/progress-colors';
import { THEME } from '../../lib/theme';
import type { DashboardProperty } from '../../types/property';

interface PortfolioStatsStripProps {
  properties: DashboardProperty[] | undefined;
  totalProperties: number;
  isLoading?: boolean;
}

export function PortfolioStatsStrip({
  properties, totalProperties, isLoading,
}: PortfolioStatsStripProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

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
            <Skeleton width={60} height={10} />
            <Skeleton width={32} height={16} />
          </View>
          <View className="flex-1 p-3.5 gap-1.5 border-r border-border">
            <Skeleton width={60} height={10} />
            <Skeleton width={32} height={16} />
          </View>
          <View className="flex-1 p-3.5 gap-1.5">
            <Skeleton width={70} height={10} />
            <Skeleton width={64} height={16} />
          </View>
        </View>
      </View>
    );
  }

  const list = properties ?? [];
  const totalSlots = list.reduce((s, p) => s + p.total_slots, 0);
  const occupied   = list.reduce((s, p) => s + p.occupied,    0);
  const vacant     = Math.max(totalSlots - occupied, 0);
  const expected   = list.reduce((s, p) => s + Number(p.expected_rent),  0);
  const collected  = list.reduce((s, p) => s + Number(p.collected_rent), 0);
  const occupancyPct = totalSlots > 0 ? (occupied / totalSlots) * 100 : 0;
  const barHex = getProgressHex(occupancyPct, scheme);

  return (
    <View className="bg-card border border-border rounded-xl overflow-hidden">
      <View className="p-3.5 border-b border-border">
        <Text
          className="text-muted-foreground text-[11px] mb-1"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Portfolio occupancy
        </Text>
        <Text
          className="text-foreground text-[26px] leading-[30px] mb-2"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {Math.round(occupancyPct)}%
        </Text>
        <View className="h-1.5 bg-muted rounded-full overflow-hidden">
          <View
            style={{ width: `${Math.min(occupancyPct, 100)}%`, backgroundColor: barHex }}
            className="h-full rounded-full"
          />
        </View>
        <Text
          className="text-muted-foreground text-xs mt-1.5"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {totalSlots === 0
            ? `${totalProperties} ${totalProperties === 1 ? 'property' : 'properties'} · no slots yet`
            : `${occupied} of ${totalSlots} slots occupied across ${totalProperties} ${totalProperties === 1 ? 'property' : 'properties'}`}
        </Text>
      </View>

      <View className="flex-row">
        <View className="flex-1 p-3.5 border-r border-border">
          <Text
            className="text-muted-foreground text-[11px] mb-1"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Slots
          </Text>
          <Text
            className="text-foreground text-base leading-5"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {totalSlots}
          </Text>
          {totalSlots > 0 && (
            <Text
              className="text-muted-foreground text-[11px] mt-0.5"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {vacant} vacant
            </Text>
          )}
        </View>
        <View className="flex-1 p-3.5 border-r border-border">
          <Text
            className="text-muted-foreground text-[11px] mb-1"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Active tenants
          </Text>
          <Text
            className="text-foreground text-base leading-5"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {occupied}
          </Text>
        </View>
        <View className="flex-1 p-3.5">
          <Text
            className="text-muted-foreground text-[11px] mb-1"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Rent this month
          </Text>
          <Text
            numberOfLines={1}
            className="text-foreground text-base leading-5"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {expected > 0 ? formatCurrency(collected) : '—'}
          </Text>
          {expected > 0 && (
            <Text
              numberOfLines={1}
              className="text-muted-foreground text-[11px] mt-0.5"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              of {formatCurrency(expected)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
