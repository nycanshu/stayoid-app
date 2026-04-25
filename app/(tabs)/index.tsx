import { View, Text, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import {
  BuildingsIcon, TrendUpIcon, CurrencyInrIcon, UsersIcon,
  ArrowRightIcon, CreditCardIcon,
} from 'phosphor-react-native';
import { useState, useCallback, useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { useDashboard } from '../../lib/hooks/use-dashboard';
import { useColors } from '../../lib/hooks/use-colors';
import { useAuthStore } from '../../lib/stores/auth-store';
import { formatCurrency } from '../../lib/utils/formatters';
import { Entrance, FadeSection, AnimatedScrollView } from '../../components/animations';
import type { AppColors } from '../../lib/theme/colors';

function getProgressColor(pct: number, colors: AppColors) {
  if (pct >= 80) return colors.success;
  if (pct >= 50) return colors.warning;
  return colors.danger;
}

function getProgressBg(pct: number, colors: AppColors) {
  if (pct >= 80) return colors.successBg;
  if (pct >= 50) return colors.warningBg;
  return colors.dangerBg;
}

// ── Skeleton block ─────────────────────────────────────────────────────────────
function SkeletonBlock({ height, style }: { height: number; style?: any }) {
  const shimmer = useSharedValue(0.4);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 650, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: shimmer.value }));

  return <Animated.View style={[{ height, borderRadius: 12 }, shimmerStyle, style]} />;
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  title, value, description, Icon, iconBg, iconColor, valueColor, colors,
}: {
  title: string; value: string | number; description: string;
  Icon: React.FC<{ size: number; color: string; weight?: string }>;
  iconBg: string; iconColor: string; valueColor?: string;
  colors: AppColors;
}) {
  return (
    <View style={{
      flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 14,
    }}>
      <View style={{
        width: 36, height: 36, borderRadius: 10, backgroundColor: iconBg,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
      }}>
        <Icon size={18} color={iconColor} weight="fill" />
      </View>
      <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 }}>
        {title}
      </Text>
      <Text style={{ color: valueColor ?? colors.foreground, fontSize: 18, fontFamily: 'Inter_600SemiBold', marginBottom: 2 }}>
        {value}
      </Text>
      <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }} numberOfLines={1}>
        {description}
      </Text>
    </View>
  );
}

// ── Rent collection card ───────────────────────────────────────────────────────
function RentCollectionCard({ data, colors }: { data: any; colors: AppColors }) {
  const pct = Math.min(data.collection_rate, 100);
  const barColor = getProgressColor(data.collection_rate, colors);

  return (
    <View style={{
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 16, marginBottom: 12,
    }}>
      <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 12 }}>
        Rent Collection — {data.display}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: colors.foreground, fontSize: 22, fontFamily: 'Inter_600SemiBold' }}>
          {formatCurrency(data.collected_rent)}
        </Text>
        <Text style={{ color: colors.mutedFg, fontSize: 12 }}>of {formatCurrency(data.expected_rent)}</Text>
      </View>
      <View style={{ height: 8, backgroundColor: colors.mutedBg, borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: 99 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ color: barColor, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
          {Math.round(data.collection_rate)}% collected
        </Text>
        <Text style={{ color: colors.mutedFg, fontSize: 12 }}>{formatCurrency(data.pending_rent)} pending</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
          <Text style={{ color: colors.mutedFg, fontSize: 12 }}>{data.paid_count} paid</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} />
          <Text style={{ color: colors.mutedFg, fontSize: 12 }}>{data.pending_count} pending</Text>
        </View>
      </View>
    </View>
  );
}

