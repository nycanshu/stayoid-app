import {
  View, Text, FlatList, Pressable, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import {
  PlusIcon, CheckCircleIcon, WarningCircleIcon, ReceiptIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { usePayments } from '../../../lib/hooks/use-payments';
import { useTenants } from '../../../lib/hooks/use-tenants';
import { useDashboard } from '../../../lib/hooks/use-dashboard';
import { PaymentRow } from '../../../components/properties/PaymentRow';
import { UnpaidTenantCard } from '../../../components/payments/UnpaidTenantCard';
import { PaymentStatsStrip } from '../../../components/payments/PaymentStatsStrip';
import { MonthNavigator } from '../../../components/payments/MonthNavigator';
import { Skeleton } from '../../../components/ui/skeleton';
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
  | { kind: 'payment'; payment: Payment };

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

function EmptyState({
  filter, palette,
}: { filter: FilterKey; palette: typeof THEME['light'] }) {
  const config = filter === 'paid'
    ? {
        Icon: CheckCircleIcon,
        title: 'No payments yet',
        description: 'Payments recorded for this month will appear here.',
        iconBg: palette.successBg, iconColor: palette.success,
      }
    : filter === 'pending'
    ? {
        Icon: CheckCircleIcon,
        title: 'All caught up',
        description: 'No unpaid tenants for this month.',
        iconBg: palette.successBg, iconColor: palette.success,
      }
    : {
        Icon: ReceiptIcon,
        title: 'Nothing to show',
        description: 'No payments or unpaid tenants for this month yet.',
        iconBg: palette.muted, iconColor: palette.mutedForeground,
      };
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
  const now = new Date();
  const [month, setMonth]   = useState(now.getMonth() + 1);
  const [year, setYear]     = useState(now.getFullYear());
  const [filter, setFilter] = useState<FilterKey>('all');
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const {
    data: payments, isLoading: paymentsLoading,
    refetch: refetchPayments, isRefetching,
  } = usePayments({ month, year, property_id: propertyId });

  const {
    data: unpaidTenants, isLoading: unpaidLoading,
    refetch: refetchUnpaid,
  } = useTenants({ unpaid: true, month, year, property_id: propertyId });

  const { data: dashboard } = useDashboard();

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  const collected = useMemo(
    () => (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0),
    [payments],
  );
  const expected = useMemo(() => {
    if (isCurrentMonth && dashboard?.current_month) {
      return Number(dashboard.current_month.expected_rent);
    }
    return collected + (unpaidTenants ?? []).reduce((s, t) => s + Number(t.monthly_rent), 0);
  }, [isCurrentMonth, dashboard?.current_month, collected, unpaidTenants]);

  const handleRefresh = useCallback(() => {
    refetchPayments();
    refetchUnpaid();
    setFocusTick((t) => t + 1);
  }, [refetchPayments, refetchUnpaid]);

  const isLoading = paymentsLoading || unpaidLoading;

  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];
    if (filter === 'all' || filter === 'pending') {
      (unpaidTenants ?? []).forEach((t) => items.push({ kind: 'unpaid', tenant: t }));
    }
    if (filter === 'all' || filter === 'paid') {
      (payments ?? []).forEach((p) => items.push({ kind: 'payment', payment: p }));
    }
    return items;
  }, [filter, payments, unpaidTenants]);

  const counts: Record<FilterKey, number> = {
    all:     (payments ?? []).length + (unpaidTenants ?? []).length,
    paid:    (payments ?? []).length,
    pending: (unpaidTenants ?? []).length,
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <FlatList
        data={listData}
        keyExtractor={(item) =>
          item.kind === 'unpaid' ? `u-${item.tenant.id}` : `p-${item.payment.id}`
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
                  onPress={() => router.push('/(tabs)/payments/new' as never)}
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
              <MonthNavigator
                month={month}
                year={year}
                onChange={(m, y) => { setMonth(m); setYear(y); }}
              />
            </Entrance>

            <Entrance trigger={focusTick} delay={100} style={{ marginBottom: 12 }}>
              <PaymentStatsStrip
                collected={collected}
                expected={expected}
                paidCount={counts.paid}
                unpaidCount={counts.pending}
                isLoading={isLoading}
              />
            </Entrance>

            <Entrance trigger={focusTick} delay={140} style={{ marginBottom: 16 }}>
              <FilterChips
                active={filter}
                counts={counts}
                onChange={setFilter}
              />
            </Entrance>

            {isLoading && <ListSkeleton />}
            {!isLoading && listData.length === 0 && <EmptyState filter={filter} palette={palette} />}
          </View>
        }

        renderItem={({ item, index }) => (
          <Entrance delay={index * 45} trigger={focusTick}>
            {item.kind === 'unpaid' ? (
              <UnpaidTenantCard tenant={item.tenant} />
            ) : (
              <PaymentRow payment={item.payment} />
            )}
          </Entrance>
        )}
      />
    </SafeAreaView>
  );
}
