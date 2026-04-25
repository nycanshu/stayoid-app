import { View, Text } from 'react-native';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/utils/formatters';
import type { AppColors } from '../../lib/theme/colors';

interface PaymentStatsStripProps {
  collected: number;
  expected: number;
  paidCount: number;
  unpaidCount: number;
  isLoading?: boolean;
  colors: AppColors;
}

function StatCell({
  label, value, sub, valueColor, colors,
}: { label: string; value: string; sub?: string; valueColor?: string; colors: AppColors }) {
  return (
    <View>
      <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{
        color: valueColor ?? colors.foreground,
        fontSize: 16, fontFamily: 'Inter_600SemiBold', lineHeight: 20,
      }}>
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

function getProgressColor(pct: number, colors: AppColors) {
  if (pct >= 80) return colors.success;
  if (pct >= 50) return colors.warning;
  return colors.danger;
}

export function PaymentStatsStrip({
  collected, expected, paidCount, unpaidCount, isLoading, colors,
}: PaymentStatsStripProps) {
  const pct = expected > 0 ? Math.min(Math.round((collected / expected) * 100), 100) : 0;
  const barColor = getProgressColor(pct, colors);
  const pending = Math.max(expected - collected, 0);

  if (isLoading) {
    return (
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, overflow: 'hidden',
      }}>
        <View style={{ padding: 14, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Skeleton width={80} height={10} />
          <Skeleton width={120} height={26} />
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
      {/* Hero: collected vs expected */}
      <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 4 }}>
          Collected this month
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{
            color: colors.foreground,
            fontSize: 22, fontFamily: 'Inter_600SemiBold', lineHeight: 26,
          }}>
            {formatCurrency(collected)}
          </Text>
          {expected > 0 && (
            <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
              of {formatCurrency(expected)}
            </Text>
          )}
        </View>
        <View style={{
          height: 6, backgroundColor: colors.mutedBg, borderRadius: 99,
          overflow: 'hidden', marginBottom: 6,
        }}>
          <View style={{
            height: '100%', width: `${pct}%`,
            backgroundColor: barColor, borderRadius: 99,
          }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: barColor, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
            {pct}% collected
          </Text>
          {expected > 0 && (
            <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
              {formatCurrency(pending)} pending
            </Text>
          )}
        </View>
      </View>

      {/* Counts */}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, padding: 14, borderRightWidth: 1, borderRightColor: colors.border }}>
          <StatCell
            label="Paid"
            value={paidCount.toString()}
            sub={paidCount === 1 ? 'tenant' : 'tenants'}
            valueColor={colors.success}
            colors={colors}
          />
        </View>
        <View style={{ flex: 1, padding: 14 }}>
          <StatCell
            label="Pending"
            value={unpaidCount.toString()}
            sub={unpaidCount === 1 ? 'tenant' : 'tenants'}
            valueColor={unpaidCount > 0 ? colors.warning : colors.mutedFg}
            colors={colors}
          />
        </View>
      </View>
    </View>
  );
}
