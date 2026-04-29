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
import { useColorScheme } from 'nativewind';
import { PropertyCard } from '../../../components/properties/PropertyCard';
import { PropertyCardSkeleton } from '../../../components/properties/PropertyCardSkeleton';
import { AddPropertyCard } from '../../../components/properties/AddPropertyCard';
import { PortfolioStatsStrip } from '../../../components/properties/PortfolioStatsStrip';
import { Skeleton } from '../../../components/ui/skeleton';
import { useProperties } from '../../../lib/hooks/use-properties';
import { useDashboard } from '../../../lib/hooks/use-dashboard';
import { useActionSheet } from '../../../components/ui/ActionSheet';
import { Entrance } from '../../../components/animations';
import { THEME } from '../../../lib/theme';

type SortKey = 'newest' | 'name' | 'occupancy';

const SORT_LABELS: Record<SortKey, string> = {
  newest:    'Newest first',
  name:      'Name (A–Z)',
  occupancy: 'Occupancy (high)',
};

export default function PropertiesScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
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
        ItemSeparatorComponent={() => <View className="h-3" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); setFocusTick((t) => t + 1); }}
            tintColor={palette.primary}
          />
        }

        ListHeaderComponent={
          <View>
            <Entrance trigger={focusTick} style={{ marginBottom: 20 }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text
                    className="text-foreground text-[22px] tracking-tight"
                    style={{ fontFamily: 'Inter_600SemiBold', paddingRight: 0.3 }}
                  >
                    Properties
                  </Text>
                  <Text
                    className="text-muted-foreground text-[13px] mt-0.5"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {total === 0
                      ? 'Manage your properties'
                      : `${total} ${total === 1 ? 'property' : 'properties'} in your portfolio`}
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.push('/properties/new' as never)}
                  android_ripple={null}
                  hitSlop={8}
                  className="size-10 rounded-[10px] bg-primary items-center justify-center"
                >
                  <PlusIcon size={18} color="#fff" weight="bold" />
                </Pressable>
              </View>
            </Entrance>

            <Entrance trigger={focusTick} delay={40} style={{ marginBottom: 12 }}>
              <PortfolioStatsStrip
                properties={dashboard?.properties}
                totalProperties={total}
                isLoading={isLoading}
              />
            </Entrance>

            <Entrance trigger={focusTick} delay={60}>
              {isLoading ? (
                <View className="bg-card border border-border rounded-xl p-3.5 mb-3 flex-row items-center gap-2.5">
                  <Skeleton width={16} height={16} radius={4} />
                  <Skeleton width="60%" height={12} />
                </View>
              ) : (
                <View className="flex-row items-center gap-2.5 bg-card border border-border rounded-xl p-3.5 mb-3">
                  <MagnifyingGlassIcon size={16} color={palette.mutedForeground} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search by name or address"
                    placeholderTextColor={palette.mutedForeground}
                    className="flex-1 text-foreground text-[13px] p-0"
                    style={{ fontFamily: 'Inter_400Regular' }}
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
                      <Text
                        className="text-muted-foreground text-xs"
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                      >
                        Clear
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </Entrance>

            <Entrance trigger={focusTick} delay={100}>
              {isLoading ? (
                <View className="bg-card border border-border rounded-xl p-3.5 mb-3 flex-row items-center gap-3">
                  <Skeleton width={36} height={36} radius={10} />
                  <View className="flex-1 gap-1.5">
                    <Skeleton width={48} height={9} />
                    <Skeleton width={120} height={11} />
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={openSortPicker}
                  android_ripple={null}
                  className="flex-row items-center gap-3 bg-card border border-border rounded-xl p-3.5 mb-3"
                >
                  <View className="size-9 rounded-[10px] bg-muted items-center justify-center">
                    <FunnelSimpleIcon size={16} color={palette.mutedForeground} weight="bold" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-muted-foreground text-[11px]"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      Sort by
                    </Text>
                    <Text
                      className="text-foreground text-[13px] mt-0.5"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {SORT_LABELS[sort]}
                    </Text>
                  </View>
                  <CaretDownIcon size={14} color={palette.mutedForeground} />
                </Pressable>
              )}
            </Entrance>

            {!isLoading && filteredSorted.length === 0 && (
              <Entrance trigger={focusTick} delay={140}>
                <View className="bg-card border border-border rounded-xl p-4 items-center mb-3">
                  <View className="size-11 rounded-full bg-muted items-center justify-center mb-2.5">
                    <HouseIcon size={20} color={palette.mutedForeground} weight="duotone" />
                  </View>
                  <Text
                    className="text-foreground text-[13px] mb-1 text-center"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    {query ? `No results for "${query}"` : 'No properties yet'}
                  </Text>
                  <Text
                    className="text-muted-foreground text-xs text-center leading-[18px]"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {query
                      ? 'Try a different search term.'
                      : 'Add your first property to start managing.'}
                  </Text>
                </View>
              </Entrance>
            )}
          </View>
        }

        renderItem={({ item, index }) => (
          <Entrance delay={index * 55} trigger={focusTick}>
            {item.__skeleton ? (
              <PropertyCardSkeleton />
            ) : (
              <PropertyCard
                property={item as (typeof filteredSorted)[number]}
                stats={statsMap[item.id]}
              />
            )}
          </Entrance>
        )}

        ListFooterComponent={
          !isLoading && filteredSorted.length > 0 ? (
            <Entrance delay={filteredSorted.length * 55 + 55} trigger={focusTick}>
              <View className="mt-3">
                <AddPropertyCard />
              </View>
            </Entrance>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
