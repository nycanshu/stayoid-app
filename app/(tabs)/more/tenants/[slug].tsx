import { View, Text, TouchableOpacity, ScrollView, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeftIcon, PhoneIcon, MapPinIcon, CalendarBlankIcon, CurrencyInrIcon } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useTenant } from '../../../../lib/hooks/use-tenants';
import { usePayments } from '../../../../lib/hooks/use-payments';
import { formatCurrency, formatMonthYear } from '../../../../lib/utils/formatters';
import { Card, CardContent, Badge, Avatar, Button } from '../../../../components/ui';

export default function TenantDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: tenant, isRefetching, refetch } = useTenant(slug);
  const { data: payments } = usePayments({ tenant_id: tenant?.id });

  const handleCall = async () => {
    if (!tenant?.phone) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${tenant.phone}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon size={22} color="#4F9D7E" />
        </TouchableOpacity>
        <Text style={{ color: '#FAFAFA', fontSize: 18, fontFamily: 'Inter_600SemiBold', flex: 1 }}>
          {tenant?.name ?? '…'}
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F9D7E" />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Profile card */}
        <Card className="mb-4">
          <CardContent className="pt-5">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              {tenant?.name && <Avatar name={tenant.name} size="lg" />}
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FAFAFA', fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>
                  {tenant?.name}
                </Text>
                <View style={{ marginTop: 6 }}>
                  <Badge variant={tenant?.is_active ? 'success' : 'muted'}>
                    {tenant?.is_active ? 'Active' : 'Exited'}
                  </Badge>
                </View>
              </View>
            </View>

            <View style={{ gap: 12 }}>
              {tenant?.phone && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <PhoneIcon size={16} color="#A3A3A3" />
                    <Text style={{ color: '#A3A3A3', fontSize: 14 }}>{tenant.phone}</Text>
                  </View>
                  <Button size="sm" onPress={handleCall}>Call</Button>
                </View>
              )}

              {tenant?.unit_number && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MapPinIcon size={16} color="#A3A3A3" />
                  <Text style={{ color: '#A3A3A3', fontSize: 14 }}>
                    {tenant.property_name} · Room {tenant.unit_number}
                  </Text>
                </View>
              )}

              {tenant?.join_date && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <CalendarBlankIcon size={16} color="#A3A3A3" />
                  <Text style={{ color: '#A3A3A3', fontSize: 14 }}>
                    Joined {new Date(tenant.join_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              )}

              {tenant?.deposit_amount != null && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <CurrencyInrIcon size={16} color="#A3A3A3" />
                  <Text style={{ color: '#A3A3A3', fontSize: 14 }}>
                    Deposit: {formatCurrency(tenant.deposit_amount)}
                  </Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Payment history */}
        <Text style={{ color: '#FAFAFA', fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 12 }}>
          Payment History
        </Text>

        {(payments ?? []).length === 0 ? (
          <Text style={{ color: '#A3A3A3', textAlign: 'center', paddingVertical: 20 }}>
            No payments recorded.
          </Text>
        ) : (
          (payments ?? []).map((payment) => (
            <View
              key={payment.id}
              style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#272727',
              }}
            >
              <View>
                <Text style={{ color: '#FAFAFA', fontSize: 14 }}>
                  {payment.month_year_display ?? formatMonthYear(payment.payment_for_month, payment.payment_for_year)}
                </Text>
                <Text style={{ color: '#A3A3A3', fontSize: 12 }}>{payment.payment_method}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={{ color: '#FAFAFA', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                  {formatCurrency(payment.amount)}
                </Text>
                <Badge
                  variant={
                    payment.payment_status === 'PAID' ? 'success' :
                    payment.payment_status === 'PARTIAL' ? 'warning' : 'destructive'
                  }
                >
                  {payment.payment_status}
                </Badge>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