// ── Occupancy donut ────────────────────────────────────────────────────────────
function OccupancyChart({ occupied, vacant, colors }: { occupied: number; vacant: number; colors: AppColors }) {
  const total = occupied + vacant;
  const pct = total > 0 ? (occupied / total) * 100 : 0;
  const ringColor = getProgressColor(pct, colors);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <View style={{
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 16, marginBottom: 12,
    }}>
      <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 16 }}>
        Occupancy
      </Text>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 120, height: 120 }}>
          <Svg width={120} height={120} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx="50" cy="50" r="40" fill="none" stroke={colors.mutedBg} strokeWidth="8" />
            <Circle cx="50" cy="50" r="40" fill="none" stroke={ringColor} strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
          </Svg>
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.foreground, fontSize: 20, fontFamily: 'Inter_600SemiBold' }}>
              {Math.round(pct)}%
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success }} />
            <Text style={{ color: colors.mutedFg, fontSize: 12 }}>{occupied} Occupied</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.info }} />
            <Text style={{ color: colors.mutedFg, fontSize: 12 }}>{vacant} Vacant</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Properties list ────────────────────────────────────────────────────────────
function PropertiesList({ properties, colors }: { properties: any[]; colors: AppColors }) {
  if (!properties.length) return null;
  return (
    <View style={{
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, marginBottom: 12, overflow: 'hidden',
    }}>
      <View style={{ padding: 16, paddingBottom: 10 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>Your Properties</Text>
      </View>
      {properties.map((p) => {
        const pct = p.total_slots > 0 ? (p.occupied / p.total_slots) * 100 : 0;
        const barColor = getProgressColor(pct, colors);
        return (
          <View key={p.id} style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1 }} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                {formatCurrency(p.collected_rent)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, height: 4, backgroundColor: colors.mutedBg, borderRadius: 99, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: 99 }} />
              </View>
              <Text style={{ color: colors.mutedFg, fontSize: 11 }}>{p.occupied}/{p.total_slots}</Text>
            </View>
          </View>
        );
      })}
      <Pressable
        onPress={() => router.push('/(tabs)/properties')}
        android_ripple={null}
        style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 4, borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <Text style={{ color: colors.mutedFg, fontSize: 13 }}>View all properties</Text>
        <ArrowRightIcon size={13} color={colors.mutedFg} />
      </Pressable>
    </View>
  );
}

