import {
  View, Text, TextInput, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  PlusIcon, MagnifyingGlassIcon, HouseIcon,
} from 'phosphor-react-native';
import { useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'nativewind';
import { PropertyCard } from '../../../components/properties/PropertyCard';
import { PropertyCardSkeleton } from '../../../components/properties/PropertyCardSkeleton';
import { PortfolioStatsStrip } from '../../../components/properties/PortfolioStatsStrip';
import { Skeleton } from '../../../components/ui/skeleton';
import { InfiniteList } from '../../../components/ui/InfiniteList';
import { useInfiniteProperties } from '../../../lib/hooks/use-properties';
import { useDashboard } from '../../../lib/hooks/use-dashboard';
import { useDebouncedValue } from '../../../lib/hooks/use-debounced-value';
import { useTabFocusRefetch } from '../../../lib/hooks/use-tab-focus-refetch';
import { Entrance } from '../../../components/animations';
import { THEME } from '../../../lib/theme';
import type { PropertyFilters } from '../../../lib/api/properties';

function FirstLoadSkeleton() {
  return (
    <View className="gap-3">
      {[0, 1, 2, 3].map((i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </View>
  );
}

export default function PropertiesScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { data: dashboard } = useDashboard();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  const filters = useMemo<Omit<PropertyFilters, 'page' | 'page_size'>>(() => ({
    query: debouncedQuery || undefined,
  }), [debouncedQuery]);

  const {
    data, isLoading, isRefetching,
    isFetchingNextPage, hasNextPage,
    fetchNextPage, refetch,
  } = useInfiniteProperties(filters);

  useTabFocusRefetch(refetch);

  const properties = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.results),
    [data],
  );
  const total = data?.pages?.[0]?.count ?? 0;

  const statsMap = useMemo(
    () => Object.fromEntries((dashboard?.properties ?? []).map((p) => [p.id, p])),
    [dashboard?.properties],
  );

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <InfiniteList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard property={item} stats={statsMap[item.id]} />
        )}
        isLoading={isLoading}
        isRefetching={isRefetching}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
        onRefresh={handleRefresh}
        onEndReached={fetchNextPage}
        FirstLoadSkeleton={<FirstLoadSkeleton />}
        itemGap={12}
        ListEmptyComponent={
          <View className="bg-card border border-border rounded-xl p-4 items-center mb-3">
            <View className="size-11 rounded-full bg-muted items-center justify-center mb-2.5">
              <HouseIcon size={20} color={palette.mutedForeground} weight="duotone" />
            </View>
            <Text
              className="text-foreground text-[13px] mb-1 text-center"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {debouncedQuery ? `No results for "${debouncedQuery}"` : 'No properties yet'}
            </Text>
            <Text
              className="text-muted-foreground text-xs text-center leading-[18px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {debouncedQuery
                ? 'Try a different search term.'
                : 'Add your first property to start managing.'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View>
            <Entrance trigger={1} style={{ marginBottom: 20 }}>
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

            <View style={{ marginBottom: 12 }}>
              <PortfolioStatsStrip
                properties={dashboard?.properties}
                totalProperties={total}
                isLoading={isLoading}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              {isLoading ? (
                <View className="bg-card border border-border rounded-xl p-3.5 flex-row items-center gap-2.5">
                  <Skeleton width={16} height={16} radius={4} />
                  <Skeleton width="60%" height={12} />
                </View>
              ) : (
                <View className="flex-row items-center gap-2.5 bg-card border border-border rounded-xl p-3.5">
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
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
