import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ArrowRightIcon, CreditCardIcon } from 'phosphor-react-native';
import { formatCurrency, getInitials } from '../../lib/utils/formatters';
import type { AppColors } from '../../lib/theme/colors';
import type { DashboardRecentPayment } from '../../types/property';

interface RecentPaymentsCardProps {
  payments: DashboardRecentPayment[];
  colors: AppColors;
}

/** Last 5 payments with avatar + tenant name + amount + date. */
export function RecentPaymentsCard({ payments, colors }: RecentPaymentsCardProps) {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, overflow: 'hidden',
    }}>
      <View style={{ padding: 16, paddingBottom: 10 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
          Recent Payments
        </Text>
      </View>

      {payments.length === 0 ? (
        <View style={{
          alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24,
          borderTopWidth: 1, borderTopColor: colors.border,
        }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: colors.mutedBg,
            alignItems: 'center', justifyContent: 'center', marginBottom: 10,
          }}>
            <CreditCardIcon size={20} color={colors.mutedFg} weight="duotone" />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4 }}>
            No recent payments
          </Text>
          <Text style={{
            color: colors.mutedFg, fontSize: 12,
            fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18,
          }}>
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
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingHorizontal: 16, paddingVertical: 10,
                borderTopWidth: 1, borderTopColor: colors.border,
              }}
            >
              <View style={{ position: 'relative' }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: colors.mutedBg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
                    {getInitials(p.tenant_name)}
                  </Text>
                </View>
                {/* Online dot — denotes recent activity */}
                <View style={{
                  position: 'absolute', bottom: -1, right: -1,
                  width: 10, height: 10, borderRadius: 5,
                  backgroundColor: colors.primary,
                  borderWidth: 2, borderColor: colors.card,
                }} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}
                >
                  {p.tenant_name}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}
                >
                  {p.property_name}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                  {formatCurrency(p.amount)}
                </Text>
                <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                  {new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push('/(tabs)/payments')}
            android_ripple={null}
            style={{
              padding: 14,
              flexDirection: 'row', alignItems: 'center', gap: 4,
              borderTopWidth: 1, borderTopColor: colors.border,
            }}
          >
            <Text style={{ color: colors.mutedFg, fontSize: 13, fontFamily: 'Inter_400Regular' }}>
              View all payments
            </Text>
            <ArrowRightIcon size={13} color={colors.mutedFg} />
          </Pressable>
        </>
      )}
    </View>
  );
}
