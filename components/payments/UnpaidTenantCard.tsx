import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  WarningCircleIcon, PhoneIcon, UserIcon, WhatsappLogoIcon, ChatTextIcon,
} from 'phosphor-react-native';
import * as Haptics from '@/lib/utils/haptics';
import { useColorScheme } from 'nativewind';
import { useActionSheet } from '../ui/ActionSheet';
import { useRecordPaymentSheet } from './RecordPaymentSheet';
import { formatCurrency, getInitials } from '../../lib/utils/formatters';
import { sendWhatsApp, sendSMS, callPhone } from '../../lib/utils/messaging';
import { rentReminderMessage } from '../../lib/constants/message-templates';
import { THEME } from '../../lib/theme';
import type { Tenant } from '../../types/tenant';

interface UnpaidTenantCardProps {
  tenant: Tenant;
  /** Month the Payments tab is currently viewing — drives reminder copy. Defaults to today. */
  month?: number;
  year?: number;
}

function UnpaidTenantCardImpl({ tenant, month, year }: UnpaidTenantCardProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { show: showActionSheet } = useActionSheet();
  const { open: openPaymentSheet } = useRecordPaymentSheet();

  const today = new Date();
  const reminderMonth = month ?? today.getMonth() + 1;
  const reminderYear  = year  ?? today.getFullYear();

  const buildReminder = () => rentReminderMessage({
    tenantName:   tenant.name,
    amount:       tenant.monthly_rent,
    month:        reminderMonth,
    year:         reminderYear,
    propertyName: tenant.property_name,
  });

  const handleRemind = () => {
    if (!tenant.phone) return;
    Haptics.selectionAsync();
    sendWhatsApp(tenant.phone, buildReminder());
  };

  const openContextMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showActionSheet({
      title: tenant.name,
      message: `${tenant.property_name} · ${tenant.unit_number} · ${tenant.slot_number}`,
      options: [
        ...(tenant.phone ? [
          {
            label: 'Send WhatsApp Reminder',
            Icon: WhatsappLogoIcon,
            iconBg: palette.successBg,
            iconColor: palette.success,
            onPress: () => sendWhatsApp(tenant.phone, buildReminder()),
          },
          {
            label: 'Send SMS Reminder',
            Icon: ChatTextIcon,
            iconBg: palette.infoBg,
            iconColor: palette.info,
            onPress: () => sendSMS(tenant.phone, buildReminder()),
          },
          {
            label: `Call ${tenant.phone}`,
            Icon: PhoneIcon,
            onPress: () => callPhone(tenant.phone),
          },
        ] : []),
        {
          label: 'View Tenant',
          Icon: UserIcon,
          onPress: () => router.push(`/tenants/${tenant.slug}` as never),
        },
      ],
    });
  };

  return (
    <Pressable
      onPress={() => openPaymentSheet({ tenantSlug: tenant.slug })}
      onLongPress={openContextMenu}
      delayLongPress={400}
      android_ripple={null}
      className="bg-card border border-border rounded-xl p-3.5 flex-row items-center gap-3"
    >
      <View className="size-10 rounded-[10px] bg-warning-bg items-center justify-center">
        <WarningCircleIcon size={20} color={palette.warning} weight="fill" />
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-1.5 mb-0.5">
          <Text
            numberOfLines={1}
            className="text-foreground text-sm shrink"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {tenant.name}
          </Text>
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            ({getInitials(tenant.name)})
          </Text>
        </View>
        <Text
          numberOfLines={1}
          className="text-muted-foreground text-[11px] mb-0.5"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {tenant.property_name} · {tenant.unit_number} · {tenant.slot_number}
        </Text>
        <Text
          className="text-warning text-[11px]"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {formatCurrency(tenant.monthly_rent)} due
        </Text>
      </View>
      {tenant.phone && (
        <Pressable
          onPress={(e) => { e.stopPropagation(); handleRemind(); }}
          android_ripple={null}
          hitSlop={6}
          className="flex-row items-center gap-1 bg-success-bg rounded-lg px-2.5 py-1.5"
        >
          <WhatsappLogoIcon size={12} color={palette.success} weight="fill" />
          <Text
            className="text-success text-[11px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            Remind
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

export const UnpaidTenantCard = memo(UnpaidTenantCardImpl);
