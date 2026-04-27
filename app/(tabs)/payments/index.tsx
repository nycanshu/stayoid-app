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
import { usePayments } from '../../../lib/hooks/use-payments';
import { useTenants } from '../../../lib/hooks/use-tenants';
import { useDashboard } from '../../../lib/hooks/use-dashboard';
import { useColors } from '../../../lib/hooks/use-colors';
import { PaymentRow } from '../../../components/properties/PaymentRow';
import { UnpaidTenantCard } from '../../../components/payments/UnpaidTenantCard';
import { PaymentStatsStrip } from '../../../components/payments/PaymentStatsStrip';
import { MonthNavigator } from '../../../components/payments/MonthNavigator';
import { Skeleton } from '../../../components/ui/skeleton';
import { Entrance } from '../../../components/animations';
import type { AppColors } from '../../../lib/theme/colors';
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

// ── Filter chip row ────────────────────────────────────────────────────────────
function FilterChips({
  active, counts, onChange, colors,
}: {
  active: FilterKey;
  counts: Record<FilterKey, number>;
  onChange: (k: FilterKey) => void;
  colors: AppColors;
}) {
  const keys: FilterKey[] = ['all', 'paid', 'pending'];
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {keys.map((k) => {
        const isActive = active === k;
        return (
          <Pressable
            key={k}
            onPress={() => onChange(k)}
            android_ripple={null}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              borderWidth: 1,
              borderColor: isActive ? colors.primary : colors.border,
              backgroundColor: isActive ? colors.primaryBg : colors.card,
              borderRadius: 99,
              paddingHorizontal: 12, paddingVertical: 7,
            }}
          >
            <Text style={{
              color: isActive ? colors.primary : colors.foreground,
              fontSize: 12, fontFamily: 'Inter_600SemiBold',
            }}>
              {FILTER_LABELS[k]}
            </Text>
            <View style={{
              backgroundColor: isActive ? `${colors.primary}30` : colors.mutedBg,
              borderRadius: 99, paddingHorizontal: 6, paddingVertical: 1,
              minWidth: 18, alignItems: 'center',
            }}>
              <Text style={{
                color: isActive ? colors.primary : colors.mutedFg,
                fontSize: 10, fontFamily: 'Inter_600SemiBold',
              }}>
                {counts[k]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Empty / all-clear state ────────────────────────────────────────────────────
function EmptyState({
  filter, colors,
}: { filter: FilterKey; colors: AppColors }) {
  const config = filter === 'paid'
    ? {
        Icon: CheckCircleIcon,
        title: 'No payments yet',
        description: 'Payments recorded for this month will appear here.',
        iconBg: colors.successBg, iconColor: colors.success,
      }
    : filter === 'pending'
    ? {
        Icon: CheckCircleIcon,
        title: 'All caught up',
        description: 'No unpaid tenants for this month.',
        iconBg: colors.successBg, iconColor: colors.success,
      }
    : {
        Icon: ReceiptIcon,
        title: 'Nothing to show',
        description: 'No payments or unpaid tenants for this month yet.',
        iconBg: colors.mutedBg, iconColor: colors.mutedFg,
      };
  const { Icon } = config;
  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 28,
      alignItems: 'center',
    }}>
      <View style={{
        width: 52, height: 52, borderRadius: 16,
        backgroundColor: config.iconBg,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
      }}>
        <Icon size={24} color={config.iconColor} weight="duotone" />
      </View>
      <Text style={{
        color: colors.foreground, fontSize: 14,
        fontFamily: 'Inter_600SemiBold', marginBottom: 4, textAlign: 'center',
      }}>
        {config.title}
      </Text>
      <Text style={{
        color: colors.mutedFg, fontSize: 12,
        fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18,
      }}>
        {config.description}
      </Text>
    </View>
  );
}

// ── List item skeleton ────────────────────────────────────────────────────────
function ListSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View style={{ gap: 10 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{
          backgroundColor: colors.card,
          borderWidth: 1, borderColor: colors.border,
          borderRadius: 12, padding: 14, gap: 8,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skeleton width="55%" height={13} />
            <Skeleton width={50} height={16} radius={99} />
          </View>
          <Skeleton width="40%" height={11} />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skeleton width="40%" height={11} />
            <Skeleton width={70} height={13} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function PaymentsScreen() {
  const colors = useColors();
  const now = new Date();
  const [month, setMonth]   = useState(now.getMonth() + 1);
  const [year, setYear]     = useState(now.getFullYear());
  const [filter, setFilter] = useState<FilterKey>('all');
  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const {
    data: payments, isLoading: paymentsLoading,
    refetch: refetchPayments, isRefetching,
  } = usePayments({ month, year });

  const {
    data: unpaidTenants, isLoading: unpaidLoading,
    refetch: refetchUnpaid,
  } = useTenants({ unpaid: true, month, year });

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
    // fallback: collected + sum of unpaid tenants' monthly rent
    return collected + (unpaidTenants ?? []).reduce((s, t) => s + Number(t.monthly_rent), 0);
  }, [isCurrentMonth, dashboard?.current_month, collected, unpaidTenants]);

  const handleRefresh = useCallback(() => {
    refetchPayments();
    refetchUnpaid();
    setFocusTick((t) => t + 1);
  }, [refetchPayments, refetchUnpaid]);

  const isLoading = paymentsLoading || unpaidLoading;

  // Build list items based on filter
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
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }

        // ── Header ─────────────────────────────────────────────────────────
        ListHeaderComponent={
          <View>
            {/* Title row + record button */}
            <Entrance trigger={focusTick} style={{ marginBottom: 20 }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{
                    color: colors.foreground,
                    fontSize: 22, fontFamily: 'Inter_600SemiBold',
                    letterSpacing: -0.3, paddingRight: 0.3,
                  }}>
                    Payments
                  </Text>
                  <Text style={{
                    color: colors.mutedFg, fontSize: 13,
                    fontFamily: 'Inter_400Regular', marginTop: 2,
                  }}>
                    Track and record rent payments
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/(tabs)/payments/new' as never)}
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

            {/* Month navigator */}
            <Entrance trigger={focusTick} delay={60} style={{ marginBottom: 12 }}>
              <MonthNavigator
                month={month}
                year={year}
                onChange={(m, y) => { setMonth(m); setYear(y); }}
                colors={colors}
              />
            </Entrance>

            {/* Stats strip */}
            <Entrance trigger={focusTick} delay={100} style={{ marginBottom: 12 }}>
              <PaymentStatsStrip
                collected={collected}
                expected={expected}
                paidCount={counts.paid}
                unpaidCount={counts.pending}
                isLoading={isLoading}
                colors={colors}
              />
            </Entrance>

            {/* Filter chips */}
            <Entrance trigger={focusTick} delay={140} style={{ marginBottom: 16 }}>
              <FilterChips
                active={filter}
                counts={counts}
                onChange={setFilter}
                colors={colors}
              />
            </Entrance>

            {/* Loading or empty */}
            {isLoading && <ListSkeleton colors={colors} />}
            {!isLoading && listData.length === 0 && <EmptyState filter={filter} colors={colors} />}
          </View>
        }

        // ── Items ──────────────────────────────────────────────────────────
        renderItem={({ item, index }) => (
          <Entrance delay={index * 45} trigger={focusTick}>
            {item.kind === 'unpaid' ? (
              <UnpaidTenantCard tenant={item.tenant} colors={colors} />
            ) : (
              <PaymentRow payment={item.payment} colors={colors} />
            )}
          </Entrance>
        )}
      />
    </SafeAreaView>
  );
}
