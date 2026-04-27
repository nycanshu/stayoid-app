import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CurrencyInrIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { formatCurrency } from '../../lib/utils/formatters';
import { getProgressHex, getProgressClass } from '../../lib/utils/progress-colors';
import { THEME } from '../../lib/theme';
import type { DashboardCurrentMonth } from '../../types/property';

interface RentCollectionCardProps {
  data: DashboardCurrentMonth;
}

export function RentCollectionCard({ data }: RentCollectionCardProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = THEME[scheme];

  const collected = Number(data.collected_rent);
  const expected  = Number(data.expected_rent);
  const pct       = Math.min(data.collection_rate, 100);
  const barHex    = getProgressHex(data.collection_rate, scheme);
  const barTextClass = getProgressClass(data.collection_rate);

  const goToPayments = () => router.push('/(tabs)/payments');

  if (expected <= 0) {
    return (
      <Pressable
        onPress={goToPayments}
        android_ripple={null}
        className="bg-card border border-border rounded-xl p-4"
      >
        <Text
          className="text-foreground text-sm mb-3.5"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Rent Collection — {data.display}
        </Text>
        <View className="items-center py-3">
          <View className="size-11 rounded-full bg-muted items-center justify-center mb-2.5">
            <CurrencyInrIcon size={20} color={palette.mutedForeground} weight="duotone" />
          </View>
          <Text
            className="text-foreground text-[13px] mb-1"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            No rent expected yet
          </Text>
          <Text
            className="text-muted-foreground text-xs text-center leading-[18px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
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
      className="bg-card border border-border rounded-xl p-4"
    >
      <Text
        className="text-foreground text-sm mb-3"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        Rent Collection — {data.display}
      </Text>

      <View className="flex-row items-baseline justify-between mb-2">
        <Text
          className="text-foreground text-[22px]"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {formatCurrency(collected)}
        </Text>
        <Text
          className="text-muted-foreground text-xs"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          of {formatCurrency(expected)}
        </Text>
      </View>

      <View className="h-2 bg-muted rounded-full overflow-hidden mb-1.5">
        <View
          style={{ width: `${pct}%`, backgroundColor: barHex }}
          className="h-full rounded-full"
        />
      </View>

      <View className="flex-row justify-between mb-3">
        <Text
          className={`${barTextClass} text-xs`}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {Math.round(data.collection_rate)}% collected
        </Text>
        <Text
          className="text-muted-foreground text-xs"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {formatCurrency(data.pending_rent)} pending
        </Text>
      </View>

      <View className="flex-row gap-4 pt-2.5 border-t border-border">
        <View className="flex-row items-center gap-1.5">
          <View className="size-2 rounded-full bg-success" />
          <Text
            className="text-muted-foreground text-xs"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {data.paid_count} paid
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="size-2 rounded-full bg-destructive" />
          <Text
            className="text-destructive text-xs"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {data.pending_count} pending
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
