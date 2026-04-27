import {
  View, Text, TextInput, Pressable, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import {
  PlusIcon, MagnifyingGlassIcon, HouseIcon,
  CaretDownIcon, FunnelSimpleIcon,
} from 'phosphor-react-native';
import { useState, useCallback, useMemo } from 'react';
import { PropertyCard } from '../../../components/properties/PropertyCard';
import { PropertyCardSkeleton } from '../../../components/properties/PropertyCardSkeleton';
import { AddPropertyCard } from '../../../components/properties/AddPropertyCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { useProperties } from '../../../lib/hooks/use-properties';
import { useDashboard } from '../../../lib/hooks/use-dashboard';
import { useColors } from '../../../lib/hooks/use-colors';
import { useActionSheet } from '../../../components/ui/ActionSheet';
import { Entrance } from '../../../components/animations';

type SortKey = 'newest' | 'name' | 'occupancy';

const SORT_LABELS: Record<SortKey, string> = {
  newest:    'Newest first',
  name:      'Name (A–Z)',
  occupancy: 'Occupancy (high)',
};

export default function PropertiesScreen() {
  const colors = useColors();
  const { show: showActionSheet } = useActionSheet();
  const { data: properties, isLoading, refetch, isRefetching } = useProperties();
  const { data: dashboard } = useDashboard();

  const [query, setQuery]         = useState('');
  const [sort, setSort]           = useState<SortKey>('newest');
  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const statsMap = useMemo(
    () => Object.fromEntries((dashboard?.properties ?? []).map((p) => [p.id, p])),
    [dashboard?.properties],
  );

  const filteredSorted = useMemo(() => {
    const list = properties ?? [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q),
        )
      : list;

    const sorted = [...filtered];
    if (sort === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'newest') {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
      );
    } else if (sort === 'occupancy') {
      sorted.sort((a, b) => {
        const sa = statsMap[a.id], sb = statsMap[b.id];
        const ra = sa?.total_slots > 0 ? sa.occupied / sa.total_slots : 0;
        const rb = sb?.total_slots > 0 ? sb.occupied / sb.total_slots : 0;
        return rb - ra;
      });
    }
    return sorted;
  }, [properties, query, sort, statsMap]);

  const openSortPicker = useCallback(() => {
    showActionSheet({
      title: 'Sort properties',
      options: [
        { label: 'Newest first',     selected: sort === 'newest',    onPress: () => setSort('newest')    },
        { label: 'Name (A–Z)',       selected: sort === 'name',      onPress: () => setSort('name')      },
        { label: 'Occupancy (high)', selected: sort === 'occupancy', onPress: () => setSort('occupancy') },
      ],
    });
  }, [sort, showActionSheet]);

  const total = properties?.length ?? 0;

  // ── During first load (no cached data), render placeholder skeleton items ──
  const SKELETON_KEYS = ['s1', 's2', 's3', 's4'] as const;
  type Row = { id: string; __skeleton?: true } & Partial<(typeof filteredSorted)[number]>;
  const rows: Row[] = isLoading
    ? SKELETON_KEYS.map((k) => ({ id: k, __skeleton: true }))
    : (filteredSorted as Row[]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <FlatList<Row>
        data={rows}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); setFocusTick((t) => t + 1); }}
            tintColor={colors.primary}
          />
        }

        // ── Header ────────────────────────────────────────────────────────────
        ListHeaderComponent={
          <View>

            {/* ── Title row + icon-only Add button ── */}
            <Entrance trigger={focusTick} style={{ marginBottom: 20 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{
                    color: colors.foreground,
                    fontSize: 22,
                    fontFamily: 'Inter_600SemiBold',
                    letterSpacing: -0.3,
                    paddingRight: 0.3,
                  }}>
                    Properties
                  </Text>
                  <Text style={{
                    color: colors.mutedFg,
                    fontSize: 13,
                    fontFamily: 'Inter_400Regular',
                    marginTop: 2,
                  }}>
                    {total === 0
                      ? 'Manage your properties'
                      : `${total} ${total === 1 ? 'property' : 'properties'} in your portfolio`}
                  </Text>
                </View>

                {/* Icon-only + button — flat to match dashboard's no-shadow aesthetic */}
                <Pressable
                  onPress={() => router.push('/(tabs)/properties/new')}
                  android_ripple={null}
                  hitSlop={8}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: colors.primary,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <PlusIcon size={18} color="#fff" weight="bold" />
                </Pressable>
              </View>
            </Entrance>

            {/* ── Search card — skeleton during initial load ── */}
            <Entrance trigger={focusTick} delay={60}>
              {isLoading ? (
                <View style={{
                  backgroundColor: colors.card,
                  borderWidth: 1, borderColor: colors.border,
                  borderRadius: 12, padding: 14,
                  marginBottom: 12,
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                }}>
                  <Skeleton width={16} height={16} radius={4} />
                  <Skeleton width="60%" height={12} />
                </View>
              ) : (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  backgroundColor: colors.card,
                  borderWidth: 1, borderColor: colors.border,
                  borderRadius: 12, padding: 14,
                  marginBottom: 12,
                }}>
                  <MagnifyingGlassIcon size={16} color={colors.mutedFg} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search by name or address"
                    placeholderTextColor={colors.mutedFg}
                    style={{
                      flex: 1, color: colors.foreground,
                      fontSize: 13, fontFamily: 'Inter_400Regular', padding: 0,
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                  {query.length > 0 && (
                    <Pressable
                      onPress={() => setQuery('')}
                      hitSlop={8}
                      android_ripple={null}
                    >
                      <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
                        Clear
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </Entrance>

            {/* ── Sort card — skeleton during initial load ── */}
            <Entrance trigger={focusTick} delay={100}>
              {isLoading ? (
                <View style={{
                  backgroundColor: colors.card,
                  borderWidth: 1, borderColor: colors.border,
                  borderRadius: 12, padding: 14,
                  marginBottom: 12,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}>
                  <Skeleton width={36} height={36} radius={10} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Skeleton width={48} height={9} />
                    <Skeleton width={120} height={11} />
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={openSortPicker}
                  android_ripple={null}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    backgroundColor: colors.card,
                    borderWidth: 1, borderColor: colors.border,
                    borderRadius: 12, padding: 14,
                    marginBottom: 12,
                  }}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: colors.mutedBg,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FunnelSimpleIcon size={16} color={colors.mutedFg} weight="bold" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                      Sort by
                    </Text>
                    <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold', marginTop: 2 }}>
                      {SORT_LABELS[sort]}
                    </Text>
                  </View>
                  <CaretDownIcon size={14} color={colors.mutedFg} />
                </Pressable>
              )}
            </Entrance>

            {/* ── Empty / no-results state ── */}
            {!isLoading && filteredSorted.length === 0 && (
              <Entrance trigger={focusTick} delay={140}>
                <View style={{
                  backgroundColor: colors.card,
                  borderWidth: 1, borderColor: colors.border,
                  borderRadius: 12, padding: 16,
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: colors.mutedBg,
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                  }}>
                    <HouseIcon size={20} color={colors.mutedFg} weight="duotone" />
                  </View>
                  <Text style={{
                    color: colors.foreground, fontSize: 13,
                    fontFamily: 'Inter_600SemiBold', marginBottom: 4, textAlign: 'center',
                  }}>
                    {query ? `No results for "${query}"` : 'No properties yet'}
                  </Text>
                  <Text style={{
                    color: colors.mutedFg, fontSize: 12,
                    fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18,
                  }}>
                    {query
                      ? 'Try a different search term.'
                      : 'Add your first property to start managing.'}
                  </Text>
                </View>
              </Entrance>
            )}
          </View>
        }

        // ── Property cards — skeleton during load, real cards after ─────────
        renderItem={({ item, index }) => (
          <Entrance delay={index * 55} trigger={focusTick}>
            {item.__skeleton ? (
              <PropertyCardSkeleton colors={colors} />
            ) : (
              <PropertyCard
                property={item as (typeof filteredSorted)[number]}
                stats={statsMap[item.id]}
                colors={colors}
              />
            )}
          </Entrance>
        )}

        // ── Add Property footer card ─────────────────────────────────────────
        ListFooterComponent={
          !isLoading && filteredSorted.length > 0 ? (
            <Entrance delay={filteredSorted.length * 55 + 55} trigger={focusTick}>
              <View style={{ marginTop: 12 }}>
                <AddPropertyCard colors={colors} />
              </View>
            </Entrance>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
