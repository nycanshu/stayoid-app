import {
  View, Text, TextInput, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import {
  PlusIcon, MagnifyingGlassIcon, UsersIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useInfiniteTenants } from '../../../lib/hooks/use-tenants';
import { useDebouncedValue } from '../../../lib/hooks/use-debounced-value';
import { useTabFocusRefetch } from '../../../lib/hooks/use-tab-focus-refetch';
import { TenantCard } from '../../../components/tenants/TenantCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { InfiniteList } from '../../../components/ui/InfiniteList';
import { Entrance } from '../../../components/animations';
import { PropertyFilterBar } from '../../../components/properties/PropertyFilterBar';
import { THEME } from '../../../lib/theme';
import { cn } from '../../../lib/utils';
import type { TenantFilters } from '../../../lib/api/tenants';

type FilterKey = 'all' | 'active' | 'exited' | 'unpaid';
const FILTER_LABELS: Record<FilterKey, string> = {
  all:    'All',
  active: 'Active',
  exited: 'Exited',
  unpaid: 'Unpaid',
};

function filterToParams(f: FilterKey): Partial<TenantFilters> {
  switch (f) {
    case 'active': return { active: true };
    case 'exited': return { active: false };
    case 'unpaid': return { unpaid: true, active: true };
    default:       return {};
  }
}

function FilterChips({
  active, onChange,
}: {
  active: FilterKey;
  onChange: (k: FilterKey) => void;
}) {
  const keys: FilterKey[] = ['all', 'active', 'exited', 'unpaid'];
  return (
    <View className="flex-row flex-wrap gap-2">
      {keys.map((k) => {
        const isActive = active === k;
        const isUnpaid = k === 'unpaid';
        const accentClass = isUnpaid ? 'text-warning' : 'text-primary';
        const accentBgClass = isUnpaid ? 'bg-warning-bg' : 'bg-primary-bg';
        const accentBorderClass = isUnpaid ? 'border-warning' : 'border-primary';
        return (
          <Pressable
            key={k}
            onPress={() => onChange(k)}
            android_ripple={null}
            className={cn(
              'flex-row items-center gap-1.5 border rounded-full px-3 py-1.5',
              isActive
                ? `${accentBorderClass} ${accentBgClass}`
                : 'border-border bg-card',
            )}
          >
            <Text
              className={cn(
                'text-xs',
                isActive ? accentClass : 'text-foreground',
              )}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {FILTER_LABELS[k]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EmptyState({
  query, filter, mutedFg,
}: { query: string; filter: FilterKey; mutedFg: string }) {
  let title: string;
  let description: string;
  if (query) {
    title = `No matches for "${query}"`;
    description = 'Try a different search term.';
  } else if (filter === 'unpaid') {
    title = 'All caught up';
    description = 'Every active tenant has paid this month.';
  } else if (filter === 'exited') {
    title = 'No exited tenants';
    description = 'Tenants who have moved out will appear here.';
  } else if (filter === 'active') {
    title = 'No active tenants yet';
    description = 'Add your first tenant to start managing.';
  } else {
    title = 'No tenants yet';
    description = 'Add your first tenant to start managing.';
  }
  return (
    <View className="bg-card border border-border rounded-xl p-7 items-center">
      <View className="size-[52px] rounded-2xl bg-muted items-center justify-center mb-3">
        <UsersIcon size={24} color={mutedFg} weight="duotone" />
      </View>
      <Text
        className="text-foreground text-sm mb-1 text-center"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {title}
      </Text>
      <Text
        className="text-muted-foreground text-xs text-center leading-[18px]"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {description}
      </Text>
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
          <Skeleton width={40} height={40} radius={20} />
          <View className="flex-1 gap-1.5">
            <Skeleton width="55%" height={13} />
            <Skeleton width="80%" height={11} />
            <Skeleton width="40%" height={11} />
          </View>
          <Skeleton width={50} height={18} radius={99} />
        </View>
      ))}
    </View>
  );
}

export default function TenantsScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const [query, setQuery]           = useState('');
  const [filter, setFilter]         = useState<FilterKey>('all');
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  const filters = useMemo<Omit<TenantFilters, 'page' | 'page_size'>>(() => ({
    query: debouncedQuery || undefined,
    property_id: propertyId,
    ...filterToParams(filter),
  }), [debouncedQuery, propertyId, filter]);

  const {
    data, isLoading, isRefetching,
    isFetchingNextPage, hasNextPage,
    fetchNextPage, refetch,
  } = useInfiniteTenants(filters);

  useTabFocusRefetch(refetch);

  const tenants = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.results),
    [data],
  );
  const total = data?.pages?.[0]?.count ?? 0;

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <InfiniteList
        data={tenants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TenantCard tenant={item} />}
        isLoading={isLoading}
        isRefetching={isRefetching}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
        onRefresh={handleRefresh}
        onEndReached={fetchNextPage}
        FirstLoadSkeleton={<ListSkeleton />}
        ListEmptyComponent={
          <EmptyState query={debouncedQuery} filter={filter} mutedFg={palette.mutedForeground} />
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
                    Tenants
                  </Text>
                  <Text
                    className="text-muted-foreground text-[13px] mt-0.5"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {total === 0
                      ? 'Manage your tenants'
                      : `${total} ${total === 1 ? 'tenant' : 'tenants'} on record`}
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/tenants/new' as never)}
                  android_ripple={null}
                  hitSlop={8}
                  className="size-10 rounded-[10px] bg-primary items-center justify-center"
                >
                  <PlusIcon size={18} color="#fff" weight="bold" />
                </Pressable>
              </View>
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
                placeholder="Search by name or phone"
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
              <FilterChips active={filter} onChange={setFilter} />
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
