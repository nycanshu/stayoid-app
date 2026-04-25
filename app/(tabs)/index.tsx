import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboard } from '../../lib/hooks/use-dashboard';
import { useTenants } from '../../lib/hooks/use-tenants';
import { useAuthStore } from '../../lib/stores/auth-store';
import { formatCurrency, formatMonthYear } from '../../lib/utils/formatters';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: dashboard, isLoading, refetch, isRefetching } = useDashboard();
  const { data: unpaidTenants } = useTenants({ unpaid: true });

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F9D7E" />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center py-4">
          <View>
            <Text className="text-[#FAFAFA] text-lg font-semibold">{greeting}, {firstName}</Text>
            <Text className="text-[#A3A3A3] text-sm">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-[#4F9D7E] items-center justify-center">
            <Text className="text-white text-base font-semibold">{firstName[0]}</Text>
          </View>
        </View>

        {/* Collection card */}
        {dashboard && (
          <View className="bg-[#181818] border border-[#272727] rounded-2xl p-5 mb-4">
            <Text className="text-[#A3A3A3] text-sm mb-1">{formatMonthYear(month, year)} Collection</Text>
            <View className="flex-row items-end gap-2 mb-2">
              <Text className="text-[#FAFAFA] text-3xl font-semibold">{formatCurrency(dashboard.collected_rent)}</Text>
              <Text className="text-[#A3A3A3] text-sm mb-1">of {formatCurrency(dashboard.expected_rent)}</Text>
            </View>
            <View className="h-2 bg-[#272727] rounded-full overflow-hidden mb-2">
              <View
                className="h-full bg-[#4F9D7E] rounded-full"
                style={{ width: `${Math.min(dashboard.collection_rate, 100)}%` }}
              />
            </View>
            <Text className="text-[#A3A3A3] text-xs">{Math.round(dashboard.collection_rate)}% collected</Text>
          </View>
        )}

        {/* Stat grid */}
        {dashboard && (
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-[#181818] border border-[#272727] rounded-xl p-4">
              <Text className="text-[#FAFAFA] text-2xl font-semibold">{Math.round(dashboard.occupancy_rate)}%</Text>
              <Text className="text-[#A3A3A3] text-xs mt-1">Occupancy</Text>
              <Text className="text-[#A3A3A3] text-xs">{dashboard.occupied_slots} of {dashboard.total_slots}</Text>
            </View>
            <View className="flex-1 bg-[#181818] border border-[#272727] rounded-xl p-4">
              <Text className="text-[#FAFAFA] text-2xl font-semibold">{dashboard.total_properties}</Text>
              <Text className="text-[#A3A3A3] text-xs mt-1">Properties</Text>
              <Text className="text-[#A3A3A3] text-xs">{dashboard.total_slots} rooms</Text>
            </View>
          </View>
        )}

        {/* Needs attention */}
        {unpaidTenants && unpaidTenants.length > 0 && (
          <View className="mb-4">
            <Text className="text-[#FAFAFA] text-base font-semibold mb-2">Needs Attention</Text>
            {unpaidTenants.slice(0, 3).map((tenant) => (
              <View
                key={tenant.id}
                className="bg-[#181818] border border-[#272727] rounded-xl p-4 mb-2 border-l-2 border-l-[#F59E0B]"
              >
                <Text className="text-[#F59E0B] text-xs mb-1">Unpaid this month</Text>
                <Text className="text-[#FAFAFA] text-sm font-medium">{tenant.name}</Text>
                <Text className="text-[#A3A3A3] text-xs">{tenant.slot_detail.property_name} · Room {tenant.slot_detail.unit_number}</Text>
              </View>
            ))}
          </View>
        )}

        {isLoading && (
          <View className="bg-[#181818] border border-[#272727] rounded-2xl h-24 mb-4" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
