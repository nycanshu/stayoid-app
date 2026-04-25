import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, WarningCircleIcon } from 'phosphor-react-native';
import { useTenants } from '../../../../lib/hooks/use-tenants';
import { Input, Badge, Avatar, Button } from '../../../../components/ui';
import type { Tenant } from '../../../../types/tenant';

function TenantRow({ tenant }: { tenant: Tenant }) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727',
        borderRadius: 12, padding: 14, marginBottom: 8,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}
      onPress={() => router.push(`/(tabs)/more/tenants/${tenant.slug}`)}
    >
      <Avatar name={tenant.name} size="md" bg="#272727" />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FAFAFA', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
          {tenant.name}
        </Text>
        <Text style={{ color: '#A3A3A3', fontSize: 12, marginTop: 2 }}>
          {tenant.property_name} · Room {tenant.unit_number}
        </Text>
        {tenant.has_unpaid && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <WarningCircleIcon size={12} color="#F59E0B" weight="fill" />
            <Text style={{ color: '#F59E0B', fontSize: 11 }}>Unpaid this month</Text>
          </View>
        )}
      </View>
      <Badge variant={tenant.is_active ? 'success' : 'muted'}>
        {tenant.is_active ? 'Active' : 'Exited'}
      </Badge>
    </TouchableOpacity>
  );
}

export default function TenantsScreen() {
  const [query, setQuery] = useState('');
  const { data: tenants, isLoading, refetch, isRefetching } = useTenants({ query: query || undefined });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: '#FAFAFA', fontSize: 20, fontFamily: 'Inter_600SemiBold' }}>Tenants</Text>
        <Button size="sm" onPress={() => router.push('/(tabs)/more/tenants/new')}>
          + Add
        </Button>
      </View>

      <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
        <Input
          placeholder="Search tenants"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={tenants ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <TenantRow tenant={item} />
          </View>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F9D7E" />}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ color: '#A3A3A3', fontSize: 15 }}>No tenants found</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
