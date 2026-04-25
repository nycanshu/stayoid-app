import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProperties } from '../../../lib/hooks/use-properties';
import { useDashboard } from '../../../lib/hooks/use-dashboard';
import { formatCurrency } from '../../../lib/utils/formatters';
import type { Property, DashboardProperty } from '../../../types/property';

function PropertyCard({ property, stats }: { property: Property; stats?: DashboardProperty }) {
  const pct = stats ? Math.round((stats.occupied_slots / (stats.total_slots || 1)) * 100) : 0;
  return (
    <TouchableOpacity
      className="bg-[#181818] border border-[#272727] rounded-2xl p-4 mb-3"
      onPress={() => router.push(`/(tabs)/properties/${property.slug}`)}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-[#FAFAFA] text-base font-semibold" style={{ fontFamily: 'PlayfairDisplay_600SemiBold' }}>{property.name}</Text>
          <Text className="text-[#A3A3A3] text-xs mt-0.5" numberOfLines={1}>{property.address}</Text>
        </View>
        <View className="bg-[#272727] rounded-full px-2.5 py-1">
          <Text className="text-[#A3A3A3] text-xs">{property.type}</Text>
        </View>
      </View>
      {stats && (
        <>
          <View className="h-2 bg-[#272727] rounded-full overflow-hidden mb-2">
            <View className="h-full bg-[#4F9D7E] rounded-full" style={{ width: `${pct}%` }} />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[#A3A3A3] text-xs">{stats.occupied_slots}/{stats.total_slots} rooms</Text>
            <Text className="text-[#A3A3A3] text-xs">
              {stats.collected_rent >= stats.expected_rent
                ? <Text className="text-[#22C55E]">All collected ✓</Text>
                : `${formatCurrency(stats.collected_rent)} of ${formatCurrency(stats.expected_rent)}`}
            </Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

export default function PropertiesScreen() {
  const { data: properties, isLoading, refetch, isRefetching } = useProperties();
  const { data: dashboard } = useDashboard();

  const statsMap = Object.fromEntries((dashboard?.properties ?? []).map((p) => [p.id, p]));

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <View className="flex-row justify-between items-center px-4 py-4">
        <View>
          <Text className="text-[#FAFAFA] text-xl font-semibold">Properties</Text>
          <Text className="text-[#A3A3A3] text-sm">{properties?.length ?? 0} properties</Text>
        </View>
        <TouchableOpacity
          className="bg-[#4F9D7E] rounded-full px-4 py-2"
          onPress={() => router.push('/(tabs)/properties/new')}
        >
          <Text className="text-white text-sm font-semibold">+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="px-4">
            <PropertyCard property={item} stats={statsMap[item.id]} />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F9D7E" />
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View className="items-center py-16 px-4">
              <Text className="text-[#A3A3A3] text-base text-center">No properties yet</Text>
              <Text className="text-[#A3A3A3] text-sm text-center mt-1">Add your first property to get started.</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
