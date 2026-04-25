import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTenants } from '../../../../lib/hooks/use-tenants';
import type { Tenant } from '../../../../types/tenant';

function TenantRow({ tenant }: { tenant: Tenant }) {
  const initials = tenant.name.split(' ').slice(0, 2).map((n) => n[0]).join('');
  return (
    <TouchableOpacity
      style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
      onPress={() => router.push(`/(tabs)/more/tenants/${tenant.slug}`)}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#272727', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FAFAFA', fontFamily: 'Inter_600SemiBold' }}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FAFAFA', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>{tenant.name}</Text>
        <Text style={{ color: '#A3A3A3', fontSize: 12, marginTop: 2 }}>
          {tenant.slot_detail.property_name} · Room {tenant.slot_detail.unit_number}
        </Text>
        {tenant.has_unpaid && (
          <Text style={{ color: '#F59E0B', fontSize: 11, marginTop: 2 }}>⚠ Unpaid this month</Text>
        )}
      </View>
      <View style={{ backgroundColor: tenant.is_active ? '#1E3C28' : '#272727', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ color: tenant.is_active ? '#22C55E' : '#A3A3A3', fontSize: 11 }}>
          {tenant.is_active ? 'Active' : 'Exited'}
        </Text>
      </View>
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
        <TouchableOpacity
          style={{ backgroundColor: '#4F9D7E', borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8 }}
          onPress={() => router.push('/(tabs)/more/tenants/new')}
        >
          <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
        <TextInput
          style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#FAFAFA', fontSize: 14 }}
          placeholder="🔍 Search tenants"
          placeholderTextColor="#A3A3A3"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={tenants ?? []}
        keyExtractor={(item) => String(item.id)}
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
