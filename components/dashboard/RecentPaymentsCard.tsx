import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ArrowRightIcon, CreditCardIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { formatCurrency, getInitials } from '../../lib/utils/formatters';
import { THEME } from '../../lib/theme';
import type { DashboardRecentPayment } from '../../types/property';

interface RecentPaymentsCardProps {
  payments: DashboardRecentPayment[];
}

export function RecentPaymentsCard({ payments }: RecentPaymentsCardProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View className="bg-card border border-border rounded-xl overflow-hidden">
      <View className="p-4 pb-2.5">
        <Text
          className="text-foreground text-sm"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Recent Payments
        </Text>
      </View>

      {payments.length === 0 ? (
        <View className="items-center py-7 px-6 border-t border-border">
          <View className="size-11 rounded-full bg-muted items-center justify-center mb-2.5">
            <CreditCardIcon size={20} color={palette.mutedForeground} weight="duotone" />
          </View>
          <Text
            className="text-foreground text-[13px] mb-1"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            No recent payments
          </Text>
          <Text
            className="text-muted-foreground text-xs text-center leading-[18px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Payments will appear here once tenants start paying rent.
          </Text>
        </View>
      ) : (
        <>
          {payments.slice(0, 5).map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push('/(tabs)/payments')}
              android_ripple={null}
              className="flex-row items-center gap-3 px-4 py-2.5 border-t border-border"
            >
              <View className="relative">
                <View className="size-9 rounded-full bg-muted items-center justify-center">
                  <Text
                    className="text-muted-foreground text-xs"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    {getInitials(p.tenant_name)}
                  </Text>
                </View>
                <View className="absolute -bottom-px -right-px size-2.5 rounded-full bg-primary border-2 border-card" />
              </View>
              <View className="flex-1 min-w-0">
                <Text
                  numberOfLines={1}
                  className="text-foreground text-[13px]"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {p.tenant_name}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-muted-foreground text-[11px]"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {p.property_name}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className="text-foreground text-[13px]"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {formatCurrency(p.amount)}
                </Text>
                <Text
                  className="text-muted-foreground text-[11px]"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push('/(tabs)/payments')}
            android_ripple={null}
            className="p-3.5 flex-row items-center gap-1 border-t border-border"
          >
            <Text
              className="text-muted-foreground text-[13px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              View all payments
            </Text>
            <ArrowRightIcon size={13} color={palette.mutedForeground} />
          </Pressable>
        </>
      )}
    </View>
  );
}
