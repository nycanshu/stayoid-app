import {
  View, Text, ScrollView, Pressable, RefreshControl, Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  PhoneIcon, MapPinIcon,
  PencilIcon, DotsThreeVerticalIcon, UserIcon, BriefcaseIcon,
  IdentificationCardIcon, UsersThreeIcon, HouseIcon, ReceiptIcon,
  PlusIcon, WhatsappLogoIcon, ChatTextIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { useTenant, useExitTenant } from '../../../../lib/hooks/use-tenants';
import { usePayments } from '../../../../lib/hooks/use-payments';
import { useActionSheet } from '../../../../components/ui/ActionSheet';
import { useConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { useRecordPaymentSheet } from '../../../../components/payments/RecordPaymentSheet';
import { sendWhatsApp, sendSMS } from '../../../../lib/utils/messaging';
import {
  formatCurrency, formatTenure, formatLongDate,
  GENDER_LABELS, WORK_TYPE_LABELS, ID_PROOF_LABELS, getInitials,
} from '../../../../lib/utils/formatters';
import { getPropertyTypeLabels } from '../../../../lib/constants/property-type-meta';
import { PaymentRow } from '../../../../components/properties/PaymentRow';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Entrance } from '../../../../components/animations';
import { THEME } from '../../../../lib/theme';
import { cn } from '../../../../lib/utils';

function SectionCard({
  title, Icon, action, mutedFg, children,
}: {
  title: string;
  Icon: React.ComponentType<{ size: number; color: string; weight?: any }>;
  action?: React.ReactNode;
  mutedFg: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-card border border-border rounded-xl p-4 mb-3">
      <View className="flex-row items-center justify-between mb-3.5 gap-2">
        <View className="flex-row items-center gap-2 shrink">
          <Icon size={16} color={mutedFg} weight="duotone" />
          <Text
            className="text-foreground text-sm"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {title}
          </Text>
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

function InfoRow({
  label, value, valueColor,
}: { label: string; value: string; valueColor?: string }) {
  return (
    <View className="flex-row justify-between items-start py-1.5">
      <Text
        className="text-muted-foreground text-xs flex-1"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {label}
      </Text>
      <Text
        className="text-foreground text-xs flex-1 text-right"
        style={[
          { fontFamily: 'Inter_600SemiBold' },
          valueColor ? { color: valueColor } : null,
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function StatTile({
  label, value, color,
}: { label: string; value: string; color: string }) {
  return (
    <View className="flex-1 p-3 gap-1">
      <Text
        className="text-muted-foreground text-[11px]"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {label}
      </Text>
      <Text
        className="text-base"
        style={{ color, fontFamily: 'Inter_600SemiBold' }}
      >
        {value}
      </Text>
    </View>
  );
}

function DetailSkeleton() {
  return (
    <View>
      <View className="bg-card border border-border rounded-xl p-4 mb-3">
        <View className="flex-row items-center gap-3.5 mb-3.5">
          <Skeleton width={56} height={56} radius={28} />
          <View className="flex-1 gap-2">
            <Skeleton width="60%" height={16} />
            <Skeleton width={80} height={18} radius={99} />
          </View>
        </View>
        <Skeleton width="80%" height={11} />
      </View>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className="bg-card border border-border rounded-xl p-4 mb-3 gap-2.5"
        >
          <Skeleton width={140} height={14} />
          <Skeleton width="100%" height={11} />
          <Skeleton width="80%" height={11} />
          <Skeleton width="90%" height={11} />
        </View>
      ))}
    </View>
  );
}

function NotFound({ mutedFg }: { mutedFg: string }) {
  return (
    <View className="bg-card border border-border rounded-xl p-8 items-center">
      <View className="size-14 rounded-2xl bg-muted items-center justify-center mb-3.5">
        <UserIcon size={26} color={mutedFg} weight="duotone" />
      </View>
      <Text
        className="text-foreground text-[15px] mb-1.5 text-center"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        Tenant not found
      </Text>
      <Text
        className="text-muted-foreground text-[13px] text-center leading-5 mb-[18px]"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        This tenant doesn't exist or has been deleted.
      </Text>
      <Pressable
        onPress={() => router.replace('/tenants')}
        android_ripple={null}
        className="bg-primary rounded-[10px] px-4 py-2.5"
      >
        <Text
          className="text-white text-[13px]"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Back to Tenants
        </Text>
      </Pressable>
    </View>
  );
}

export default function TenantDetailScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { show: showActionSheet } = useActionSheet();
  const { confirm }               = useConfirmDialog();
  const { open: openPaymentSheet } = useRecordPaymentSheet();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
  }, []));

  const {
    data: tenant, isLoading, refetch: refetchTenant, isRefetching,
  } = useTenant(slug);
  const {
    data: payments, refetch: refetchPayments,
  } = usePayments({ tenant_id: tenant?.id });

  const exitTenant = useExitTenant();

  const handleRefresh = useCallback(() => {
    refetchTenant(); refetchPayments();
    setFocusTick((t) => t + 1);
  }, [refetchTenant, refetchPayments]);

  const paymentSummary = useMemo(() => {
    const list = payments ?? [];
    let totalPaid = 0;
    let paidCount = 0, partialCount = 0, pendingCount = 0;
    for (const p of list) {
      if (p.payment_status === 'PAID')        { totalPaid += Number(p.amount); paidCount++; }
      else if (p.payment_status === 'PARTIAL') { totalPaid += Number(p.amount); partialCount++; }
      else                                     { pendingCount++; }
    }
    return { totalPaid, paidCount, partialCount, pendingCount, count: list.length };
  }, [payments]);

  const handleCall = async () => {
    if (!tenant?.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${tenant.phone}`);
  };

  const handleMessage = () => {
    if (!tenant?.phone) return;
    showActionSheet({
      title: tenant.name,
      message: 'Send a message',
      options: [
        {
          label: 'WhatsApp',
          Icon: WhatsappLogoIcon,
          iconBg: palette.successBg,
          iconColor: palette.success,
          onPress: () => sendWhatsApp(tenant.phone, `Hi ${tenant.name},\n\n`),
        },
        {
          label: 'SMS',
          Icon: ChatTextIcon,
          iconBg: palette.infoBg,
          iconColor: palette.info,
          onPress: () => sendSMS(tenant.phone, `Hi ${tenant.name},\n\n`),
        },
      ],
    });
  };

  const confirmExit = useCallback(() => {
    if (!tenant) return;
    const today = new Date();
    const opts = [0, 1, 2, 3, 7].map((d) => {
      const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() - d);
      const y  = dt.getFullYear();
      const m  = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return {
        label: d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`,
        iso:   `${y}-${m}-${dd}`,
      };
    });
    showActionSheet({
      title:   'Mark as exited',
      message: `When did ${tenant.name} move out? This will free up their slot.`,
      options: opts.map((o) => ({
        label: o.label,
        destructive: true,
        onPress: async () => {
          try {
            await exitTenant.mutateAsync({ id: tenant.id, exit_date: o.iso });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            refetchTenant();
          } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        },
      })),
    });
  }, [tenant, exitTenant, refetchTenant, showActionSheet]);

  const openMoreActions = useCallback(() => {
    if (!tenant) return;
    const opts: { label: string; destructive?: boolean; onPress: () => void }[] = [];
    if (tenant.is_active) {
      opts.push({
        label: 'Record Payment',
        onPress: () => openPaymentSheet({ tenantSlug: tenant.slug }),
      });
      opts.push({
        label: 'Mark as Exited',
        destructive: true,
        onPress: confirmExit,
      });
    }
    showActionSheet({ title: tenant.name, options: opts });
    void confirm;
  }, [tenant, confirmExit, showActionSheet, confirm]);

  const isActive = tenant?.is_active;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      <Stack.Screen
        options={{
          title: tenant?.name ?? '',
          headerRight: () => (
            <View className="flex-row items-center gap-1">
              {tenant && isActive && (
                <Pressable
                  onPress={() => router.push(`/tenants/${slug}/edit` as never)}
                  android_ripple={null}
                  hitSlop={8}
                  className="size-9 items-center justify-center"
                >
                  <PencilIcon size={17} color={palette.foreground} />
                </Pressable>
              )}
              {tenant && (
                <Pressable
                  onPress={openMoreActions}
                  android_ripple={null}
                  hitSlop={8}
                  className="size-9 items-center justify-center"
                >
                  <DotsThreeVerticalIcon size={20} color={palette.foreground} weight="bold" />
                </Pressable>
              )}
            </View>
          ),
        }}
      />

      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
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

        {isLoading ? (
          <Entrance trigger={focusTick} delay={60}><DetailSkeleton /></Entrance>
        ) : !tenant ? (
          <Entrance trigger={focusTick} delay={60}><NotFound mutedFg={palette.mutedForeground} /></Entrance>
        ) : (
          <>
            <Entrance trigger={focusTick} delay={60}>
              <View className="bg-card border border-border rounded-xl p-4 mb-3">
                <View className="flex-row items-center gap-3.5">
                  <View
                    className={cn(
                      'size-14 rounded-full bg-muted items-center justify-center',
                      !isActive && 'opacity-60',
                    )}
                  >
                    <Text
                      className="text-foreground text-lg"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {getInitials(tenant.name)}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text
                      numberOfLines={1}
                      className="text-foreground text-lg tracking-tight mb-1.5"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {tenant.name}
                    </Text>
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <View className={cn('rounded-full px-2 py-0.5', isActive ? 'bg-success-bg' : 'bg-muted')}>
                        <Text
                          className={cn('text-[11px]', isActive ? 'text-success' : 'text-muted-foreground')}
                          style={{ fontFamily: 'Inter_600SemiBold' }}
                        >
                          {isActive ? 'Active' : 'Exited'}
                        </Text>
                      </View>
                      <Text
                        className="text-muted-foreground text-[11px]"
                        style={{ fontFamily: 'Inter_400Regular' }}
                      >
                        {GENDER_LABELS[tenant.gender] ?? tenant.gender}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-2 mt-3.5">
                  <Pressable
                    onPress={handleCall}
                    android_ripple={null}
                    className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary rounded-[10px] py-2.5"
                  >
                    <PhoneIcon size={14} color="#fff" weight="bold" />
                    <Text
                      className="text-white text-[13px]"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      Call
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleMessage}
                    android_ripple={null}
                    className="flex-1 flex-row items-center justify-center gap-1.5 border border-border bg-card rounded-[10px] py-2.5"
                  >
                    <WhatsappLogoIcon size={14} color={palette.success} weight="fill" />
                    <Text
                      className="text-foreground text-[13px]"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      Message
                    </Text>
                  </Pressable>
                  {isActive && (
                    <Pressable
                      onPress={() => openPaymentSheet({ tenantSlug: tenant.slug })}
                      android_ripple={null}
                      className="flex-1 flex-row items-center justify-center gap-1.5 border border-border bg-card rounded-[10px] py-2.5"
                    >
                      <ReceiptIcon size={14} color={palette.foreground} weight="bold" />
                      <Text
                        className="text-foreground text-[13px]"
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                      >
                        Record
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Entrance>

            <Entrance trigger={focusTick} delay={100}>
              <SectionCard title={`${getPropertyTypeLabels(tenant.property_type).slotLabel} assignment`} Icon={HouseIcon} mutedFg={palette.mutedForeground}>
                <View className="flex-row items-start gap-1.5 mb-3">
                  <MapPinIcon size={13} color={palette.mutedForeground} style={{ marginTop: 2 }} />
                  <Text
                    className="text-foreground text-[13px] flex-1 leading-[18px]"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    <Text style={{ fontFamily: 'Inter_600SemiBold' }}>{tenant.property_name}</Text>
                    {' · '}{getPropertyTypeLabels(tenant.property_type).unitLabel} {tenant.unit_number}{' · '}{getPropertyTypeLabels(tenant.property_type).slotLabel} {tenant.slot_number}
                  </Text>
                </View>

                <View className="h-px bg-border my-1" />
                <InfoRow label="Monthly rent" value={formatCurrency(tenant.monthly_rent)} />
                <InfoRow label="Tenure" value={formatTenure(tenant.join_date, tenant.exit_date)} />
                <InfoRow label="Joined" value={formatLongDate(tenant.join_date)} />
                {tenant.exit_date && (
                  <InfoRow
                    label="Exited"
                    value={formatLongDate(tenant.exit_date)}
                    valueColor={palette.mutedForeground}
                  />
                )}
              </SectionCard>
            </Entrance>

            <Entrance trigger={focusTick} delay={140}>
              <SectionCard title="Personal information" Icon={UserIcon} mutedFg={palette.mutedForeground}>
                <InfoRow label="Phone" value={tenant.phone} />
                <InfoRow label="Gender" value={GENDER_LABELS[tenant.gender] ?? tenant.gender} />
                {tenant.email && <InfoRow label="Email" value={tenant.email} />}
                {tenant.permanent_address && (
                  <InfoRow label="Address" value={tenant.permanent_address} />
                )}
              </SectionCard>
            </Entrance>

            {(tenant.work_type || tenant.work_location) && (
              <Entrance trigger={focusTick} delay={180}>
                <SectionCard title="Work" Icon={BriefcaseIcon} mutedFg={palette.mutedForeground}>
                  {tenant.work_type && (
                    <InfoRow
                      label="Type"
                      value={WORK_TYPE_LABELS[tenant.work_type] ?? tenant.work_type}
                    />
                  )}
                  {tenant.work_location && (
                    <InfoRow label="Location" value={tenant.work_location} />
                  )}
                </SectionCard>
              </Entrance>
            )}

            {(tenant.id_proof_type || tenant.id_proof_number) && (
              <Entrance trigger={focusTick} delay={220}>
                <SectionCard title="ID proof" Icon={IdentificationCardIcon} mutedFg={palette.mutedForeground}>
                  {tenant.id_proof_type && (
                    <InfoRow
                      label="Type"
                      value={ID_PROOF_LABELS[tenant.id_proof_type] ?? tenant.id_proof_type}
                    />
                  )}
                  {tenant.id_proof_number && (
                    <InfoRow label="Number" value={tenant.id_proof_number} />
                  )}
                </SectionCard>
              </Entrance>
            )}

            {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
              <Entrance trigger={focusTick} delay={260}>
                <SectionCard title="Emergency contact" Icon={UsersThreeIcon} mutedFg={palette.mutedForeground}>
                  {tenant.emergency_contact_name && (
                    <InfoRow label="Name" value={tenant.emergency_contact_name} />
                  )}
                  {tenant.emergency_contact_phone && (
                    <InfoRow label="Phone" value={tenant.emergency_contact_phone} />
                  )}
                </SectionCard>
              </Entrance>
            )}

            <Entrance trigger={focusTick} delay={300}>
              <View className="bg-card border border-border rounded-xl mb-3 overflow-hidden">
                <View className="flex-row items-center gap-2 p-4 pb-3">
                  <ReceiptIcon size={16} color={palette.mutedForeground} weight="duotone" />
                  <Text
                    className="text-foreground text-sm"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    Financial summary
                  </Text>
                </View>
                <View className="flex-row border-t border-border">
                  <View className="flex-1 border-r border-border p-3">
                    <Text
                      className="text-muted-foreground text-[11px] mb-1"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      Total paid
                    </Text>
                    <Text
                      className="text-foreground text-base"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {formatCurrency(paymentSummary.totalPaid)}
                    </Text>
                  </View>
                  <View className="flex-1 p-3">
                    <Text
                      className="text-muted-foreground text-[11px] mb-1"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      Deposit
                    </Text>
                    <Text
                      className="text-foreground text-base"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {formatCurrency(tenant.deposit_amount)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row border-t border-border">
                  <StatTile label="Paid"    value={paymentSummary.paidCount.toString()}    color={palette.success} />
                  <View className="w-px bg-border" />
                  <StatTile label="Partial" value={paymentSummary.partialCount.toString()} color={palette.warning} />
                  <View className="w-px bg-border" />
                  <StatTile label="Pending" value={paymentSummary.pendingCount.toString()} color={paymentSummary.pendingCount > 0 ? palette.destructive : palette.mutedForeground} />
                </View>
              </View>
            </Entrance>

            <Entrance trigger={focusTick} delay={340}>
              <View className="flex-row items-center justify-between mb-2.5">
                <Text
                  className="text-foreground text-sm"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  Payment history
                </Text>
                {isActive && (payments ?? []).length > 0 && (
                  <Pressable
                    onPress={() => openPaymentSheet({ tenantSlug: tenant.slug })}
                    android_ripple={null}
                    hitSlop={6}
                    className="flex-row items-center gap-1 bg-primary rounded-[10px] px-2.5 py-1.5"
                  >
                    <PlusIcon size={11} color="#fff" weight="bold" />
                    <Text
                      className="text-white text-xs"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      Record
                    </Text>
                  </Pressable>
                )}
              </View>
              {(payments ?? []).length === 0 ? (
                <View className="bg-card border border-border rounded-xl p-6 items-center">
                  <View className="size-11 rounded-full bg-muted items-center justify-center mb-2.5">
                    <ReceiptIcon size={20} color={palette.mutedForeground} weight="duotone" />
                  </View>
                  <Text
                    className="text-foreground text-[13px] mb-1"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    No payments yet
                  </Text>
                  <Text
                    className="text-muted-foreground text-xs text-center"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    Recorded payments will appear here.
                  </Text>
                </View>
              ) : (
                <View className="gap-2.5">
                  {(payments ?? []).map((p) => (
                    <PaymentRow key={p.id} payment={p} />
                  ))}
                </View>
              )}
            </Entrance>
          </>
        )}
      </ScrollView>
    </View>
  );
}
