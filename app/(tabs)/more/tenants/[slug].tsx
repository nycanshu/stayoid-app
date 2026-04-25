import { View, Text, TouchableOpacity, ScrollView, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTenant } from '../../../../lib/hooks/use-tenants';
import { usePayments } from '../../../../lib/hooks/use-payments';
import { formatCurrency, formatMonthYear } from '../../../../lib/utils/formatters';
import * as Haptics from 'expo-haptics';

export default function TenantDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: tenant, isLoading, refetch, isRefetching } = useTenant(slug);
  const { data: payments } = usePayments({ tenant_id: tenant?.id });

  const initials = tenant?.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('') ?? '?';

  const handleCall = async () => {
    if (!tenant?.phone) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${tenant.phone}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: '#4F9D7E', fontSize: 15 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: '#FAFAFA', fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>
          {tenant?.name ?? '…'}
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F9D7E" />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Profile card */}
        <View style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#4F9D7E', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 20 }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FAFAFA', fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>{tenant?.name}</Text>
              <View style={{ backgroundColor: tenant?.is_active ? '#1E3C28' : '#272727', alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 }}>
                <Text style={{ color: tenant?.is_active ? '#22C55E' : '#A3A3A3', fontSize: 12 }}>
                  {tenant?.is_active ? 'Active' : 'Exited'}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            {tenant?.phone && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#A3A3A3', fontSize: 14 }}>📞 {tenant.phone}</Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#4F9D7E', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6 }}
                  onPress={handleCall}
                >
                  <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>Call</Text>
                </TouchableOpacity>
              </View>
            )}
            {tenant?.slot_detail && (
              <Text style={{ color: '#A3A3A3', fontSize: 14 }}>
                📍 {tenant.slot_detail.property_name} · Room {tenant.slot_detail.unit_number}
              </Text>
            )}
            {tenant?.join_date && (
              <Text style={{ color: '#A3A3A3', fontSize: 14 }}>
                📅 Joined {new Date(tenant.join_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            )}
            {tenant?.deposit_amount != null && (
              <Text style={{ color: '#A3A3A3', fontSize: 14 }}>
                💰 Deposit: {formatCurrency(tenant.deposit_amount)}
              </Text>
            )}
          </View>
        </View>

        {/* Payment history */}
        <Text style={{ color: '#FAFAFA', fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 12 }}>
          Payment History
        </Text>

        {(payments ?? []).length === 0 ? (
          <Text style={{ color: '#A3A3A3', textAlign: 'center', paddingVertical: 20 }}>No payments recorded.</Text>
        ) : (
          (payments ?? []).map((payment) => (
            <View key={payment.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#272727' }}>
              <View>
                <Text style={{ color: '#FAFAFA', fontSize: 14 }}>{formatMonthYear(payment.month, payment.year)}</Text>
                <Text style={{ color: '#A3A3A3', fontSize: 12 }}>{payment.payment_method}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#FAFAFA', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>{formatCurrency(payment.amount)}</Text>
                <Text style={{ color: payment.payment_status === 'PAID' ? '#22C55E' : '#F59E0B', fontSize: 11 }}>
                  {payment.payment_status}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
