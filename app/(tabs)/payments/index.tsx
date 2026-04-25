import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { CaretLeftIcon, CaretRightIcon, WarningCircleIcon } from 'phosphor-react-native';
import { usePayments } from '../../../lib/hooks/use-payments';
import { useTenants } from '../../../lib/hooks/use-tenants';
import { formatCurrency, formatMonthYear } from '../../../lib/utils/formatters';
import { Badge, Avatar } from '../../../components/ui';
import type { Payment } from '../../../types/payment';
import type { Tenant } from '../../../types/tenant';

function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <View style={{
      backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727',
      borderRadius: 12, padding: 14, marginBottom: 8,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    }}>
      <Avatar name={payment.tenant_name} size="sm" />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FAFAFA', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
          {payment.tenant_name}
        </Text>
        <Text style={{ color: '#A3A3A3', fontSize: 12, marginTop: 2 }}>
          {payment.property_name} · Room {payment.unit_number}
        </Text>
        <Text style={{ color: '#A3A3A3', fontSize: 11, marginTop: 2 }}>
          {payment.payment_method}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text style={{ color: '#FAFAFA', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
          {formatCurrency(payment.amount)}
        </Text>
        <Badge variant="success">Paid</Badge>
      </View>
    </View>
  );
}

function UnpaidRow({ tenant }: { tenant: Tenant }) {
  return (
    <View style={{
      backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727',
      borderLeftWidth: 3, borderLeftColor: '#F59E0B',
      borderRadius: 12, padding: 14, marginBottom: 8,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#3C2D0F', alignItems: 'center', justifyContent: 'center' }}>
        <WarningCircleIcon size={18} color="#F59E0B" weight="fill" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FAFAFA', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
          {tenant.name}
        </Text>
        <Text style={{ color: '#A3A3A3', fontSize: 12 }}>
          {tenant.property_name} · Room {tenant.unit_number}
        </Text>
      </View>
      <Badge variant="warning">Unpaid</Badge>
    </View>
  );
}

export default function PaymentsScreen() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: payments, isLoading, refetch, isRefetching } = usePayments({ month, year });
  const { data: unpaidTenants } = useTenants({ unpaid: true, month, year });

  const prev = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  type ListItem =
    | { kind: 'unpaid'; tenant: Tenant }
    | { kind: 'payment'; payment: Payment };

  const listData: ListItem[] = [
    ...(unpaidTenants ?? []).map((t): ListItem => ({ kind: 'unpaid', tenant: t })),
    ...(payments ?? []).map((p): ListItem => ({ kind: 'payment', payment: p })),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ color: '#FAFAFA', fontSize: 20, fontFamily: 'Inter_600SemiBold' }}>Payments</Text>
      </View>

      {/* Month navigator */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={prev} style={{ padding: 4 }}>
          <CaretLeftIcon size={20} color="#4F9D7E" />
        </TouchableOpacity>
        <Text style={{ color: '#FAFAFA', fontSize: 16, fontFamily: 'Inter_600SemiBold', minWidth: 140, textAlign: 'center' }}>
          {formatMonthYear(month, year)}
        </Text>
        <TouchableOpacity onPress={next} style={{ padding: 4 }}>
          <CaretRightIcon size={20} color="#4F9D7E" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) =>
          item.kind === 'unpaid' ? `u-${item.tenant.id}` : `p-${item.payment.id}`
        }
        renderItem={({ item }) =>
          item.kind === 'unpaid'
            ? <View style={{ paddingHorizontal: 16 }}><UnpaidRow tenant={item.tenant} /></View>
            : <View style={{ paddingHorizontal: 16 }}><PaymentRow payment={item.payment} /></View>
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F9D7E" />}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ color: '#22C55E', fontSize: 16 }}>
                All clear for {formatMonthYear(month, year)}
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
