import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CalendarIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { formatCurrency, formatMonthYear } from '../../lib/utils/formatters';
import { THEME } from '../../lib/theme';
import type { Payment, PaymentStatus } from '../../types/payment';

function getStatusMeta(status: PaymentStatus): { label: string; bgClass: string; fgClass: string } {
  if (status === 'PAID')    return { label: 'Paid',    bgClass: 'bg-success-bg',     fgClass: 'text-success' };
  if (status === 'PARTIAL') return { label: 'Partial', bgClass: 'bg-warning-bg',     fgClass: 'text-warning' };
  return                          { label: 'Pending', bgClass: 'bg-destructive-bg', fgClass: 'text-destructive' };
}

function PaymentRowImpl({ payment }: { payment: Payment }) {
  const status = getStatusMeta(payment.payment_status);
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const period = payment.month_year_display
    ?? formatMonthYear(payment.payment_for_month, payment.payment_for_year);

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/tenants/${payment.tenant_slug}`)}
      android_ripple={null}
      className="bg-card border border-border rounded-xl p-3.5"
    >
      <View className="flex-row items-start justify-between gap-3 mb-2">
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-foreground text-sm"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {payment.tenant_name}
          </Text>
          <Text
            className="text-muted-foreground text-[11px] mt-0.5"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {payment.unit_number} · {payment.slot_number}
          </Text>
        </View>
        <View className={`${status.bgClass} rounded-full px-2 py-0.5`}>
          <Text
            className={`${status.fgClass} text-[10px]`}
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View className="h-px bg-border mb-2" />

      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-1">
          <CalendarIcon size={12} color={palette.mutedForeground} />
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {period}
          </Text>
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {' · '}{payment.payment_method}
          </Text>
        </View>
        <Text
          className="text-foreground text-sm"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {formatCurrency(payment.amount)}
        </Text>
      </View>
    </Pressable>
  );
}

export const PaymentRow = memo(PaymentRowImpl);
