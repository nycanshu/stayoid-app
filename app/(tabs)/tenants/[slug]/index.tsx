import {
  View, Text, ScrollView, Pressable, RefreshControl, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ArrowLeftIcon, PhoneIcon, MapPinIcon,
  PencilIcon, DotsThreeVerticalIcon, UserIcon, BriefcaseIcon,
  IdentificationCardIcon, UsersThreeIcon, HouseIcon, ReceiptIcon,
  PlusIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useTenant, useExitTenant } from '../../../../lib/hooks/use-tenants';
import { usePayments } from '../../../../lib/hooks/use-payments';
import { useColors } from '../../../../lib/hooks/use-colors';
import { useActionSheet } from '../../../../components/ui/ActionSheet';
import { useConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import {
  formatCurrency, formatTenure, formatLongDate,
  GENDER_LABELS, WORK_TYPE_LABELS, ID_PROOF_LABELS, getInitials,
} from '../../../../lib/utils/formatters';
import { PaymentRow } from '../../../../components/properties/PaymentRow';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Entrance } from '../../../../components/animations';
import type { AppColors } from '../../../../lib/theme/colors';

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({
  title, Icon, action, colors, children,
}: {
  title: string;
  Icon: React.ComponentType<{ size: number; color: string; weight?: any }>;
  action?: React.ReactNode;
  colors: AppColors;
  children: React.ReactNode;
}) {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 16, marginBottom: 12,
    }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, gap: 8,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          <Icon size={16} color={colors.mutedFg} weight="duotone" />
          <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
            {title}
          </Text>
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

