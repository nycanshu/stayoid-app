import {
  View, Text, ScrollView, Pressable, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import {
  ArrowLeftIcon, MapPinIcon, DotsThreeVerticalIcon, PencilIcon,
  StackIcon, CurrencyCircleDollarIcon,
  PlusIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { useProperty, useSlots, useDeleteProperty } from '../../../../lib/hooks/use-properties';
import { useFloors } from '../../../../lib/hooks/use-floors';
import { usePayments } from '../../../../lib/hooks/use-payments';
import { useDashboard } from '../../../../lib/hooks/use-dashboard';
import { useActionSheet } from '../../../../components/ui/ActionSheet';
import { getPropertyTypeMeta } from '../../../../lib/constants/property-type-meta';
import { PropertyStatsStrip } from '../../../../components/properties/PropertyStatsStrip';
import { FloorCard } from '../../../../components/properties/FloorCard';
import { FloorFormModal } from '../../../../components/properties/FloorFormModal';
import { PaymentRow } from '../../../../components/properties/PaymentRow';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Entrance } from '../../../../components/animations';
import { THEME } from '../../../../lib/theme';
import { cn } from '../../../../lib/utils';
import type { Slot } from '../../../../types/property';

type Tab = 'floors' | 'payments';

function TypeBadge({ type, palette }: { type: string; palette: typeof THEME['light'] }) {
  const meta = getPropertyTypeMeta(type, palette);
  const Icon = meta.Icon;
  return (
    <View className="flex-row items-center gap-1 border border-border rounded-full px-2 py-0.5">
      <View
        style={{ backgroundColor: meta.iconBg }}
        className="size-4 rounded-full items-center justify-center"
      >
        <Icon size={9} color={meta.iconColor} weight="fill" />
      </View>
      <Text
        className="text-foreground text-[11px]"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {meta.shortLabel}
      </Text>
    </View>
  );
}

function EmptyCard({
  Icon, title, description, mutedFg,
}: {
  Icon: React.ComponentType<{ size: number; color: string; weight?: any }>;
  title: string; description: string; mutedFg: string;
}) {
  return (
    <View className="bg-card border border-border rounded-xl p-6 items-center">
      <View className="size-11 rounded-full bg-muted items-center justify-center mb-2.5">
        <Icon size={20} color={mutedFg} weight="duotone" />
      </View>
      <Text
        className="text-foreground text-[13px] mb-1 text-center"
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

function TabBar({
  active, onChange, counts,
}: {
  active: Tab; onChange: (t: Tab) => void;
  counts: { floors?: number; payments?: number };
}) {
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'floors',   label: 'Floors',   count: counts.floors },
    { key: 'payments', label: 'Payments', count: counts.payments },
  ];

  return (
    <View className="flex-row bg-muted rounded-[10px] p-[3px]">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            android_ripple={null}
            style={isActive ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.12,
              shadowRadius: 3,
              elevation: 2,
            } : undefined}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-lg',
              isActive && 'bg-card',
            )}
          >
            <Text
              className={cn(
                'text-[13px]',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {tab.label}
            </Text>
            {tab.count !== undefined && tab.count > 0 && (
              <Text
                className={cn(
                  'text-[11px]',
                  isActive ? 'text-foreground opacity-60' : 'text-muted-foreground',
                )}
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {tab.count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function TabHeader({
  count, label, actionLabel, onAction,
}: {
  count: number; label: string; actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text
        className="text-muted-foreground text-xs"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {count} {label}
      </Text>
      <Pressable
        onPress={onAction}
        android_ripple={null}
        hitSlop={6}
        className="flex-row items-center gap-1 bg-primary rounded-[10px] px-2.5 py-1.5"
      >
        <PlusIcon size={12} color="#fff" weight="bold" />
        <Text
          className="text-white text-xs"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function HeaderSkeleton() {
  return (
    <View>
      <View className="flex-row mb-3.5 gap-2.5">
        <Skeleton width={40} height={40} radius={10} />
        <View className="flex-1" />
        <Skeleton width={40} height={40} radius={10} />
      </View>
      <View className="gap-2">
        <Skeleton width={180} height={26} />
        <Skeleton width={240} height={13} />
        <Skeleton width={100} height={11} />
      </View>
    </View>
  );
}

export default function PropertyDetailScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { show: showActionSheet } = useActionSheet();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('floors');
  const [focusTick, setFocusTick] = useState(0);
  const [floorFormOpen, setFloorFormOpen] = useState(false);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const { data: property, isLoading: propertyLoading, refetch: refetchProp, isRefetching } = useProperty(slug);
  const { data: floors,   isLoading: floorsLoading,   refetch: refetchFloors }             = useFloors(property?.id);
  const { data: slots,    isLoading: slotsLoading,    refetch: refetchSlots }              = useSlots(property?.id);
  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments }           = usePayments({ property_id: property?.id });
  const { data: dashboard }                                                                 = useDashboard();
  const deleteProperty = useDeleteProperty();

  const handleRefresh = useCallback(() => {
    refetchProp(); refetchFloors(); refetchSlots(); refetchPayments();
    setFocusTick((t) => t + 1);
  }, [refetchProp, refetchFloors, refetchSlots, refetchPayments]);

  const propertyStats = useMemo(
    () => dashboard?.properties?.find((p) => p.id === property?.id),
    [dashboard?.properties, property?.id],
  );

  const slotsByFloor = useMemo(() => {
    const map: Record<number, Slot[]> = {};
    (slots ?? []).forEach((s) => { (map[s.floor_number] ??= []).push(s); });
    return map;
  }, [slots]);

  const sortedFloors = useMemo(
    () => (floors ?? [])
      .map((f) => f.floor_number)
      .sort((a, b) => a - b),
    [floors],
  );

  const totalSlots  = slots?.length ?? 0;
  const occupied    = slots?.filter((s) => s.is_occupied).length ?? 0;
  const vacant      = totalSlots - occupied;
  const collected   = propertyStats ? Number(propertyStats.collected_rent) : 0;
  const expected    = propertyStats ? Number(propertyStats.expected_rent)  : 0;
  const meta        = property ? getPropertyTypeMeta(property.property_type, palette) : null;

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
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={palette.primary}
          />
        }
      >
        <Entrance trigger={focusTick} style={{ marginBottom: 20 }}>
          {isLoading || !property ? (
            <HeaderSkeleton />
          ) : (
            <>
              <View className="flex-row items-center mb-3.5">
                <Pressable
                  onPress={() => router.back()}
                  android_ripple={null}
                  hitSlop={8}
                  className="size-10 rounded-[10px] border border-border bg-card items-center justify-center"
                >
                  <ArrowLeftIcon size={18} color={palette.foreground} />
                </Pressable>
                <View className="flex-1" />
                <Pressable
                  onPress={() => router.push(`/(tabs)/properties/${slug}/edit` as never)}
                  android_ripple={null}
                  hitSlop={8}
                  className="size-10 rounded-[10px] border border-border bg-card items-center justify-center mr-2"
                >
                  <PencilIcon size={16} color={palette.foreground} />
                </Pressable>
                <Pressable
                  onPress={openMoreActions}
                  android_ripple={null}
                  hitSlop={8}
                  className="size-10 rounded-[10px] border border-border bg-card items-center justify-center"
                >
                  <DotsThreeVerticalIcon size={18} color={palette.foreground} weight="bold" />
                </Pressable>
              </View>

              <View className="flex-row items-center gap-2 flex-wrap mb-1.5">
                <Text
                  className="text-foreground text-[22px] tracking-tight shrink"
                  style={{ fontFamily: 'Inter_600SemiBold', paddingRight: 0.3 }}
                >
                  {property.name}
                </Text>
                <TypeBadge type={property.property_type} palette={palette} />
              </View>

              <View className="flex-row items-start gap-1">
                <MapPinIcon size={13} color={palette.mutedForeground} style={{ marginTop: 2 }} />
                <Text
                  className="text-muted-foreground text-[13px] flex-1 leading-[18px]"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {property.address}
                </Text>
              </View>

              {property.created_at && (
                <Text
                  className="text-muted-foreground text-xs mt-1"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  Added {formatShortDate(property.created_at)}
                </Text>
              )}
            </>
          )}
        </Entrance>

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
          />
        </Entrance>

        <Entrance trigger={focusTick} delay={100} style={{ marginBottom: 16 }}>
          <TabBar
            active={activeTab}
            onChange={setActiveTab}
            counts={{
              floors:   sortedFloors.length || undefined,
              payments: payments?.length || undefined,
            }}
          />
        </Entrance>

        {activeTab === 'floors' && (
          <Entrance trigger={`floors-${focusTick}`} delay={120}>
            {(floorsLoading || slotsLoading) ? (
              <View className="gap-2.5">
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    className="bg-card border border-border rounded-xl p-3.5 flex-row items-center gap-3"
                  >
                    <Skeleton width={44} height={44} radius={22} />
                    <View className="flex-1 gap-1.5">
                      <Skeleton width={120} height={13} />
                      <Skeleton width={180} height={11} />
                    </View>
                    <Skeleton width={16} height={16} radius={4} />
                  </View>
                ))}
              </View>
            ) : sortedFloors.length === 0 ? (
              <View className="bg-card border border-border rounded-xl p-7 items-center">
                <View className="size-[52px] rounded-2xl bg-primary-bg items-center justify-center mb-3">
                  <StackIcon size={24} color={palette.primary} weight="duotone" />
                </View>
                <Text
                  className="text-foreground text-sm mb-1 text-center"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  No floors yet
                </Text>
                <Text
                  className="text-muted-foreground text-xs text-center leading-[18px] mb-3.5"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  Add your first floor to start organising {meta?.unitLabelPlural.toLowerCase() ?? 'units'} and {meta?.slotLabelPlural.toLowerCase() ?? 'beds'}.
                </Text>
                <Pressable
                  onPress={() => setFloorFormOpen(true)}
                  android_ripple={null}
                  className="flex-row items-center gap-1.5 bg-primary rounded-[10px] px-3.5 py-2.5"
                >
                  <PlusIcon size={13} color="#fff" weight="bold" />
                  <Text
                    className="text-white text-[13px]"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    Add Floor
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    className="text-muted-foreground text-xs"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {sortedFloors.length} {sortedFloors.length === 1 ? 'floor' : 'floors'}
                  </Text>
                  <Pressable
                    onPress={() => setFloorFormOpen(true)}
                    android_ripple={null}
                    hitSlop={6}
                    className="flex-row items-center gap-1 bg-primary rounded-[10px] px-2.5 py-1.5"
                  >
                    <PlusIcon size={12} color="#fff" weight="bold" />
                    <Text
                      className="text-white text-xs"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      Add Floor
                    </Text>
                  </Pressable>
                </View>

                <View className="gap-2.5">
                  {sortedFloors.map((floorNum, i) => {
                    const floor = floors?.find((f) => f.floor_number === floorNum);
                    if (!floor || !property) return null;
                    return (
                      <Entrance key={floorNum} delay={i * 55} trigger={`floors-${focusTick}`}>
                        <FloorCard
                          floorNumber={floorNum}
                          slots={slotsByFloor[floorNum] ?? []}
                          propertyId={property.id}
                          floorId={floor.id}
                          propertyType={property.property_type}
                          propertySlug={property.slug}
                          floorSlug={floor.slug}
                          propertyName={property.name}
                        />
                      </Entrance>
                    );
                  })}
                </View>
              </>
            )}
          </Entrance>
        )}

        {activeTab === 'payments' && (
          <Entrance trigger={`payments-${focusTick}`} delay={120}>
            {paymentsLoading ? (
              <View className="gap-2.5">
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    className="bg-card border border-border rounded-xl p-3.5 gap-2"
                  >
                    <View className="flex-row justify-between">
                      <Skeleton width="50%" height={13} />
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
            ) : (payments ?? []).length === 0 ? (
              <EmptyCard
                Icon={CurrencyCircleDollarIcon}
                title="No payments yet"
                description="Record payments from the Payments tab and they'll appear here."
                mutedFg={palette.mutedForeground}
              />
            ) : (
              <>
                <TabHeader
                  count={(payments ?? []).length}
                  label={(payments ?? []).length === 1 ? 'payment recorded' : 'payments recorded'}
                  actionLabel="Record"
                  onAction={() => router.push(`/(tabs)/payments/new?property=${slug}` as never)}
                />
                <View className="gap-2.5">
                  {(payments ?? []).map((payment, i) => (
                    <Entrance key={payment.id} delay={i * 50} trigger={`payments-${focusTick}`}>
                      <PaymentRow payment={payment} />
                    </Entrance>
                  ))}
                </View>
              </>
            )}
          </Entrance>
        )}
      </ScrollView>

      {property && (
        <FloorFormModal
          visible={floorFormOpen}
          propertyId={property.id}
          onClose={() => setFloorFormOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}
