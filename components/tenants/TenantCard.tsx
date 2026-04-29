import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  PhoneIcon, MapPinIcon, WarningCircleIcon,
  CurrencyCircleDollarIcon, PencilIcon,
  WhatsappLogoIcon, ChatTextIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { useActionSheet } from '../ui/ActionSheet';
import { useRecordPaymentSheet } from '../payments/RecordPaymentSheet';
import { getInitials, formatCurrency } from '../../lib/utils/formatters';
import { sendWhatsApp, sendSMS, callPhone } from '../../lib/utils/messaging';
import { rentReminderMessage } from '../../lib/constants/message-templates';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Tenant } from '../../types/tenant';

function TenantCardImpl({ tenant }: { tenant: Tenant }) {
  const isActive  = tenant.is_active;
  const hasUnpaid = !!tenant.has_unpaid && isActive;
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { show: showActionSheet } = useActionSheet();
  const { open: openPaymentSheet } = useRecordPaymentSheet();

  const buildMessage = () => {
    if (!hasUnpaid) return `Hi ${tenant.name},\n\n`;
    const today = new Date();
    return rentReminderMessage({
      tenantName:   tenant.name,
      amount:       tenant.monthly_rent,
      month:        today.getMonth() + 1,
      year:         today.getFullYear(),
      propertyName: tenant.property_name,
    });
  };

  const openContextMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showActionSheet({
      title: tenant.name,
      message: `${tenant.property_name} · ${tenant.unit_number} · ${tenant.slot_number}`,
      options: [
        ...(isActive ? [{
          label: 'Record Payment',
          Icon: CurrencyCircleDollarIcon,
          iconBg: palette.successBg,
          iconColor: palette.success,
          onPress: () => openPaymentSheet({ tenantSlug: tenant.slug }),
        }] : []),
        ...(tenant.phone ? [
          {
            label: hasUnpaid ? 'Send WhatsApp Reminder' : 'Send WhatsApp',
            Icon: WhatsappLogoIcon,
            iconBg: palette.successBg,
            iconColor: palette.success,
            onPress: () => sendWhatsApp(tenant.phone, buildMessage()),
          },
          {
            label: hasUnpaid ? 'Send SMS Reminder' : 'Send SMS',
            Icon: ChatTextIcon,
            iconBg: palette.infoBg,
            iconColor: palette.info,
            onPress: () => sendSMS(tenant.phone, buildMessage()),
          },
          {
            label: `Call ${tenant.phone}`,
            Icon: PhoneIcon,
            onPress: () => callPhone(tenant.phone),
          },
        ] : []),
        {
          label: 'Edit Tenant',
          Icon: PencilIcon,
          onPress: () => router.push(`/(tabs)/tenants/${tenant.slug}/edit` as never),
        },
      ],
    });
  };

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/tenants/${tenant.slug}`)}
      onLongPress={openContextMenu}
      delayLongPress={400}
      android_ripple={null}
      className="bg-card border border-border rounded-xl p-3.5 flex-row items-center gap-3"
    >
      <View
        className={cn(
          'size-10 rounded-full bg-muted items-center justify-center',
          !isActive && 'opacity-60',
        )}
      >
        <Text
          className="text-foreground text-[13px]"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {getInitials(tenant.name)}
        </Text>
      </View>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-1.5 mb-0.5">
          <Text
            numberOfLines={1}
            className={cn(
              'text-sm shrink',
              isActive ? 'text-foreground' : 'text-muted-foreground',
            )}
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {tenant.name}
          </Text>
          {hasUnpaid && (
            <View className="flex-row items-center gap-0.5 bg-warning-bg rounded-full px-1.5 py-px">
              <WarningCircleIcon size={9} color={palette.warning} weight="fill" />
              <Text
                className="text-warning text-[10px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Unpaid
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-2.5 mb-0.5">
          <View className="flex-row items-center gap-0.5 shrink">
            <MapPinIcon size={10} color={palette.mutedForeground} />
            <Text
              numberOfLines={1}
              className="text-muted-foreground text-[11px] shrink"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {tenant.property_name} · {tenant.unit_number} · {tenant.slot_number}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2.5">
          <View className="flex-row items-center gap-0.5">
            <PhoneIcon size={10} color={palette.mutedForeground} />
            <Text
              className="text-muted-foreground text-[11px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {tenant.phone}
            </Text>
          </View>
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            ·
          </Text>
          <Text
            className="text-foreground text-[11px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {formatCurrency(tenant.monthly_rent)}
            <Text
              className="text-muted-foreground"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              /mo
            </Text>
          </Text>
        </View>
      </View>

      <View className={cn('rounded-full px-2 py-0.5', isActive ? 'bg-success-bg' : 'bg-muted')}>
        <Text
          className={cn('text-[10px]', isActive ? 'text-success' : 'text-muted-foreground')}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {isActive ? 'Active' : 'Exited'}
        </Text>
      </View>
    </Pressable>
  );
}

export const TenantCard = memo(TenantCardImpl);
