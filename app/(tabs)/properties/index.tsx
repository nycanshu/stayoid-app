import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { PlusIcon } from 'phosphor-react-native';
import { useProperties } from '../../../lib/hooks/use-properties';
import { useDashboard } from '../../../lib/hooks/use-dashboard';
import { useColors } from '../../../lib/hooks/use-colors';
import { formatCurrency } from '../../../lib/utils/formatters';
import type { Property, DashboardProperty } from '../../../types/property';

function PropertyCard({
  property, stats, colors,
}: {
  property: Property;
  stats?: DashboardProperty;
  colors: ReturnType<typeof useColors>;
}) {
  const pct = stats ? Math.round((stats.occupied / (stats.total_slots || 1)) * 100) : 0;
  const barColor = pct >= 80 ? colors.success : pct >= 50 ? colors.warning : colors.danger;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/properties/${property.slug}`)}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
        borderRadius: 16, padding: 16, marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: 'SpaceGrotesk_700Bold' }}>
            {property.name}
          </Text>
          <Text style={{ color: colors.mutedFg, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
            {property.address}
          </Text>
        </View>
        <View style={{ backgroundColor: colors.mutedBg, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
            {property.property_type}
          </Text>
        </View>
      </View>

      {stats && (
        <>
          <View style={{ height: 6, backgroundColor: colors.mutedBg, borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
            <View style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: 99 }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.mutedFg, fontSize: 12 }}>
              {stats.occupied}/{stats.total_slots} rooms
            </Text>
            <Text style={{ color: colors.mutedFg, fontSize: 12 }}>
              {formatCurrency(stats.collected_rent)} of {formatCurrency(stats.expected_rent)}
            </Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

export default function PropertiesScreen() {
  const colors = useColors();
  const { data: properties, isLoading, refetch, isRefetching } = useProperties();
  const { data: dashboard } = useDashboard();

  const statsMap = Object.fromEntries((dashboard?.properties ?? []).map((p) => [p.id, p]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <View>
          <Text style={{ color: colors.foreground, fontSize: 20, fontFamily: 'Inter_600SemiBold' }}>Properties</Text>
          <Text style={{ color: colors.mutedFg, fontSize: 13, marginTop: 2 }}>
            {properties?.length ?? 0} properties
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/properties/new')}
          style={{ backgroundColor: colors.primary, borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <PlusIcon size={14} color="#fff" weight="bold" />
          <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <PropertyCard property={item} stats={statsMap[item.id]} colors={colors} />
          </View>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 }}>
              <Text style={{ color: colors.mutedFg, fontSize: 15, textAlign: 'center' }}>No properties yet</Text>
              <Text style={{ color: colors.mutedFg, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                Add your first property to get started.
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
