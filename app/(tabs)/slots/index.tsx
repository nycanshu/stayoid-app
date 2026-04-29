import {
  View, Text, Pressable, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import {
  ArrowLeftIcon, BedIcon, MagnifyingGlassIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useInfiniteSlots, useProperties } from '../../../lib/hooks/use-properties';
import { useDebouncedValue } from '../../../lib/hooks/use-debounced-value';
import { useTabFocusRefetch } from '../../../lib/hooks/use-tab-focus-refetch';
import { Skeleton } from '../../../components/ui/skeleton';
import { InfiniteList } from '../../../components/ui/InfiniteList';
import { Entrance } from '../../../components/animations';
import { PropertyFilterBar } from '../../../components/properties/PropertyFilterBar';
import { SlotListRow } from '../../../components/properties/SlotListRow';
import { THEME } from '../../../lib/theme';
import { cn } from '../../../lib/utils';
import type { SlotFilters } from '../../../lib/api/properties';

type FilterKey = 'all' | 'vacant' | 'occupied';
const FILTER_LABELS: Record<FilterKey, string> = {
  all:      'All',
  vacant:   'Vacant',
  occupied: 'Occupied',
};

function filterToVacantParam(f: FilterKey): boolean | undefined {
  if (f === 'vacant')   return true;
  if (f === 'occupied') return false;
  return undefined;
}

function FilterChips({
  active, currentCount, onChange,
}: {
  active: FilterKey;
  /** Count for the currently selected chip — comes from paginated response. */
  currentCount: number;
  onChange: (k: FilterKey) => void;
}) {
  const keys: FilterKey[] = ['all', 'vacant', 'occupied'];
  return (
    <View className="flex-row gap-2">
      {keys.map((k) => {
        const isActive = active === k;
        const isVacant = k === 'vacant';
        const accentBg = isVacant ? 'bg-primary-bg' : k === 'occupied' ? 'bg-success-bg' : 'bg-primary-bg';
        const accentBorder = isVacant ? 'border-primary' : k === 'occupied' ? 'border-success' : 'border-primary';
        const accentText = isVacant ? 'text-primary' : k === 'occupied' ? 'text-success' : 'text-primary';
        return (
          <Pressable
            key={k}
            onPress={() => onChange(k)}
            android_ripple={null}
            className={cn(
              'flex-row items-center gap-1.5 border rounded-full px-3 py-1.5',
              isActive ? `${accentBorder} ${accentBg}` : 'border-border bg-card',
            )}
          >
            <Text
              className={cn('text-xs', isActive ? accentText : 'text-foreground')}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {FILTER_LABELS[k]}
            </Text>
            {isActive && (
              <View
                className={cn(
                  'rounded-full px-1.5 py-px min-w-[18px] items-center',
                  `${accentBg} opacity-80`,
                )}
              >
                <Text
                  className={cn('text-[10px]', accentText)}
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {currentCount}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function ListSkeleton() {
  return (
    <View className="gap-2.5">
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-card border border-border rounded-xl p-3.5 flex-row items-center gap-3"
        >
          <Skeleton width={44} height={44} radius={10} />
          <View className="flex-1 gap-1.5">
            <Skeleton width="50%" height={13} />
            <Skeleton width="80%" height={11} />
            <Skeleton width="40%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

function getEmptyCopy(query: string, filter: FilterKey) {
  if (query) {
    return {
      title: `No slots match "${query}"`,
      description: 'Try a different search term.',
    };
  }
  if (filter === 'vacant') {
    return {
      title: 'No vacant slots',
      description: 'Every slot in this view is occupied — nice!',
    };
  }
  if (filter === 'occupied') {
    return {
      title: 'No occupied slots',
      description: 'Vacant slots show up under the Vacant filter.',
    };
  }
  return {
    title: 'No slots yet',
    description: 'Add floors and units in property detail to create slots.',
  };
}

export default function SlotsScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  // Pre-warm property list for the filter bar.
  useProperties();

  const filters = useMemo<Omit<SlotFilters, 'page' | 'page_size'>>(() => ({
    property_id: propertyId,
    vacant: filterToVacantParam(filter),
    query: debouncedQuery || undefined,
  }), [propertyId, filter, debouncedQuery]);

  const {
    data, isLoading, isRefetching,
    isFetchingNextPage, hasNextPage,
    fetchNextPage, refetch,
  } = useInfiniteSlots(filters);

  useTabFocusRefetch(refetch);

  const slots = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.results),
    [data],
  );
  const currentCount = data?.pages?.[0]?.count ?? 0;

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  const empty = getEmptyCopy(debouncedQuery, filter);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <InfiniteList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SlotListRow slot={item} />}
        isLoading={isLoading}
        isRefetching={isRefetching}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
        onRefresh={handleRefresh}
        onEndReached={fetchNextPage}
        FirstLoadSkeleton={<ListSkeleton />}
        ListEmptyComponent={
          <View className="bg-card border border-border rounded-xl p-7 items-center">
            <View className="size-[52px] rounded-2xl bg-muted items-center justify-center mb-3">
              <BedIcon size={24} color={palette.mutedForeground} weight="duotone" />
            </View>
            <Text
              className="text-foreground text-sm mb-1 text-center"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {empty.title}
            </Text>
            <Text
              className="text-muted-foreground text-xs text-center leading-[18px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {empty.description}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View>
            <Entrance trigger={1} style={{ marginBottom: 20 }}>
              <View className="flex-row items-center mb-3.5">
                <Pressable
                  onPress={() => router.back()}
                  android_ripple={null}
                  hitSlop={8}
                  className="size-10 rounded-[10px] border border-border bg-card items-center justify-center"
                >
                  <ArrowLeftIcon size={18} color={palette.foreground} />
                </Pressable>
              </View>

              <Text
                className="text-foreground text-[22px] tracking-tight"
                style={{ fontFamily: 'Inter_600SemiBold', paddingRight: 0.3 }}
              >
                Slots
              </Text>
              <Text
                className="text-muted-foreground text-[13px] mt-0.5"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Vacancy and occupancy across all properties
              </Text>
            </Entrance>

            <View style={{ marginBottom: 12 }}>
              <PropertyFilterBar value={propertyId} onChange={setPropertyId} />
            </View>

            <View
              className="flex-row items-center gap-2.5 bg-card border border-border rounded-xl p-3.5"
              style={{ marginBottom: 12 }}
            >
              <MagnifyingGlassIcon size={16} color={palette.mutedForeground} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search slot, unit, tenant…"
                placeholderTextColor={palette.mutedForeground}
                className="flex-1 text-foreground text-[13px] p-0"
                style={{ fontFamily: 'Inter_400Regular' }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8} android_ripple={null}>
                  <Text
                    className="text-muted-foreground text-xs"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    Clear
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <FilterChips
                active={filter}
                currentCount={currentCount}
                onChange={setFilter}
              />
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
