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
import { useTenants } from '../../../lib/hooks/use-tenants';
import { useColors } from '../../../lib/hooks/use-colors';
import { TenantCard } from '../../../components/tenants/TenantCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { Entrance } from '../../../components/animations';
import type { AppColors } from '../../../lib/theme/colors';

type FilterKey = 'all' | 'active' | 'exited' | 'unpaid';
const FILTER_LABELS: Record<FilterKey, string> = {
  all:    'All',
  active: 'Active',
  exited: 'Exited',
  unpaid: 'Unpaid',
};

// ── Filter chip row ────────────────────────────────────────────────────────────
function FilterChips({
  active, counts, onChange, colors,
}: {
  active: FilterKey;
  counts: Record<FilterKey, number | undefined>;
  onChange: (k: FilterKey) => void;
  colors: AppColors;
}) {
  const keys: FilterKey[] = ['all', 'active', 'exited', 'unpaid'];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {keys.map((k) => {
        const isActive = active === k;
        const count = counts[k];
        const isUnpaid = k === 'unpaid';
        const accent = isUnpaid ? colors.warning : colors.primary;
        const accentBg = isUnpaid ? colors.warningBg : colors.primaryBg;
        return (
          <Pressable
            key={k}
            onPress={() => onChange(k)}
            android_ripple={null}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              borderWidth: 1,
              borderColor: isActive ? accent : colors.border,
              backgroundColor: isActive ? accentBg : colors.card,
              borderRadius: 99,
              paddingHorizontal: 12, paddingVertical: 7,
            }}
          >
            <Text style={{
              color: isActive ? accent : colors.foreground,
              fontSize: 12, fontFamily: 'Inter_600SemiBold',
            }}>
              {FILTER_LABELS[k]}
            </Text>
            {count !== undefined && (
              <View style={{
                backgroundColor: isActive ? `${accent}30` : colors.mutedBg,
                borderRadius: 99, paddingHorizontal: 6, paddingVertical: 1,
                minWidth: 18, alignItems: 'center',
              }}>
                <Text style={{
                  color: isActive ? accent : colors.mutedFg,
                  fontSize: 10, fontFamily: 'Inter_600SemiBold',
                }}>
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

// ── Empty / no-results state ──────────────────────────────────────────────────
function EmptyState({
  query, filter, colors,
}: { query: string; filter: FilterKey; colors: AppColors }) {
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
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 28,
      alignItems: 'center',
    }}>
      <View style={{
        width: 52, height: 52, borderRadius: 16,
        backgroundColor: colors.mutedBg,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
      }}>
        <UsersIcon size={24} color={colors.mutedFg} weight="duotone" />
      </View>
      <Text style={{
        color: colors.foreground, fontSize: 14,
        fontFamily: 'Inter_600SemiBold', marginBottom: 4, textAlign: 'center',
      }}>
        {title}
      </Text>
      <Text style={{
        color: colors.mutedFg, fontSize: 12,
        fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18,
      }}>
        {description}
      </Text>
    </View>
  );
}

// ── List skeleton ─────────────────────────────────────────────────────────────
function ListSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View style={{ gap: 10 }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{
          backgroundColor: colors.card,
          borderWidth: 1, borderColor: colors.border,
          borderRadius: 12, padding: 14,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <Skeleton width={40} height={40} radius={20} />
          <View style={{ flex: 1, gap: 6 }}>
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

// ── Screen ────────────────────────────────────────────────────────────────────
export default function TenantsScreen() {
  const colors = useColors();
  const [query, setQuery]         = useState('');
  const [filter, setFilter]       = useState<FilterKey>('all');
  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  // We always fetch the full list and filter client-side so the chip counts can
  // be calculated. For large datasets, switch to server-side filters here.
  const {
    data: allTenants, isLoading,
    refetch, isRefetching,
  } = useTenants({ query: query.trim() || undefined });

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }

        ListHeaderComponent={
          <View>
            {/* ── Title row ── */}
            <Entrance trigger={focusTick} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <Pressable
                  onPress={() => router.back()}
                  android_ripple={null}
                  hitSlop={8}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    borderWidth: 1, borderColor: colors.border,
                    backgroundColor: colors.card,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ArrowLeftIcon size={18} color={colors.foreground} />
                </Pressable>
              </View>

              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{
                    color: colors.foreground,
                    fontSize: 22, fontFamily: 'Inter_600SemiBold',
                    letterSpacing: -0.3, paddingRight: 0.3,
                  }}>
                    Tenants
                  </Text>
                  <Text style={{
                    color: colors.mutedFg, fontSize: 13,
                    fontFamily: 'Inter_400Regular', marginTop: 2,
                  }}>
                    {total === 0
                      ? 'Manage your tenants'
                      : `${total} ${total === 1 ? 'tenant' : 'tenants'} on record`}
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/(tabs)/tenants/new')}
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

            {/* ── Search ── */}
            <Entrance trigger={focusTick} delay={60} style={{ marginBottom: 12 }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: colors.card,
                borderWidth: 1, borderColor: colors.border,
                borderRadius: 12, padding: 14,
              }}>
                <MagnifyingGlassIcon size={16} color={colors.mutedFg} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search by name or phone"
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
                  <Pressable onPress={() => setQuery('')} hitSlop={8} android_ripple={null}>
                    <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
                      Clear
                    </Text>
                  </Pressable>
                )}
              </View>
            </Entrance>

            {/* ── Filter chips ── */}
            <Entrance trigger={focusTick} delay={100} style={{ marginBottom: 16 }}>
              <FilterChips
                active={filter}
                counts={counts}
                onChange={setFilter}
                colors={colors}
              />
            </Entrance>

            {/* ── Loading or empty ── */}
            {isLoading && <ListSkeleton colors={colors} />}
            {!isLoading && filtered.length === 0 && (
              <EmptyState query={query} filter={filter} colors={colors} />
            )}
          </View>
        }

        renderItem={({ item, index }) => (
          <Entrance delay={index * 45} trigger={focusTick}>
            <TenantCard tenant={item} colors={colors} />
          </Entrance>
        )}
      />
    </SafeAreaView>
  );
}
