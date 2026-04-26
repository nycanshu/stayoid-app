import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CurrencyInrIcon } from 'phosphor-react-native';
import { formatCurrency } from '../../lib/utils/formatters';
import { getProgressColor } from '../../lib/utils/progress-colors';
import type { AppColors } from '../../lib/theme/colors';
import type { DashboardCurrentMonth } from '../../types/property';

interface RentCollectionCardProps {
  data: DashboardCurrentMonth;
  colors: AppColors;
}

/** Hero card showing rent collected vs expected for the current month. */
export function RentCollectionCard({ data, colors }: RentCollectionCardProps) {
  const collected = Number(data.collected_rent);
  const expected  = Number(data.expected_rent);
  const pct       = Math.min(data.collection_rate, 100);
  const barColor  = getProgressColor(data.collection_rate, colors);

  const goToPayments = () => router.push('/(tabs)/payments');

  // Empty state — no rent expected yet
  if (expected <= 0) {
    return (
      <Pressable
        onPress={goToPayments}
        android_ripple={null}
        style={{
          backgroundColor: colors.card,
          borderWidth: 1, borderColor: colors.border,
          borderRadius: 12, padding: 16,
        }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 14 }}>
          Rent Collection — {data.display}
        </Text>
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: colors.mutedBg,
            alignItems: 'center', justifyContent: 'center', marginBottom: 10,
          }}>
            <CurrencyInrIcon size={20} color={colors.mutedFg} weight="duotone" />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4 }}>
            No rent expected yet
          </Text>
          <Text style={{
            color: colors.mutedFg, fontSize: 12,
            fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18,
          }}>
            Rent appears here as soon as you have tenants on this month.
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={goToPayments}
      android_ripple={null}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16,
      }}
    >
      <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 12 }}>
        Rent Collection — {data.display}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: colors.foreground, fontSize: 22, fontFamily: 'Inter_600SemiBold' }}>
          {formatCurrency(collected)}
        </Text>
        <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
          of {formatCurrency(expected)}
        </Text>
      </View>

      <View style={{
        height: 8, backgroundColor: colors.mutedBg,
        borderRadius: 99, overflow: 'hidden', marginBottom: 6,
      }}>
        <View style={{
          height: '100%', width: `${pct}%`,
          backgroundColor: barColor, borderRadius: 99,
        }} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ color: barColor, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
          {Math.round(data.collection_rate)}% collected
        </Text>
        <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
          {formatCurrency(data.pending_rent)} pending
        </Text>
      </View>

      {/* Paid / pending breakdown */}
      <View style={{
        flexDirection: 'row', gap: 16,
        paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
          <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
            {data.paid_count} paid
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} />
          <Text style={{ color: colors.danger, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
            {data.pending_count} pending
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
