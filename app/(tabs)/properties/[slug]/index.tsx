import {
  View, Text, ScrollView, Pressable, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import {
  ArrowLeftIcon, MapPinIcon, DotsThreeVerticalIcon, PencilIcon,
  StackIcon, UsersIcon, CurrencyCircleDollarIcon, HouseIcon,
  PlusIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useProperty, useSlots, useDeleteProperty } from '../../../../lib/hooks/use-properties';
import { useTenants } from '../../../../lib/hooks/use-tenants';
import { usePayments } from '../../../../lib/hooks/use-payments';
import { useDashboard } from '../../../../lib/hooks/use-dashboard';
import { useColors } from '../../../../lib/hooks/use-colors';
import { useActionSheet } from '../../../../components/ui/ActionSheet';
import { getPropertyTypeMeta } from '../../../../lib/constants/property-type-meta';
import { PropertyStatsStrip } from '../../../../components/properties/PropertyStatsStrip';
import { FloorCard } from '../../../../components/properties/FloorCard';
import { TenantRow } from '../../../../components/properties/TenantRow';
import { PaymentRow } from '../../../../components/properties/PaymentRow';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Entrance } from '../../../../components/animations';
import type { AppColors } from '../../../../lib/theme/colors';
import type { Slot } from '../../../../types/property';

type Tab = 'floors' | 'tenants' | 'payments';

// ── Type badge — uses shared getPropertyTypeMeta ───────────────────────────────
function TypeBadge({ type, colors }: { type: string; colors: AppColors }) {
  const meta = getPropertyTypeMeta(type, colors);
  const Icon = meta.Icon;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 5,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3,
    }}>
      <View style={{
        width: 16, height: 16, borderRadius: 8,
        backgroundColor: meta.iconBg,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={9} color={meta.iconColor} weight="fill" />
      </View>
      <Text style={{ color: colors.foreground, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
        {meta.shortLabel}
      </Text>
    </View>
  );
}

// ── Empty state card ──────────────────────────────────────────────────────────
function EmptyCard({
  Icon, title, description, colors,
}: {
  Icon: React.ComponentType<{ size: number; color: string; weight?: any }>;
  title: string; description: string; colors: AppColors;
}) {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 24,
      alignItems: 'center',
    }}>
      <View style={{
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: colors.mutedBg,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
      }}>
        <Icon size={20} color={colors.mutedFg} weight="duotone" />
      </View>
      <Text style={{
        color: colors.foreground, fontSize: 13,
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

// ── Tab bar ───────────────────────────────────────────────────────────────────
function TabBar({
  active, onChange, counts, colors,
}: {
  active: Tab; onChange: (t: Tab) => void;
  counts: { floors?: number; tenants?: number; payments?: number };
  colors: AppColors;
}) {
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'floors',   label: 'Floors',   count: counts.floors },
    { key: 'tenants',  label: 'Tenants',  count: counts.tenants },
    { key: 'payments', label: 'Payments', count: counts.payments },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.mutedBg,
      borderRadius: 10, padding: 3,
    }}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            android_ripple={null}
            style={{
              flex: 1, flexDirection: 'row',
              alignItems: 'center', justifyContent: 'center',
              gap: 5, paddingVertical: 8, borderRadius: 8,
              backgroundColor: isActive ? colors.card : 'transparent',
            }}
          >
            <Text style={{
              color: isActive ? colors.foreground : colors.mutedFg,
              fontSize: 13, fontFamily: 'Inter_600SemiBold',
            }}>
              {tab.label}
            </Text>
            {tab.count !== undefined && tab.count > 0 && (
              <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                {tab.count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Tab content header (count + action button) ────────────────────────────────
function TabHeader({
  count, label, actionLabel, onAction, colors,
}: {
  count: number; label: string; actionLabel: string;
  onAction: () => void; colors: AppColors;
}) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 12,
    }}>
      <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
        {count} {label}
      </Text>
      <Pressable
        onPress={onAction}
        android_ripple={null}
        hitSlop={6}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 5,
          backgroundColor: colors.primary, borderRadius: 10,
          paddingHorizontal: 10, paddingVertical: 7,
        }}
      >
        <PlusIcon size={12} color="#fff" weight="bold" />
        <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

