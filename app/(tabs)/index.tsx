import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { useColorScheme } from 'nativewind';
import { useDashboard } from '../../lib/hooks/use-dashboard';
import { useAuthStore } from '../../lib/stores/auth-store';
import { THEME } from '../../lib/theme';
import { Entrance } from '../../components/animations';
import {
  Greeting, SummaryCards, RentCollectionCard, OccupancyChart,
  PropertyOverviewList, RecentPaymentsCard, DashboardSkeleton,
  QuickActionsRow,
} from '../../components/dashboard';

export default function DashboardScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, refetch, isRefetching } = useDashboard();

  const firstName    = user?.name?.split(' ')[0] ?? '';
  const summary      = data?.summary;
  const currentMonth = data?.current_month;

  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const handleRefresh = useCallback(async () => {
    await refetch();
    setFocusTick((t) => t + 1);
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={palette.primary}
          />
        }
      >
        <Entrance trigger={focusTick} delay={0} style={{ marginBottom: 16 }}>
          <Greeting firstName={firstName} />
        </Entrance>

        <Entrance trigger={focusTick} delay={40} style={{ marginBottom: 16 }}>
          <QuickActionsRow />
        </Entrance>

        {isLoading && (
          <Entrance trigger={focusTick} delay={60}>
            <DashboardSkeleton />
          </Entrance>
        )}

        {summary && currentMonth && (
          <Entrance trigger={focusTick} delay={60} style={{ marginBottom: 12 }}>
            <SummaryCards summary={summary} currentMonth={currentMonth} />
          </Entrance>
        )}

        {currentMonth && (
          <Entrance trigger={focusTick} delay={120} style={{ marginBottom: 12 }}>
            <RentCollectionCard data={currentMonth} />
          </Entrance>
        )}

        {summary && (
          <Entrance trigger={focusTick} delay={180} style={{ marginBottom: 12 }}>
            <OccupancyChart
              occupied={summary.occupied_slots}
              vacant={summary.vacant_slots}
            />
          </Entrance>
        )}

        {data?.properties && (
          <Entrance trigger={focusTick} delay={240} style={{ marginBottom: 12 }}>
            <PropertyOverviewList properties={data.properties} />
          </Entrance>
        )}

        {data && (
          <Entrance trigger={focusTick} delay={300} style={{ marginBottom: 12 }}>
            <RecentPaymentsCard payments={data.recent_payments ?? []} />
          </Entrance>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
