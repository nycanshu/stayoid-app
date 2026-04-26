import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { useDashboard } from '../../lib/hooks/use-dashboard';
import { useColors } from '../../lib/hooks/use-colors';
import { useAuthStore } from '../../lib/stores/auth-store';
import { Entrance } from '../../components/animations';
import {
  Greeting, SummaryCards, RentCollectionCard, OccupancyChart,
  PropertyOverviewList, RecentPaymentsCard, DashboardSkeleton,
} from '../../components/dashboard';

export default function DashboardScreen() {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, refetch, isRefetching } = useDashboard();

  const firstName    = user?.name?.split(' ')[0] ?? '';
  const summary      = data?.summary;
  const currentMonth = data?.current_month;

  // focusTick — every focus event re-mounts the Entrance animations so the
  // whole dashboard cascades in fresh. Also bumped after a manual refresh.
  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const handleRefresh = useCallback(async () => {
    await refetch();
    setFocusTick((t) => t + 1);
  }, [refetch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Greeting ── */}
        <Entrance trigger={focusTick} delay={0} style={{ marginBottom: 20 }}>
          <Greeting firstName={firstName} colors={colors} />
        </Entrance>

        {/* ── Loading skeleton ── */}
        {isLoading && (
          <Entrance trigger={focusTick} delay={60}>
            <DashboardSkeleton colors={colors} />
          </Entrance>
        )}

        {/* ── Summary stats (4-up) ── */}
        {summary && currentMonth && (
          <Entrance trigger={focusTick} delay={60} style={{ marginBottom: 12 }}>
            <SummaryCards summary={summary} currentMonth={currentMonth} colors={colors} />
          </Entrance>
        )}

        {/* ── Rent collection ── */}
        {currentMonth && (
          <Entrance trigger={focusTick} delay={120} style={{ marginBottom: 12 }}>
            <RentCollectionCard data={currentMonth} colors={colors} />
          </Entrance>
        )}

        {/* ── Occupancy donut ── */}
        {summary && (
          <Entrance trigger={focusTick} delay={180} style={{ marginBottom: 12 }}>
            <OccupancyChart
              occupied={summary.occupied_slots}
              vacant={summary.vacant_slots}
              colors={colors}
            />
          </Entrance>
        )}

        {/* ── Properties overview ── */}
        {data?.properties && (
          <Entrance trigger={focusTick} delay={240} style={{ marginBottom: 12 }}>
            <PropertyOverviewList properties={data.properties} colors={colors} />
          </Entrance>
        )}

        {/* ── Recent payments ── */}
        {data && (
          <Entrance trigger={focusTick} delay={300} style={{ marginBottom: 12 }}>
            <RecentPaymentsCard payments={data.recent_payments ?? []} colors={colors} />
          </Entrance>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