// ── Header skeleton ───────────────────────────────────────────────────────────
function HeaderSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 14, gap: 10 }}>
        <Skeleton width={40} height={40} radius={10} />
        <View style={{ flex: 1 }} />
        <Skeleton width={40} height={40} radius={10} />
      </View>
      <View style={{ gap: 8 }}>
        <Skeleton width={180} height={26} />
        <Skeleton width={240} height={13} />
        <Skeleton width={100} height={11} />
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function PropertyDetailScreen() {
  const colors = useColors();
  const { show: showActionSheet } = useActionSheet();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('floors');
  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const { data: property, isLoading: propertyLoading, refetch: refetchProp, isRefetching } = useProperty(slug);
  const { data: slots,    isLoading: slotsLoading,    refetch: refetchSlots }              = useSlots(property?.id);
  const { data: tenants,  isLoading: tenantsLoading,  refetch: refetchTenants }            = useTenants({ property_id: property?.id, active: true });
  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments }           = usePayments({ property_id: property?.id });
  const { data: dashboard }                                                                 = useDashboard();
  const deleteProperty = useDeleteProperty();

  const handleRefresh = useCallback(() => {
    refetchProp(); refetchSlots(); refetchTenants(); refetchPayments();
    setFocusTick((t) => t + 1);
  }, [refetchProp, refetchSlots, refetchTenants, refetchPayments]);

  const propertyStats = useMemo(
    () => dashboard?.properties?.find((p) => p.id === property?.id),
    [dashboard?.properties, property?.id],
  );

  const floorGroups = useMemo(() => {
    const map: Record<number, Slot[]> = {};
    (slots ?? []).forEach((s) => { (map[s.floor_number] ??= []).push(s); });
    return map;
  }, [slots]);

  const sortedFloors = useMemo(
    () => Object.keys(floorGroups).map(Number).sort((a, b) => a - b),
    [floorGroups],
  );

  const totalSlots  = slots?.length ?? 0;
  const occupied    = slots?.filter((s) => s.is_occupied).length ?? 0;
  const vacant      = totalSlots - occupied;
  const collected   = propertyStats ? Number(propertyStats.collected_rent) : 0;
  const expected    = propertyStats ? Number(propertyStats.expected_rent)  : 0;
  const meta        = property ? getPropertyTypeMeta(property.property_type, colors) : null;

  const formatShortDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const openMoreActions = useCallback(() => {
    if (!property) return;
    showActionSheet({
      title: property.name,
      options: [
        {
          label: 'Edit Property',
          onPress: () => router.push(`/(tabs)/properties/${slug}/edit` as never),
        },
        {
          label: 'Add Tenant Here',
          onPress: () => router.push(`/(tabs)/tenants/new?property=${slug}` as never),
        },
        {
          label: 'Record Payment',
          onPress: () => router.push(`/(tabs)/payments/new?property=${slug}` as never),
        },
        {
          label: 'Delete Property',
          destructive: true,
          // Native Alert.alert for destructive confirms — guaranteed correct
          // rendering on iOS (shows red Delete) and Android (Material dialog).
          // The custom ConfirmDialog has rendering edge cases we couldn't fully
          // resolve, so for critical/destructive flows we fall back to native.
          onPress: () => Alert.alert(
            'Delete property?',
            `"${property.name}" will be permanently deleted along with its floors, units, and tenant records. This cannot be undone.`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteProperty.mutateAsync(property.slug);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    router.replace('/(tabs)/properties');
                  } catch {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    Alert.alert('Could not delete', 'Please check your connection and try again.');
                  }
                },
              },
            ],
            { cancelable: true },
          ),
        },
      ],
    });
  }, [property, slug, showActionSheet, deleteProperty]);

  const isLoading = propertyLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Entrance trigger={focusTick} style={{ marginBottom: 20 }}>
          {isLoading || !property ? (
            <HeaderSkeleton colors={colors} />
          ) : (
            <>
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
                <View style={{ flex: 1 }} />
                <Pressable
                  onPress={() => router.push(`/(tabs)/properties/${slug}/edit` as never)}
                  android_ripple={null}
                  hitSlop={8}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    borderWidth: 1, borderColor: colors.border,
                    backgroundColor: colors.card,
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  <PencilIcon size={16} color={colors.foreground} />
                </Pressable>
                <Pressable
                  onPress={openMoreActions}
                  android_ripple={null}
                  hitSlop={8}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    borderWidth: 1, borderColor: colors.border,
                    backgroundColor: colors.card,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <DotsThreeVerticalIcon size={18} color={colors.foreground} weight="bold" />
                </Pressable>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <Text style={{
                  color: colors.foreground,
                  fontSize: 22, fontFamily: 'Inter_600SemiBold',
                  letterSpacing: -0.3, paddingRight: 0.3, flexShrink: 1,
                }}>
                  {property.name}
                </Text>
                <TypeBadge type={property.property_type} colors={colors} />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5 }}>
                <MapPinIcon size={13} color={colors.mutedFg} style={{ marginTop: 2 }} />
                <Text style={{
                  color: colors.mutedFg, fontSize: 13,
                  fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18,
                }}>
                  {property.address}
                </Text>
              </View>

              {property.created_at && (
                <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 }}>
                  Added {formatShortDate(property.created_at)}
                </Text>
              )}
            </>
          )}
        </Entrance>

        {/* ── Stats Strip ────────────────────────────────────────────────── */}
        <Entrance trigger={focusTick} delay={60} style={{ marginBottom: 12 }}>
          <PropertyStatsStrip
            occupied={occupied}
            totalSlots={totalSlots}
            vacant={vacant}
            floorsCount={sortedFloors.length}
            collected={collected}
            expected={expected}
            slotLabel={meta?.slotLabelPlural ?? 'Beds'}
            slotLabelSingular={meta?.slotLabel ?? 'Bed'}
            isLoading={slotsLoading || isLoading}
            colors={colors}
          />
        </Entrance>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <Entrance trigger={focusTick} delay={100} style={{ marginBottom: 16 }}>
          <TabBar
            active={activeTab}
            onChange={setActiveTab}
            counts={{
              floors:   sortedFloors.length || undefined,
              tenants:  occupied || undefined,
              payments: payments?.length || undefined,
            }}
            colors={colors}
          />
        </Entrance>

        {/* ── Floors tab ─────────────────────────────────────────────────── */}
        {activeTab === 'floors' && (
          <Entrance trigger={`floors-${focusTick}`} delay={120}>
            {slotsLoading ? (
              <View style={{ gap: 10 }}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={{
                    backgroundColor: colors.card,
                    borderWidth: 1, borderColor: colors.border,
                    borderRadius: 12, padding: 14,
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                  }}>
                    <Skeleton width={44} height={44} radius={22} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Skeleton width={120} height={13} />
                      <Skeleton width={180} height={11} />
                    </View>
                    <Skeleton width={16} height={16} radius={4} />
                  </View>
                ))}
              </View>
            ) : sortedFloors.length === 0 ? (
              <EmptyCard
                Icon={StackIcon}
                title="No floors yet"
                description="Add floors and rooms from the web app to see them here."
                colors={colors}
              />
            ) : (
              <View style={{ gap: 10 }}>
                {sortedFloors.map((floorNum, i) => (
                  <Entrance key={floorNum} delay={i * 55} trigger={`floors-${focusTick}`}>
                    <FloorCard
                      floorNumber={floorNum}
                      slots={floorGroups[floorNum]}
                      colors={colors}
                    />
                  </Entrance>
                ))}
              </View>
            )}
          </Entrance>
        )}

        {/* ── Tenants tab ────────────────────────────────────────────────── */}
        {activeTab === 'tenants' && (
          <Entrance trigger={`tenants-${focusTick}`} delay={120}>
            {tenantsLoading ? (
              <View style={{ gap: 10 }}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={{
                    backgroundColor: colors.card,
                    borderWidth: 1, borderColor: colors.border,
                    borderRadius: 12, padding: 14,
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                  }}>
                    <Skeleton width={40} height={40} radius={20} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Skeleton width="60%" height={13} />
                      <Skeleton width="80%" height={11} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (tenants ?? []).length === 0 ? (
              <EmptyCard
                Icon={UsersIcon}
                title="No tenants yet"
                description="Active tenants in this property will appear here."
                colors={colors}
              />
            ) : (
              <>
                <TabHeader
                  count={(tenants ?? []).length}
                  label={(tenants ?? []).length === 1 ? 'active tenant' : 'active tenants'}
                  actionLabel="Add Tenant"
                  onAction={() => router.push(`/(tabs)/tenants/new?property=${slug}` as never)}
                  colors={colors}
                />
                <View style={{ gap: 10 }}>
                  {(tenants ?? []).map((tenant, i) => (
                    <Entrance key={tenant.id} delay={i * 50} trigger={`tenants-${focusTick}`}>
                      <TenantRow tenant={tenant} colors={colors} />
                    </Entrance>
                  ))}
                </View>
              </>
            )}
          </Entrance>
        )}

        {/* ── Payments tab ───────────────────────────────────────────────── */}
        {activeTab === 'payments' && (
          <Entrance trigger={`payments-${focusTick}`} delay={120}>
            {paymentsLoading ? (
              <View style={{ gap: 10 }}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={{
                    backgroundColor: colors.card,
                    borderWidth: 1, borderColor: colors.border,
                    borderRadius: 12, padding: 14, gap: 8,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Skeleton width="50%" height={13} />
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
            ) : (payments ?? []).length === 0 ? (
              <EmptyCard
                Icon={CurrencyCircleDollarIcon}
                title="No payments yet"
                description="Record payments from the Payments tab and they'll appear here."
                colors={colors}
              />
            ) : (
              <>
                <TabHeader
                  count={(payments ?? []).length}
                  label={(payments ?? []).length === 1 ? 'payment recorded' : 'payments recorded'}
                  actionLabel="Record"
                  onAction={() => router.push(`/(tabs)/payments/new?property=${slug}` as never)}
                  colors={colors}
                />
                <View style={{ gap: 10 }}>
                  {(payments ?? []).map((payment, i) => (
                    <Entrance key={payment.id} delay={i * 50} trigger={`payments-${focusTick}`}>
                      <PaymentRow payment={payment} colors={colors} />
                    </Entrance>
                  ))}
                </View>
              </>
            )}
          </Entrance>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
