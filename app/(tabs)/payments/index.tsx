import {
  View, Text, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  PlusIcon, CheckCircleIcon, ReceiptIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useRecordPaymentSheet } from '../../../components/payments/RecordPaymentSheet';
import { useInfinitePayments } from '../../../lib/hooks/use-payments';
import { useTenants } from '../../../lib/hooks/use-tenants';
import { useDashboard } from '../../../lib/hooks/use-dashboard';
import { useTabFocusRefetch } from '../../../lib/hooks/use-tab-focus-refetch';
import { PaymentRow } from '../../../components/properties/PaymentRow';
import { UnpaidTenantCard } from '../../../components/payments/UnpaidTenantCard';
import { PaymentStatsStrip } from '../../../components/payments/PaymentStatsStrip';
import { MonthNavigator } from '../../../components/payments/MonthNavigator';
import { Skeleton } from '../../../components/ui/skeleton';
import { InfiniteList } from '../../../components/ui/InfiniteList';
import { Entrance } from '../../../components/animations';
import { PropertyFilterBar } from '../../../components/properties/PropertyFilterBar';
import { THEME } from '../../../lib/theme';
import { cn } from '../../../lib/utils';
import type { Payment } from '../../../types/payment';
import type { Tenant } from '../../../types/tenant';

type FilterKey = 'all' | 'paid' | 'pending';
const FILTER_LABELS: Record<FilterKey, string> = {
  all:     'All',
  paid:    'Paid',
  pending: 'Pending',
};

type ListItem =
  | { kind: 'unpaid'; tenant: Tenant }
  | { kind: 'payment'; payment: Payment }
  | { kind: 'show-more'; remaining: number };

const UNPAID_PAGE = 5;

