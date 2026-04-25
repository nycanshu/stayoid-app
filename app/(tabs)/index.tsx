import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { WarningCircleIcon, PhoneIcon } from 'phosphor-react-native';
import { useDashboard } from '../../lib/hooks/use-dashboard';
import { useTenants } from '../../lib/hooks/use-tenants';
import { useAuthStore } from '../../lib/stores/auth-store';
import { formatCurrency, formatMonthYear } from '../../lib/utils/formatters';
import { Card, CardContent } from '../../components/ui';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: dashboard, isLoading, refetch, isRefetching } = useDashboard();
  const { data: unpaidTenants } = useTenants({ unpaid: true });

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const summary = dashboard?.summary;
  const currentMonth = dashboard?.current_month;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F9D7E" />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
          <View>
            <Text style={{ color: '#FAFAFA', fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>
              {greeting}, {firstName}
            </Text>
            <Text style={{ color: '#A3A3A3', fontSize: 13, marginTop: 2 }}>
              {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/more')}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#4F9D7E', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>{firstName[0]}</Text>
          </TouchableOpacity>
        </View>

        {/* Collection card */}
        {currentMonth && (
          <Card className="mb-4">
            <CardContent className="pt-5">
              <Text style={{ color: '#A3A3A3', fontSize: 13, marginBottom: 4 }}>
                {currentMonth.display ?? formatMonthYear(month, year)} Collection
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
                <Text style={{ color: '#FAFAFA', fontSize: 30, fontFamily: 'Inter_600SemiBold' }}>
                  {formatCurrency(currentMonth.collected_rent)}
                </Text>
                <Text style={{ color: '#A3A3A3', fontSize: 13, marginBottom: 4 }}>
                  of {formatCurrency(currentMonth.expected_rent)}
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: '#272727', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                <View style={{ height: '100%', backgroundColor: '#4F9D7E', borderRadius: 99, width: `${Math.min(currentMonth.collection_rate, 100)}%` }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#A3A3A3', fontSize: 12 }}>
                  {Math.round(currentMonth.collection_rate)}% collected
                </Text>
                <Text style={{ color: '#A3A3A3', fontSize: 12 }}>
                  {currentMonth.paid_count} paid · {currentMonth.pending_count} pending
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Stat grid */}
        {summary && (
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <Card className="flex-1">
              <CardContent className="pt-4">
                <Text style={{ color: '#FAFAFA', fontSize: 26, fontFamily: 'Inter_600SemiBold' }}>
                  {Math.round(summary.occupancy_rate)}%
                </Text>
                <Text style={{ color: '#A3A3A3', fontSize: 12, marginTop: 2 }}>Occupancy</Text>
                <Text style={{ color: '#A3A3A3', fontSize: 12 }}>
                  {summary.occupied_slots} of {summary.total_slots}
                </Text>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="pt-4">
                <Text style={{ color: '#FAFAFA', fontSize: 26, fontFamily: 'Inter_600SemiBold' }}>
                  {summary.total_properties}
                </Text>
                <Text style={{ color: '#A3A3A3', fontSize: 12, marginTop: 2 }}>Properties</Text>
                <Text style={{ color: '#A3A3A3', fontSize: 12 }}>{summary.total_slots} rooms</Text>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Needs attention */}
        {unpaidTenants && unpaidTenants.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#FAFAFA', fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 10 }}>
              Needs Attention
            </Text>
            {unpaidTenants.slice(0, 3).map((tenant) => (
              <TouchableOpacity
                key={tenant.id}
                onPress={() => router.push(`/(tabs)/more/tenants/${tenant.slug}`)}
                style={{
                  backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727',
                  borderLeftWidth: 3, borderLeftColor: '#F59E0B',
                  borderRadius: 12, padding: 14, marginBottom: 8,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
              >
                <WarningCircleIcon size={18} color="#F59E0B" weight="fill" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FAFAFA', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                    {tenant.name}
                  </Text>
                  <Text style={{ color: '#A3A3A3', fontSize: 12, marginTop: 2 }}>
                    {tenant.property_name} · Room {tenant.unit_number}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: '#4F9D7E', borderRadius: 99, padding: 8 }}
                  onPress={(e) => e.stopPropagation?.()}
                >
                  <PhoneIcon size={14} color="#fff" weight="fill" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isLoading && (
          <View style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 16, height: 96, marginBottom: 16 }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
