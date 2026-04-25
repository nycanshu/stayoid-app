import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useProperty, useSlots } from '../../../../lib/hooks/use-properties';
import { useTenants } from '../../../../lib/hooks/use-tenants';
import { formatFloorName } from '../../../../lib/utils/formatters';
import { Badge, Avatar } from '../../../../components/ui';
import type { Slot } from '../../../../types/property';

type Tab = 'floors' | 'tenants' | 'payments';

function RoomChip({ slot }: { slot: Slot }) {
  const bgColor = slot.is_occupied ? 'rgba(79,157,126,0.15)' : '#1C1C1C';
  const borderColor = slot.is_occupied ? 'rgba(79,157,126,0.4)' : '#272727';

  return (
    <TouchableOpacity
      style={{
        width: 76, height: 76, borderRadius: 12,
        backgroundColor: bgColor, borderWidth: 1, borderColor,
        alignItems: 'center', justifyContent: 'center', margin: 4,
      }}
      onPress={() => {
        if (slot.active_tenant) {
          router.push(`/(tabs)/more/tenants/${slot.active_tenant.slug}`);
        }
      }}
    >
      <Text style={{ color: '#A3A3A3', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
        {slot.unit_number}
      </Text>
      <Text
        style={{
          color: slot.is_occupied ? '#FAFAFA' : '#A3A3A3',
          fontSize: 11, marginTop: 2, textAlign: 'center', paddingHorizontal: 4,
        }}
        numberOfLines={1}
      >
        {slot.active_tenant?.name.split(' ')[0] ?? 'Vacant'}
      </Text>
    </TouchableOpacity>
  );
}

export default function PropertyDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('floors');

  const { data: property, refetch, isRefetching } = useProperty(slug);
  const { data: slots } = useSlots(property?.id);
  const { data: tenants } = useTenants({ property_id: property?.id, active: true });

  const floorGroups = (slots ?? []).reduce<Record<number, Slot[]>>((acc, slot) => {
    (acc[slot.floor_number] ??= []).push(slot);
    return acc;
  }, {});
  const sortedFloors = Object.keys(floorGroups).map(Number).sort((a, b) => a - b);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'floors', label: 'Floors' },
    { key: 'tenants', label: 'Tenants' },
    { key: 'payments', label: 'Payments' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon size={22} color="#4F9D7E" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FAFAFA', fontSize: 18, fontFamily: 'PlayfairDisplay_600SemiBold' }}>
            {property?.name ?? '…'}
          </Text>
          <Text style={{ color: '#A3A3A3', fontSize: 12 }}>
            {property?.property_type_display} · {property?.address}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#272727', marginHorizontal: 16 }}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              flex: 1, paddingVertical: 12, alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.key ? '#4F9D7E' : 'transparent',
            }}
          >
            <Text style={{
              color: activeTab === tab.key ? '#4F9D7E' : '#A3A3A3',
              fontSize: 14,
              fontFamily: activeTab === tab.key ? 'Inter_600SemiBold' : 'Inter_400Regular',
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F9D7E" />}
      >
        {activeTab === 'floors' && (
          <>
            {sortedFloors.map((floorNum) => (
              <View key={floorNum} style={{ marginBottom: 20 }}>
                <Text style={{
                  color: '#A3A3A3', fontSize: 12, fontFamily: 'Inter_600SemiBold',
                  marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  {formatFloorName(floorNum)}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {floorGroups[floorNum].map((slot) => (
                    <RoomChip key={slot.id} slot={slot} />
                  ))}
                </View>
              </View>
            ))}
            {sortedFloors.length === 0 && (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ color: '#A3A3A3' }}>No rooms added yet.</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'tenants' && (
          <>
            {(tenants ?? []).map((tenant) => (
              <TouchableOpacity
                key={tenant.id}
                style={{
                  backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727',
                  borderRadius: 12, padding: 14, marginBottom: 8,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
                onPress={() => router.push(`/(tabs)/more/tenants/${tenant.slug}`)}
              >
                <Avatar name={tenant.name} size="sm" bg="#272727" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FAFAFA', fontSize: 15 }}>{tenant.name}</Text>
                  <Text style={{ color: '#A3A3A3', fontSize: 12, marginTop: 2 }}>
                    Room {tenant.unit_number}
                  </Text>
                </View>
                <Badge variant="success">Active</Badge>
              </TouchableOpacity>
            ))}
            {(tenants ?? []).length === 0 && (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ color: '#A3A3A3' }}>No tenants in this property.</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'payments' && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ color: '#A3A3A3' }}>See the Payments tab for this property's payments.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
