import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  BedIcon, MapPinIcon, PlusIcon, LockSimpleIcon,
  PhoneIcon, CurrencyCircleDollarIcon, UserIcon,
  WhatsappLogoIcon, ChatTextIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { useActionSheet } from '../ui/ActionSheet';
import { useRecordPaymentSheet } from '../payments/RecordPaymentSheet';
import { formatCurrency, getInitials } from '../../lib/utils/formatters';
import { sendWhatsApp, sendSMS, callPhone } from '../../lib/utils/messaging';
import { getPropertyTypeLabels } from '../../lib/constants/property-type-meta';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Slot } from '../../types/property';

interface SlotListRowProps {
  slot: Slot;
}

function SlotListRowImpl({ slot }: SlotListRowProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const labels = getPropertyTypeLabels(slot.property_type);
  const occupied = slot.is_occupied;
  const tenant = slot.active_tenant;
  const rent = Number(slot.monthly_rent);
  const { show: showActionSheet } = useActionSheet();
  const { open: openPaymentSheet } = useRecordPaymentSheet();

  const goToTenant = () => {
    if (tenant?.slug) router.push(`/tenants/${tenant.slug}`);
  };
  const assignTenant = () => {
    router.push(`/tenants/new?property=${slot.property_slug}` as never);
  };

  const openContextMenu = () => {
    if (!occupied || !tenant) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showActionSheet({
      title: tenant.name,
      message: `${slot.property_name} · ${labels.unitLabel} ${slot.unit_number} · ${labels.slotLabel} ${slot.slot_number}`,
      options: [
        {
          label: 'View Tenant',
          Icon: UserIcon,
          onPress: () => router.push(`/tenants/${tenant.slug}` as never),
        },
        {
          label: 'Record Payment',
          Icon: CurrencyCircleDollarIcon,
          iconBg: palette.successBg,
          iconColor: palette.success,
          onPress: () => openPaymentSheet({ tenantSlug: tenant.slug }),
        },
        ...(tenant.phone ? [
          {
            label: 'Send WhatsApp',
            Icon: WhatsappLogoIcon,
            iconBg: palette.successBg,
            iconColor: palette.success,
            onPress: () => sendWhatsApp(tenant.phone!, `Hi ${tenant.name},\n\n`),
          },
          {
            label: 'Send SMS',
            Icon: ChatTextIcon,
            iconBg: palette.infoBg,
            iconColor: palette.info,
            onPress: () => sendSMS(tenant.phone!, `Hi ${tenant.name},\n\n`),
          },
          {
            label: `Call ${tenant.phone}`,
            Icon: PhoneIcon,
            onPress: () => callPhone(tenant.phone!),
          },
        ] : []),
      ],
    });
  };

  return (
    <Pressable
      onPress={occupied ? goToTenant : assignTenant}
      onLongPress={occupied ? openContextMenu : undefined}
      delayLongPress={350}
      android_ripple={null}
      className="bg-card border border-border rounded-xl p-3.5"
    >
      <View className="flex-row items-start gap-3">
        <View
          className={cn(
            'size-11 rounded-[10px] items-center justify-center',
            occupied ? 'bg-muted' : 'bg-primary-bg',
          )}
        >
          {occupied && tenant ? (
            <Text
              className="text-foreground text-[13px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {getInitials(tenant.name)}
            </Text>
          ) : (
            <BedIcon size={18} color={palette.primary} weight="duotone" />
          )}
        </View>

        <View className="flex-1 min-w-0">
          <Text
            numberOfLines={1}
            className="text-foreground text-sm mb-0.5"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {occupied && tenant ? tenant.name : `${labels.slotLabel} ${slot.slot_number}`}
          </Text>

          <View className="flex-row items-center gap-1 mb-0.5">
            <MapPinIcon size={11} color={palette.mutedForeground} />
            <Text
              numberOfLines={1}
              className="text-muted-foreground text-[11px] flex-1"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {slot.property_name} · {labels.unitLabel} {slot.unit_number} · {labels.slotLabel} {slot.slot_number}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-1">
            <Text
              className="text-foreground text-[13px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {rent > 0 ? formatCurrency(rent) : 'Rent not set'}
              {rent > 0 && (
                <Text
                  className="text-muted-foreground text-[11px]"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {' / month'}
                </Text>
              )}
            </Text>
            {occupied ? (
              <View className="flex-row items-center gap-1 bg-warning-bg rounded-lg px-2.5 py-1">
                <LockSimpleIcon size={11} color={palette.warning} weight="fill" />
                <Text
                  className="text-warning text-[11px]"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  Occupied
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1 bg-primary rounded-lg px-2.5 py-1">
                <PlusIcon size={11} color="#fff" weight="bold" />
                <Text
                  className="text-white text-[11px]"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  Assign
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export const SlotListRow = memo(SlotListRowImpl);
