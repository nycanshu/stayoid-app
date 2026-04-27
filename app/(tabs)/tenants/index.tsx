import {
  View, Text, TextInput, Pressable, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import {
  PlusIcon, MagnifyingGlassIcon, UsersIcon, ArrowLeftIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useTenants } from '../../../lib/hooks/use-tenants';
import { TenantCard } from '../../../components/tenants/TenantCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { Entrance } from '../../../components/animations';
import { PropertyFilterBar } from '../../../components/properties/PropertyFilterBar';
import { THEME } from '../../../lib/theme';
import { cn } from '../../../lib/utils';

type FilterKey = 'all' | 'active' | 'exited' | 'unpaid';
const FILTER_LABELS: Record<FilterKey, string> = {
  all:    'All',
  active: 'Active',
  exited: 'Exited',
  unpaid: 'Unpaid',
};

function FilterChips({
  active, counts, onChange,
}: {
  active: FilterKey;
  counts: Record<FilterKey, number | undefined>;
  onChange: (k: FilterKey) => void;
}) {
  const keys: FilterKey[] = ['all', 'active', 'exited', 'unpaid'];
  return (
    <View className="flex-row flex-wrap gap-2">
      {keys.map((k) => {
        const isActive = active === k;
        const count = counts[k];
        const isUnpaid = k === 'unpaid';
        const accentClass = isUnpaid ? 'text-warning' : 'text-primary';
        const accentBgClass = isUnpaid ? 'bg-warning-bg' : 'bg-primary-bg';
        const accentBorderClass = isUnpaid ? 'border-warning' : 'border-primary';
        const countBgClass = isActive
          ? (isUnpaid ? 'bg-warning/20' : 'bg-primary/20')
          : 'bg-muted';
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
            {count !== undefined && (
              <View
                className={cn(
                  'rounded-full px-1.5 py-px min-w-[18px] items-center',
                  countBgClass,
                )}
              >
                <Text
                  className={cn(
                    'text-[10px]',
                    isActive ? accentClass : 'text-muted-foreground',
                  )}
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function EmptyState({
  query, filter, mutedFg,
}: { query: string; filter: FilterKey; mutedFg: string }) {
  const title = query
    ? `No matches for "${query}"`
    : filter === 'unpaid'
    ? 'All caught up'
    : filter === 'exited'
    ? 'No exited tenants'
    : filter === 'active'
    ? 'No active tenants yet'
    : 'No tenants yet';
  const description = query
    ? 'Try a different search term.'
    : filter === 'unpaid'
    ? 'Every active tenant has paid this month.'
    : filter === 'exited'
    ? 'Tenants who have moved out will appear here.'
    : 'Add your first tenant to start managing.';
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
  const [query, setQuery]         = useState('');
  const [filter, setFilter]       = useState<FilterKey>('all');
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const {
    data: allTenants, isLoading,
    refetch, isRefetching,
  } = useTenants({
    query: query.trim() || undefined,
    property_id: propertyId,
  });

  const filtered = useMemo(() => {
    const list = allTenants ?? [];
    if (filter === 'active') return list.filter((t) => t.is_active);
    if (filter === 'exited') return list.filter((t) => !t.is_active);
    if (filter === 'unpaid') return list.filter((t) => t.is_active && t.has_unpaid);
    return list;
  }, [allTenants, filter]);

  const counts: Record<FilterKey, number | undefined> = useMemo(() => {
    const list = allTenants ?? [];
    return {
      all:    list.length,
      active: list.filter((t) => t.is_active).length,
      exited: list.filter((t) => !t.is_active).length,
      unpaid: list.filter((t) => t.is_active && t.has_unpaid).length,
    };
  }, [allTenants]);

  const handleRefresh = useCallback(() => {
    refetch();
    setFocusTick((t) => t + 1);
  }, [refetch]);

  const total = allTenants?.length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={palette.primary}
          />
        }

        ListHeaderComponent={
          <View>
            <Entrance trigger={focusTick} style={{ marginBottom: 20 }}>
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
                  onPress={() => router.push('/(tabs)/tenants/new')}
                  android_ripple={null}
                  hitSlop={8}
                  className="size-10 rounded-[10px] bg-primary items-center justify-center"
                >
                  <PlusIcon size={18} color="#fff" weight="bold" />
                </Pressable>
              </View>
            </Entrance>

            <Entrance trigger={focusTick} delay={40} style={{ marginBottom: 12 }}>
              <PropertyFilterBar value={propertyId} onChange={setPropertyId} />
            </Entrance>

            <Entrance trigger={focusTick} delay={60} style={{ marginBottom: 12 }}>
              <View className="flex-row items-center gap-2.5 bg-card border border-border rounded-xl p-3.5">
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
            </Entrance>

            <Entrance trigger={focusTick} delay={100} style={{ marginBottom: 16 }}>
              <FilterChips
                active={filter}
                counts={counts}
                onChange={setFilter}
              />
            </Entrance>

            {isLoading && <ListSkeleton />}
            {!isLoading && filtered.length === 0 && (
              <EmptyState query={query} filter={filter} mutedFg={palette.mutedForeground} />
            )}
          </View>
        }

        renderItem={({ item, index }) => (
          <Entrance delay={index * 45} trigger={focusTick}>
            <TenantCard tenant={item} />
          </Entrance>
        )}
      />
    </SafeAreaView>
  );
}