function FilterChips({
  active, counts, onChange,
}: {
  active: FilterKey;
  counts: Record<FilterKey, number>;
  onChange: (k: FilterKey) => void;
}) {
  const keys: FilterKey[] = ['all', 'paid', 'pending'];
  return (
    <View className="flex-row gap-2">
      {keys.map((k) => {
        const isActive = active === k;
        return (
          <Pressable
            key={k}
            onPress={() => onChange(k)}
            android_ripple={null}
            className={cn(
              'flex-row items-center gap-1.5 border rounded-full px-3 py-1.5',
              isActive
                ? 'border-primary bg-primary-bg'
                : 'border-border bg-card',
            )}
          >
            <Text
              className={cn(
                'text-xs',
                isActive ? 'text-primary' : 'text-foreground',
              )}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {FILTER_LABELS[k]}
            </Text>
            <View
              className={cn(
                'rounded-full px-1.5 py-px min-w-[18px] items-center',
                isActive ? 'bg-primary/20' : 'bg-muted',
              )}
            >
              <Text
                className={cn(
                  'text-[10px]',
                  isActive ? 'text-primary' : 'text-muted-foreground',
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

function getEmptyConfig(filter: FilterKey, palette: typeof THEME['light']) {
  if (filter === 'paid') {
    return {
      Icon: CheckCircleIcon,
      title: 'No payments yet',
      description: 'Payments recorded for this month will appear here.',
      iconBg: palette.successBg, iconColor: palette.success,
    };
  }
  if (filter === 'pending') {
    return {
      Icon: CheckCircleIcon,
      title: 'All caught up',
      description: 'No unpaid tenants for this month.',
      iconBg: palette.successBg, iconColor: palette.success,
    };
  }
  return {
    Icon: ReceiptIcon,
    title: 'Nothing to show',
    description: 'No payments or unpaid tenants for this month yet.',
    iconBg: palette.muted, iconColor: palette.mutedForeground,
  };
}

function EmptyState({ filter, palette }: { filter: FilterKey; palette: typeof THEME['light'] }) {
  const config = getEmptyConfig(filter, palette);
  const { Icon } = config;
  return (
    <View className="bg-card border border-border rounded-xl p-7 items-center">
      <View
        style={{ backgroundColor: config.iconBg }}
        className="size-[52px] rounded-2xl items-center justify-center mb-3"
      >
        <Icon size={24} color={config.iconColor} weight="duotone" />
      </View>
      <Text
        className="text-foreground text-sm mb-1 text-center"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {config.title}
      </Text>
      <Text
        className="text-muted-foreground text-xs text-center leading-[18px]"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {config.description}
      </Text>
    </View>
  );
}

function ListSkeleton() {
  return (
    <View className="gap-2.5">
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className="bg-card border border-border rounded-xl p-3.5 gap-2"
        >
          <View className="flex-row justify-between">
            <Skeleton width="55%" height={13} />
            <Skeleton width={50} height={16} radius={99} />
          </View>
          <Skeleton width="40%" height={11} />
          <View className="h-px bg-border" />
          <View className="flex-row justify-between">
            <Skeleton width="40%" height={11} />
            <Skeleton width={70} height={13} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function PaymentsScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { open: openPaymentSheet } = useRecordPaymentSheet();
  const now = new Date();
  const [month, setMonth]   = useState(now.getMonth() + 1);
  const [year, setYear]     = useState(now.getFullYear());
  const [filter, setFilter] = useState<FilterKey>('all');
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  // How many unpaid tenants to show on the "All" filter — progressive disclosure
  // so the top of the screen doesn't get crowded when there are many defaulters.
  const [unpaidLimit, setUnpaidLimit] = useState(UNPAID_PAGE);

  // Reset progressive limit whenever the scope changes.
  useEffect(() => {
    setUnpaidLimit(UNPAID_PAGE);
  }, [month, year, propertyId, filter]);

  const paymentsFilters = useMemo(
    () => ({ month, year, property_id: propertyId }),
    [month, year, propertyId],
  );

  const {
    data: paymentsData, isLoading: paymentsLoading,
    refetch: refetchPayments, isRefetching,
    isFetchingNextPage, hasNextPage, fetchNextPage,
  } = useInfinitePayments(paymentsFilters);

  // Unpaid tenants for the month — typically small (<50), kept as a non-paginated query.
  const {
    data: unpaidTenants, isLoading: unpaidLoading,
    refetch: refetchUnpaid,
  } = useTenants({ unpaid: true, month, year, property_id: propertyId });

  const { data: dashboard } = useDashboard();

  useTabFocusRefetch(useCallback(() => {
    refetchPayments();
    refetchUnpaid();
  }, [refetchPayments, refetchUnpaid]));

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  const payments = useMemo(
    () => (paymentsData?.pages ?? []).flatMap((p) => p.results),
    [paymentsData],
  );
  const totalPaid = paymentsData?.pages?.[0]?.count ?? 0;
  const totalPending = unpaidTenants?.length ?? 0;

  // Stats strip uses sum-of-loaded-pages for "collected" — close enough for the
  // current month, fully accurate once the user scrolls through.
  const collected = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.amount), 0),
    [payments],
  );
  const expected = useMemo(() => {
    if (isCurrentMonth && dashboard?.current_month) {
      return Number(dashboard.current_month.expected_rent);
    }
    return collected + (unpaidTenants ?? []).reduce((s, t) => s + Number(t.monthly_rent), 0);
  }, [isCurrentMonth, dashboard?.current_month, collected, unpaidTenants]);

  const isLoading = paymentsLoading || unpaidLoading;

  const counts: Record<FilterKey, number> = {
    all:     totalPaid + totalPending,
    paid:    totalPaid,
    pending: totalPending,
  };

  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];
    const allUnpaid = unpaidTenants ?? [];
    if (filter === 'pending') {
      // Dedicated pending view — show all of them.
      allUnpaid.forEach((t) => items.push({ kind: 'unpaid', tenant: t }));
    } else if (filter === 'all') {
      // Mixed view — cap the top section so the screen stays scannable.
      const visible = allUnpaid.slice(0, unpaidLimit);
      visible.forEach((t) => items.push({ kind: 'unpaid', tenant: t }));
      const remaining = allUnpaid.length - visible.length;
      if (remaining > 0) {
        items.push({ kind: 'show-more', remaining });
      }
    }
    if (filter === 'all' || filter === 'paid') {
      payments.forEach((p) => items.push({ kind: 'payment', payment: p }));
    }
    return items;
  }, [filter, payments, unpaidTenants, unpaidLimit]);

  const handleShowMore = useCallback(() => {
    setUnpaidLimit((n) => n + UNPAID_PAGE);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchPayments();
    refetchUnpaid();
  }, [refetchPayments, refetchUnpaid]);

  // Only paginate when the payments list is part of the visible filter.
  const showPaginated = filter === 'all' || filter === 'paid';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <InfiniteList
        data={listData}
        keyExtractor={(item) => {
          if (item.kind === 'unpaid')  return `u-${item.tenant.id}`;
          if (item.kind === 'payment') return `p-${item.payment.id}`;
          return 'show-more';
        }}
        renderItem={({ item }) => {
          if (item.kind === 'unpaid') {
            return <UnpaidTenantCard tenant={item.tenant} month={month} year={year} />;
          }
          if (item.kind === 'payment') {
            return <PaymentRow payment={item.payment} />;
          }
          return (
            <Pressable
              onPress={handleShowMore}
              android_ripple={null}
              className="bg-card border border-border rounded-xl py-3 items-center"
            >
              <Text
                className="text-primary text-[13px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Show {Math.min(UNPAID_PAGE, item.remaining)} more pending
                {item.remaining > UNPAID_PAGE ? ` (${item.remaining} left)` : ''}
              </Text>
            </Pressable>
          );
        }}
        isLoading={isLoading}
        isRefetching={isRefetching}
        isFetchingNextPage={showPaginated ? isFetchingNextPage : false}
        hasNextPage={showPaginated ? !!hasNextPage : false}
        onRefresh={handleRefresh}
        onEndReached={fetchNextPage}
        FirstLoadSkeleton={<ListSkeleton />}
        ListEmptyComponent={<EmptyState filter={filter} palette={palette} />}
        ListHeaderComponent={
          <View>
            <Entrance trigger={1} style={{ marginBottom: 20 }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text
                    className="text-foreground text-[22px] tracking-tight"
                    style={{ fontFamily: 'Inter_600SemiBold', paddingRight: 0.3 }}
                  >
                    Payments
                  </Text>
                  <Text
                    className="text-muted-foreground text-[13px] mt-0.5"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    Track and record rent payments
                  </Text>
                </View>
                <Pressable
                  onPress={() => openPaymentSheet()}
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

            <View style={{ marginBottom: 12 }}>
              <MonthNavigator
                month={month}
                year={year}
                onChange={(m, y) => { setMonth(m); setYear(y); }}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <PaymentStatsStrip
                collected={collected}
                expected={expected}
                paidCount={counts.paid}
                unpaidCount={counts.pending}
                isLoading={isLoading}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <FilterChips active={filter} counts={counts} onChange={setFilter} />
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