// ── Single info row inside a section ──────────────────────────────────────────
function InfoRow({
  label, value, valueColor, colors,
}: { label: string; value: string; valueColor?: string; colors: AppColors }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 7 }}>
      <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 }}>
        {label}
      </Text>
      <Text
        style={{
          color: valueColor ?? colors.foreground,
          fontSize: 12, fontFamily: 'Inter_600SemiBold',
          flex: 1, textAlign: 'right',
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

// ── 2x2 stat tiles ────────────────────────────────────────────────────────────
function StatTile({
  label, value, color, colors,
}: { label: string; value: string; color: string; colors: AppColors }) {
  return (
    <View style={{ flex: 1, padding: 12, gap: 4 }}>
      <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
        {label}
      </Text>
      <Text style={{ color, fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
        {value}
      </Text>
    </View>
  );
}

// ── Hero skeleton ─────────────────────────────────────────────────────────────
function DetailSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View>
      {/* Hero */}
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16, marginBottom: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <Skeleton width={56} height={56} radius={28} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="60%" height={16} />
            <Skeleton width={80} height={18} radius={99} />
          </View>
        </View>
        <Skeleton width="80%" height={11} />
      </View>
      {/* Cards */}
      {[0, 1, 2].map((i) => (
        <View key={i} style={{
          backgroundColor: colors.card,
          borderWidth: 1, borderColor: colors.border,
          borderRadius: 12, padding: 16, marginBottom: 12, gap: 10,
        }}>
          <Skeleton width={140} height={14} />
          <Skeleton width="100%" height={11} />
          <Skeleton width="80%" height={11} />
          <Skeleton width="90%" height={11} />
        </View>
      ))}
    </View>
  );
}

// ── Not-found state ───────────────────────────────────────────────────────────
function NotFound({ colors }: { colors: AppColors }) {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 32, alignItems: 'center',
    }}>
      <View style={{
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: colors.mutedBg,
        alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      }}>
        <UserIcon size={26} color={colors.mutedFg} weight="duotone" />
      </View>
      <Text style={{
        color: colors.foreground, fontSize: 15,
        fontFamily: 'Inter_600SemiBold', marginBottom: 6, textAlign: 'center',
      }}>
        Tenant not found
      </Text>
      <Text style={{
        color: colors.mutedFg, fontSize: 13,
        fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20, marginBottom: 18,
      }}>
        This tenant doesn't exist or has been deleted.
      </Text>
      <Pressable
        onPress={() => router.replace('/(tabs)/tenants')}
        android_ripple={null}
        style={{
          backgroundColor: colors.primary, borderRadius: 10,
          paddingHorizontal: 16, paddingVertical: 10,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
          Back to Tenants
        </Text>
      </Pressable>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function TenantDetailScreen() {
  const colors = useColors();
  const { show: showActionSheet } = useActionSheet();
  const { confirm }               = useConfirmDialog();
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

  // Computed payment summary (mirrors website)
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
        onPress: () => router.push(`/(tabs)/payments/new?tenant=${tenant.slug}` as never),
      });
      opts.push({
        label: 'Mark as Exited',
        destructive: true,
        onPress: confirmExit,
      });
    }
    showActionSheet({ title: tenant.name, options: opts });
    // `confirm` reference kept in deps so any future destructive confirms here pick up provider changes
    void confirm;
  }, [tenant, confirmExit, showActionSheet, confirm]);

  const isActive = tenant?.is_active;

  return (
    <SafeAreaView className="flex-1 bg-background">
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
        {/* ── Header (back + actions) ─────────────────────────────── */}
        <Entrance trigger={focusTick} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
            {tenant && isActive && (
              <Pressable
                onPress={() => router.push(`/(tabs)/tenants/${slug}/edit` as never)}
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
            )}
            {tenant && (
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
            )}
          </View>
        </Entrance>

        {/* ── Body ──────────────────────────────────────────────── */}
        {isLoading ? (
          <Entrance trigger={focusTick} delay={60}><DetailSkeleton colors={colors} /></Entrance>
        ) : !tenant ? (
          <Entrance trigger={focusTick} delay={60}><NotFound colors={colors} /></Entrance>
        ) : (
          <>
            {/* ── Hero card ── */}
            <Entrance trigger={focusTick} delay={60}>
              <View style={{
                backgroundColor: colors.card,
                borderWidth: 1, borderColor: colors.border,
                borderRadius: 12, padding: 16, marginBottom: 12,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{
                    width: 56, height: 56, borderRadius: 28,
                    backgroundColor: colors.mutedBg,
                    alignItems: 'center', justifyContent: 'center',
                    opacity: isActive ? 1 : 0.6,
                  }}>
                    <Text style={{ color: colors.foreground, fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>
                      {getInitials(tenant.name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: colors.foreground, fontSize: 18,
                        fontFamily: 'Inter_600SemiBold', letterSpacing: -0.3, marginBottom: 6,
                      }}
                    >
                      {tenant.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <View style={{
                        backgroundColor: isActive ? colors.successBg : colors.mutedBg,
                        borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3,
                      }}>
                        <Text style={{
                          color: isActive ? colors.success : colors.mutedFg,
                          fontSize: 11, fontFamily: 'Inter_600SemiBold',
                        }}>
                          {isActive ? 'Active' : 'Exited'}
                        </Text>
                      </View>
                      <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                        {GENDER_LABELS[tenant.gender] ?? tenant.gender}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Quick actions row */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                  <Pressable
                    onPress={handleCall}
                    android_ripple={null}
                    style={{
                      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                      backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10,
                    }}
                  >
                    <PhoneIcon size={14} color="#fff" weight="bold" />
                    <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                      Call
                    </Text>
                  </Pressable>
                  {isActive && (
                    <Pressable
                      onPress={() => router.push(`/(tabs)/payments/new?tenant=${tenant.slug}` as never)}
                      android_ripple={null}
                      style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                        borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
                        borderRadius: 10, paddingVertical: 10,
                      }}
                    >
                      <ReceiptIcon size={14} color={colors.foreground} weight="bold" />
                      <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                        Record Payment
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Entrance>

            {/* ── Slot info ── */}
            <Entrance trigger={focusTick} delay={100}>
              <SectionCard title="Slot assignment" Icon={HouseIcon} colors={colors}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 12 }}>
                  <MapPinIcon size={13} color={colors.mutedFg} style={{ marginTop: 2 }} />
                  <Text style={{
                    color: colors.foreground, fontSize: 13,
                    fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18,
                  }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold' }}>{tenant.property_name}</Text>
                    {' · '}{tenant.unit_number}{' · '}{tenant.slot_number}
                  </Text>
                </View>

                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
                <InfoRow label="Monthly rent" value={formatCurrency(tenant.monthly_rent)} colors={colors} />
                <InfoRow label="Tenure" value={formatTenure(tenant.join_date, tenant.exit_date)} colors={colors} />
                <InfoRow label="Joined" value={formatLongDate(tenant.join_date)} colors={colors} />
                {tenant.exit_date && (
                  <InfoRow
                    label="Exited"
                    value={formatLongDate(tenant.exit_date)}
                    valueColor={colors.mutedFg}
                    colors={colors}
                  />
                )}
              </SectionCard>
            </Entrance>

            {/* ── Personal info ── */}
            <Entrance trigger={focusTick} delay={140}>
              <SectionCard title="Personal information" Icon={UserIcon} colors={colors}>
                <InfoRow label="Phone" value={tenant.phone} colors={colors} />
                <InfoRow label="Gender" value={GENDER_LABELS[tenant.gender] ?? tenant.gender} colors={colors} />
                {tenant.email && <InfoRow label="Email" value={tenant.email} colors={colors} />}
                {tenant.permanent_address && (
                  <InfoRow label="Address" value={tenant.permanent_address} colors={colors} />
                )}
              </SectionCard>
            </Entrance>

            {/* ── Work info (if any) ── */}
            {(tenant.work_type || tenant.work_location) && (
              <Entrance trigger={focusTick} delay={180}>
                <SectionCard title="Work" Icon={BriefcaseIcon} colors={colors}>
                  {tenant.work_type && (
                    <InfoRow
                      label="Type"
                      value={WORK_TYPE_LABELS[tenant.work_type] ?? tenant.work_type}
                      colors={colors}
                    />
                  )}
                  {tenant.work_location && (
                    <InfoRow label="Location" value={tenant.work_location} colors={colors} />
                  )}
                </SectionCard>
              </Entrance>
            )}

            {/* ── ID proof (if any) ── */}
            {(tenant.id_proof_type || tenant.id_proof_number) && (
              <Entrance trigger={focusTick} delay={220}>
                <SectionCard title="ID proof" Icon={IdentificationCardIcon} colors={colors}>
                  {tenant.id_proof_type && (
                    <InfoRow
                      label="Type"
                      value={ID_PROOF_LABELS[tenant.id_proof_type] ?? tenant.id_proof_type}
                      colors={colors}
                    />
                  )}
                  {tenant.id_proof_number && (
                    <InfoRow label="Number" value={tenant.id_proof_number} colors={colors} />
                  )}
                </SectionCard>
              </Entrance>
            )}

            {/* ── Emergency contact (if any) ── */}
            {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
              <Entrance trigger={focusTick} delay={260}>
                <SectionCard title="Emergency contact" Icon={UsersThreeIcon} colors={colors}>
                  {tenant.emergency_contact_name && (
                    <InfoRow label="Name" value={tenant.emergency_contact_name} colors={colors} />
                  )}
                  {tenant.emergency_contact_phone && (
                    <InfoRow label="Phone" value={tenant.emergency_contact_phone} colors={colors} />
                  )}
                </SectionCard>
              </Entrance>
            )}

            {/* ── Financial summary ── */}
            <Entrance trigger={focusTick} delay={300}>
              <View style={{
                backgroundColor: colors.card,
                borderWidth: 1, borderColor: colors.border,
                borderRadius: 12, marginBottom: 12, overflow: 'hidden',
              }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  padding: 16, paddingBottom: 12,
                }}>
                  <ReceiptIcon size={16} color={colors.mutedFg} weight="duotone" />
                  <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                    Financial summary
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border }}>
                  <View style={{
                    flex: 1, borderRightWidth: 1, borderRightColor: colors.border, padding: 12,
                  }}>
                    <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 4 }}>
                      Total paid
                    </Text>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
                      {formatCurrency(paymentSummary.totalPaid)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, padding: 12 }}>
                    <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 4 }}>
                      Deposit
                    </Text>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
                      {formatCurrency(tenant.deposit_amount)}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border }}>
                  <StatTile label="Paid"    value={paymentSummary.paidCount.toString()}    color={colors.success} colors={colors} />
                  <View style={{ width: 1, backgroundColor: colors.border }} />
                  <StatTile label="Partial" value={paymentSummary.partialCount.toString()} color={colors.warning} colors={colors} />
                  <View style={{ width: 1, backgroundColor: colors.border }} />
                  <StatTile label="Pending" value={paymentSummary.pendingCount.toString()} color={paymentSummary.pendingCount > 0 ? colors.danger : colors.mutedFg} colors={colors} />
                </View>
              </View>
            </Entrance>

            {/* ── Payment history ── */}
            <Entrance trigger={focusTick} delay={340}>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 10,
              }}>
                <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                  Payment history
                </Text>
                {isActive && (payments ?? []).length > 0 && (
                  <Pressable
                    onPress={() => router.push(`/(tabs)/payments/new?tenant=${tenant.slug}` as never)}
                    android_ripple={null}
                    hitSlop={6}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 4,
                      backgroundColor: colors.primary, borderRadius: 10,
                      paddingHorizontal: 10, paddingVertical: 6,
                    }}
                  >
                    <PlusIcon size={11} color="#fff" weight="bold" />
                    <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
                      Record
                    </Text>
                  </Pressable>
                )}
              </View>
              {(payments ?? []).length === 0 ? (
                <View style={{
                  backgroundColor: colors.card,
                  borderWidth: 1, borderColor: colors.border,
                  borderRadius: 12, padding: 24, alignItems: 'center',
                }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: colors.mutedBg,
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                  }}>
                    <ReceiptIcon size={20} color={colors.mutedFg} weight="duotone" />
                  </View>
                  <Text style={{
                    color: colors.foreground, fontSize: 13,
                    fontFamily: 'Inter_600SemiBold', marginBottom: 4,
                  }}>
                    No payments yet
                  </Text>
                  <Text style={{
                    color: colors.mutedFg, fontSize: 12,
                    fontFamily: 'Inter_400Regular', textAlign: 'center',
                  }}>
                    Recorded payments will appear here.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {(payments ?? []).map((p, i) => (
                    <Entrance key={p.id} delay={i * 40} trigger={focusTick}>
                      <PaymentRow payment={p} colors={colors} />
                    </Entrance>
                  ))}
                </View>
              )}
            </Entrance>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
