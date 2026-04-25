import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CalendarIcon } from 'phosphor-react-native';
import { formatCurrency, formatMonthYear } from '../../lib/utils/formatters';
import type { AppColors } from '../../lib/theme/colors';
import type { Payment, PaymentStatus } from '../../types/payment';

function getStatusMeta(status: PaymentStatus, colors: AppColors) {
  if (status === 'PAID')    return { label: 'Paid',    bg: colors.successBg, fg: colors.success };
  if (status === 'PARTIAL') return { label: 'Partial', bg: colors.warningBg, fg: colors.warning };
  return                          { label: 'Pending', bg: colors.dangerBg,  fg: colors.danger  };
}

export function PaymentRow({ payment, colors }: { payment: Payment; colors: AppColors }) {
  const status = getStatusMeta(payment.payment_status, colors);
  const period = payment.month_year_display
    ?? formatMonthYear(payment.payment_for_month, payment.payment_for_year);

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/more/tenants/${payment.tenant_slug}`)}
      android_ripple={null}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 14,
      }}
    >
      <View style={{
        flexDirection: 'row', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 12, marginBottom: 8,
      }}>
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}
          >
            {payment.tenant_name}
          </Text>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
            {payment.unit_number} · {payment.slot_number}
          </Text>
        </View>
        <View style={{
          backgroundColor: status.bg, borderRadius: 99,
          paddingHorizontal: 8, paddingVertical: 3,
        }}>
          <Text style={{ color: status.fg, fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={{
        height: 1, backgroundColor: colors.border, marginBottom: 8,
      }} />

      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <CalendarIcon size={12} color={colors.mutedFg} />
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
            {period}
          </Text>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
            {' · '}
            {payment.payment_method}
          </Text>
        </View>
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
          {formatCurrency(payment.amount)}
        </Text>
      </View>
    </Pressable>
  );
}
