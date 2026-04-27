import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/utils/formatters';
import { getProgressClass, getProgressHex } from '../../lib/utils/progress-colors';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';

interface PaymentStatsStripProps {
  collected: number;
  expected: number;
  paidCount: number;
  unpaidCount: number;
  isLoading?: boolean;
}

function StatCell({
  label, value, sub, valueClass, valueHex,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
  valueHex?: string;
}) {
  return (
    <View>
      <Text
        className="text-muted-foreground text-[11px] mb-1"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {label}
      </Text>
      <Text
        className={cn('text-base leading-5 text-foreground', valueClass)}
        style={[
          { fontFamily: 'Inter_600SemiBold' },
          valueHex ? { color: valueHex } : null,
        ]}
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

export function PaymentStatsStrip({
  collected, expected, paidCount, unpaidCount, isLoading,
}: PaymentStatsStripProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = THEME[scheme];

  const pct = expected > 0 ? Math.min(Math.round((collected / expected) * 100), 100) : 0;
  const barHex = getProgressHex(pct, scheme);
  const barTextClass = getProgressClass(pct);
  const pending = Math.max(expected - collected, 0);

  if (isLoading) {
    return (
      <View className="bg-card border border-border rounded-xl overflow-hidden">
        <View className="p-3.5 gap-2 border-b border-border">
          <Skeleton width={80} height={10} />
          <Skeleton width={120} height={26} />
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
          Collected this month
        </Text>
        <View className="flex-row items-baseline justify-between mb-2">
          <Text
            className="text-foreground text-[22px] leading-[26px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {formatCurrency(collected)}
          </Text>
          {expected > 0 && (
            <Text
              className="text-muted-foreground text-xs"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              of {formatCurrency(expected)}
            </Text>
          )}
        </View>
        <View className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
          <View
            style={{ width: `${pct}%`, backgroundColor: barHex }}
            className="h-full rounded-full"
          />
        </View>
        <View className="flex-row justify-between">
          <Text
            className={`${barTextClass} text-[11px]`}
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {pct}% collected
          </Text>
          {expected > 0 && (
            <Text
              className="text-muted-foreground text-[11px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {formatCurrency(pending)} pending
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row">
        <View className="flex-1 p-3.5 border-r border-border">
          <StatCell
            label="Paid"
            value={paidCount.toString()}
            sub={paidCount === 1 ? 'tenant' : 'tenants'}
            valueHex={palette.success}
          />
        </View>
        <View className="flex-1 p-3.5">
          <StatCell
            label="Pending"
            value={unpaidCount.toString()}
            sub={unpaidCount === 1 ? 'tenant' : 'tenants'}
            valueHex={unpaidCount > 0 ? palette.warning : palette.mutedForeground}
          />
        </View>
      </View>
    </View>
  );
}
