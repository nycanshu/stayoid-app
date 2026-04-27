import {
  View, Text, Pressable, FlatList, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import {
  ArrowLeftIcon, BedIcon, MagnifyingGlassIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useSlots, useProperties } from '../../../lib/hooks/use-properties';
import { Skeleton } from '../../../components/ui/skeleton';
import { Entrance } from '../../../components/animations';
import { PropertyFilterBar } from '../../../components/properties/PropertyFilterBar';
import { SlotListRow } from '../../../components/properties/SlotListRow';
import { THEME } from '../../../lib/theme';
import { cn } from '../../../lib/utils';
import { formatCurrency } from '../../../lib/utils/formatters';
import { getProgressHex } from '../../../lib/utils/progress-colors';
import type { Slot } from '../../../types/property';

type FilterKey = 'all' | 'vacant' | 'occupied';
const FILTER_LABELS: Record<FilterKey, string> = {
  all:      'All',
  vacant:   'Vacant',
  occupied: 'Occupied',
};

function FilterChips({
  active, counts, onChange,
}: {
  active: FilterKey;
  counts: Record<FilterKey, number>;
  onChange: (k: FilterKey) => void;
}) {
  const keys: FilterKey[] = ['all', 'vacant', 'occupied'];
  return (
    <View className="flex-row gap-2">
      {keys.map((k) => {
        const isActive = active === k;
        const accentBg = k === 'vacant' ? 'bg-primary-bg'  : k === 'occupied' ? 'bg-success-bg'  : 'bg-primary-bg';
        const accentBorder = k === 'vacant' ? 'border-primary' : k === 'occupied' ? 'border-success' : 'border-primary';
        const accentText = k === 'vacant' ? 'text-primary'   : k === 'occupied' ? 'text-success'   : 'text-primary';
        return (
          <Pressable
            key={k}
            onPress={() => onChange(k)}
            android_ripple={null}
            className={cn(
              'flex-row items-center gap-1.5 border rounded-full px-3 py-1.5',
              isActive
                ? `${accentBorder} ${accentBg}`
                : 'border-border bg-card',
            )}
          >
            <Text
              className={cn(
                'text-xs',
                isActive ? accentText : 'text-foreground',
              )}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {FILTER_LABELS[k]}
            </Text>
            <View
              className={cn(
                'rounded-full px-1.5 py-px min-w-[18px] items-center',
                isActive ? `${accentBg} opacity-80` : 'bg-muted',
              )}
            >
              <Text
                className={cn(
                  'text-[10px]',
                  isActive ? accentText : 'text-muted-foreground',
                )}
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {counts[k]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function SlotsStatsCard({ slots, isLoading }: { slots: Slot[]; isLoading: boolean }) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  if (isLoading) {
    return (
      <View className="bg-card border border-border rounded-xl overflow-hidden">
        <View className="p-3.5 gap-2 border-b border-border">
          <Skeleton width={70} height={10} />
          <Skeleton width={80} height={26} />
          <Skeleton width="100%" height={6} radius={99} />
          <Skeleton width={140} height={11} />
        </View>
        <View className="flex-row">
          <View className="flex-1 p-3.5 gap-1.5 border-r border-border">
            <Skeleton width={50} height={10} />
            <Skeleton width={32} height={16} />
          </View>
          <View className="flex-1 p-3.5 gap-1.5 border-r border-border">
            <Skeleton width={70} height={10} />
            <Skeleton width={64} height={16} />
          </View>
          <View className="flex-1 p-3.5 gap-1.5">
            <Skeleton width={70} height={10} />
            <Skeleton width={64} height={16} />
          </View>
        </View>
      </View>
    );
  }

  const total = slots.length;
  const occupied = slots.filter((s) => s.is_occupied).length;
  const vacant = total - occupied;
  const pct = total > 0 ? (occupied / total) * 100 : 0;
  const collected = slots.reduce(
    (sum, s) => sum + (s.is_occupied ? Number(s.monthly_rent) : 0),
    0,
  );
  const potential = slots.reduce((sum, s) => sum + Number(s.monthly_rent), 0);
  const barHex = getProgressHex(pct, scheme);

  return (
    <View className="bg-card border border-border rounded-xl overflow-hidden">
      <View className="p-3.5 border-b border-border">
        <Text
          className="text-muted-foreground text-[11px] mb-1"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Occupancy
        </Text>
        <Text
          className="text-foreground text-[26px] leading-[30px] mb-2"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {Math.round(pct)}%
        </Text>
        <View className="h-1.5 bg-muted rounded-full overflow-hidden">
          <View
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barHex }}
            className="h-full rounded-full"
          />
        </View>
        <Text
          className="text-muted-foreground text-xs mt-1.5"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {total === 0 ? 'No slots yet' : `${occupied} of ${total} slots occupied`}
        </Text>
      </View>
      <View className="flex-row">
        <View className="flex-1 p-3.5 border-r border-border">
          <Text
            className="text-muted-foreground text-[11px] mb-1"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Vacant
          </Text>
          <Text
            className="text-foreground text-base leading-5"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {vacant}
          </Text>
          <Text
            className="text-muted-foreground text-[11px] mt-0.5"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {vacant > 0 ? 'available' : '—'}
          </Text>
        </View>
        <View className="flex-1 p-3.5 border-r border-border">
          <Text
            className="text-muted-foreground text-[11px] mb-1"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Collecting
          </Text>
          <Text
            numberOfLines={1}
            className="text-foreground text-base leading-5"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {formatCurrency(collected)}
          </Text>
        </View>
        <View className="flex-1 p-3.5">
          <Text
            className="text-muted-foreground text-[11px] mb-1"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Potential
          </Text>
          <Text
            numberOfLines={1}
            className="text-foreground text-base leading-5"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {formatCurrency(potential)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function SlotsScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  // Need both useProperties (for filter) and useSlots (filtered)
  useProperties();
  const {
    data: slots, isLoading, refetch, isRefetching,
  } = useSlots(propertyId, undefined, { allowAll: true });

  const handleRefresh = useCallback(() => {
    refetch();
    setFocusTick((t) => t + 1);
  }, [refetch]);

  const allSlots = slots ?? [];

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSlots;
    return allSlots.filter((s) => {
      const fields = [
        s.slot_number, s.unit_number,
        s.property_name, s.active_tenant?.name, s.active_tenant?.phone,
      ];
      return fields.some((v) => v && String(v).toLowerCase().includes(q));
    });
  }, [allSlots, query]);

  const filtered = useMemo(() => {
    if (filter === 'vacant')   return searched.filter((s) => !s.is_occupied);
    if (filter === 'occupied') return searched.filter((s) => s.is_occupied);
    return searched;
  }, [searched, filter]);

  const counts: Record<FilterKey, number> = {
    all:      searched.length,
    vacant:   searched.filter((s) => !s.is_occupied).length,
    occupied: searched.filter((s) => s.is_occupied).length,
  };

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

            <Entrance trigger={focusTick} delay={40} style={{ marginBottom: 12 }}>
              <PropertyFilterBar value={propertyId} onChange={setPropertyId} />
            </Entrance>

            <Entrance trigger={focusTick} delay={80} style={{ marginBottom: 12 }}>
              <SlotsStatsCard slots={searched} isLoading={isLoading} />
            </Entrance>

            <Entrance trigger={focusTick} delay={120} style={{ marginBottom: 12 }}>
              <View className="flex-row items-center gap-2.5 bg-card border border-border rounded-xl p-3.5">
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
            </Entrance>

            <Entrance trigger={focusTick} delay={160} style={{ marginBottom: 16 }}>
              <FilterChips active={filter} counts={counts} onChange={setFilter} />
            </Entrance>

            {!isLoading && filtered.length === 0 && (
              <View className="bg-card border border-border rounded-xl p-7 items-center">
                <View className="size-[52px] rounded-2xl bg-muted items-center justify-center mb-3">
                  <BedIcon size={24} color={palette.mutedForeground} weight="duotone" />
                </View>
                <Text
                  className="text-foreground text-sm mb-1 text-center"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {query
                    ? `No slots match "${query}"`
                    : filter === 'vacant'
                      ? 'No vacant slots'
                      : filter === 'occupied'
                        ? 'No occupied slots'
                        : 'No slots yet'}
                </Text>
                <Text
                  className="text-muted-foreground text-xs text-center leading-[18px]"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {query
                    ? 'Try a different search term.'
                    : filter === 'vacant'
                      ? 'Every slot in this view is occupied — nice!'
                      : 'Add floors and units in property detail to create slots.'}
                </Text>
              </View>
            )}

            {isLoading && (
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
            )}
          </View>
        }

        renderItem={({ item, index }) => (
          <Entrance delay={index * 40} trigger={focusTick}>
            <SlotListRow slot={item} />
          </Entrance>
        )}
      />
    </SafeAreaView>
  );
}