// ── Recent payments ────────────────────────────────────────────────────────────
function RecentPayments({ payments, colors }: { payments: any[]; colors: AppColors }) {
  return (
    <View style={{
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, marginBottom: 12, overflow: 'hidden',
    }}>
      <View style={{ padding: 16, paddingBottom: 10 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>Recent Payments</Text>
      </View>
      {payments.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.mutedBg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <CreditCardIcon size={20} color={colors.mutedFg} weight="duotone" />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4 }}>No recent payments</Text>
          <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18 }}>
            Payments will appear here once tenants start paying rent.
          </Text>
        </View>
      ) : (
        <>
          {payments.slice(0, 5).map((p) => {
            const initials = p.tenant_name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
            return (
              <View key={p.id} style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingHorizontal: 16, paddingVertical: 10,
                borderTopWidth: 1, borderTopColor: colors.border,
              }}>
                <View style={{ position: 'relative' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.mutedBg, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>{initials}</Text>
                  </View>
                  <View style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.card }} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }} numberOfLines={1}>{p.tenant_name}</Text>
                  <Text style={{ color: colors.mutedFg, fontSize: 11 }} numberOfLines={1}>{p.property_name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>{formatCurrency(p.amount)}</Text>
                  <Text style={{ color: colors.mutedFg, fontSize: 11 }}>
                    {new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              </View>
            );
          })}
          <Pressable
            onPress={() => router.push('/(tabs)/payments')}
            android_ripple={null}
            style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 4, borderTopWidth: 1, borderTopColor: colors.border }}
          >
            <Text style={{ color: colors.mutedFg, fontSize: 13 }}>View all payments</Text>
            <ArrowRightIcon size={13} color={colors.mutedFg} />
          </Pressable>
        </>
      )}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, refetch, isRefetching } = useDashboard();

  const firstName = user?.name?.split(' ')[0] ?? '';
  const summary = data?.summary;
  const currentMonth = data?.current_month;

  // focusTick → Entrance replays; sectionKey → FadeSection remounts (resets animation)
  const [focusTick, setFocusTick] = useState(0);
  const [sectionKey, setSectionKey] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const handleRefresh = useCallback(async () => {
    await refetch();
    setFocusTick((t) => t + 1);
    setSectionKey((k) => k + 1);
  }, [refetch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />
      <AnimatedScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {/* Greeting — entrance on focus */}
        <Entrance delay={0} trigger={focusTick} style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.foreground, fontSize: 22, fontFamily: 'Inter_600SemiBold', letterSpacing: -0.3, paddingRight: 0.3 }}>
            Welcome back{firstName ? `, ${firstName}` : ''}
          </Text>
          <Text style={{ color: colors.mutedFg, fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
            Here's your portfolio overview
          </Text>
        </Entrance>

        {/* Loading skeletons */}
        {isLoading && (
          <Entrance delay={0} trigger={focusTick}>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={{ width: '48.5%' }}>
                <SkeletonBlock height={90} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} />
              </View>
              <View style={{ width: '48.5%' }}>
                <SkeletonBlock height={90} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={{ width: '48.5%' }}>
                <SkeletonBlock height={90} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} />
              </View>
              <View style={{ width: '48.5%' }}>
                <SkeletonBlock height={90} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} />
              </View>
            </View>
            <SkeletonBlock height={160} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }} />
            <SkeletonBlock height={120} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }} />
          </Entrance>
        )}

        {/* Stat grid — entrance on focus (above fold) */}
        {summary && currentMonth && (
          <Entrance delay={60} trigger={focusTick}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <View style={{ width: '48.5%' }}>
                <StatCard title="Properties" value={summary.total_properties}
                  description={`${summary.total_slots} total slots`}
                  Icon={BuildingsIcon as any} iconBg={colors.infoBg} iconColor={colors.info} colors={colors} />
              </View>
              <View style={{ width: '48.5%' }}>
                <StatCard title="Occupancy" value={`${Math.round(summary.occupancy_rate)}%`}
                  description={`${summary.occupied_slots} of ${summary.total_slots} slots`}
                  Icon={TrendUpIcon as any}
                  iconBg={getProgressBg(summary.occupancy_rate, colors)}
                  iconColor={getProgressColor(summary.occupancy_rate, colors)}
                  valueColor={getProgressColor(summary.occupancy_rate, colors)} colors={colors} />
              </View>
              <View style={{ width: '48.5%' }}>
                <StatCard title="Revenue" value={formatCurrency(currentMonth.collected_rent)}
                  description={`${Math.round(currentMonth.collection_rate)}% collected`}
                  Icon={CurrencyInrIcon as any}
                  iconBg={getProgressBg(currentMonth.collection_rate, colors)}
                  iconColor={getProgressColor(currentMonth.collection_rate, colors)}
                  valueColor={getProgressColor(currentMonth.collection_rate, colors)} colors={colors} />
              </View>
              <View style={{ width: '48.5%' }}>
                <StatCard title="Active Tenants" value={summary.active_tenants}
                  description={`${summary.vacant_slots} vacant slots`}
                  Icon={UsersIcon as any} iconBg={colors.successBg} iconColor={colors.success} colors={colors} />
              </View>
            </View>
          </Entrance>
        )}

        {/* Rent collection — entrance (near top) */}
        {currentMonth && (
          <Entrance delay={120} trigger={focusTick}>
            <RentCollectionCard data={currentMonth} colors={colors} />
          </Entrance>
        )}

        {/* Below-fold sections — scroll reveal */}
        {summary && (
          <FadeSection key={`occupancy-${sectionKey}`}>
            <OccupancyChart occupied={summary.occupied_slots} vacant={summary.vacant_slots} colors={colors} />
          </FadeSection>
        )}

        {data?.properties && (
          <FadeSection key={`props-${sectionKey}`}>
            <PropertiesList properties={data.properties} colors={colors} />
          </FadeSection>
        )}

        {data && (
          <FadeSection key={`payments-${sectionKey}`}>
            <RecentPayments payments={data.recent_payments ?? []} colors={colors} />
          </FadeSection>
        )}
      </AnimatedScrollView>
    </SafeAreaView>
  );
}
