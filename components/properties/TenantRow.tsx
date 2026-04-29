import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  PhoneIcon, MapPinIcon, CurrencyCircleDollarIcon, PencilIcon,
  WhatsappLogoIcon, ChatTextIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { useActionSheet } from '../ui/ActionSheet';
import { useRecordPaymentSheet } from '../payments/RecordPaymentSheet';
import { getInitials } from '../../lib/utils/formatters';
import { sendWhatsApp, sendSMS, callPhone } from '../../lib/utils/messaging';
import { rentReminderMessage } from '../../lib/constants/message-templates';
import { THEME } from '../../lib/theme';
import type { Tenant } from '../../types/tenant';

export function TenantRow({ tenant }: { tenant: Tenant }) {
  const hasUnpaid = !!tenant.has_unpaid;
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
      message: tenant.phone ? `${tenant.unit_number} · ${tenant.slot_number}` : undefined,
      options: [
        {
          label: 'Record Payment',
          Icon: CurrencyCircleDollarIcon,
          iconBg: palette.successBg,
          iconColor: palette.success,
          onPress: () => openPaymentSheet({ tenantSlug: tenant.slug }),
        },
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
          onPress: () => router.push(`/tenants/${tenant.slug}/edit` as never),
        },
      ],
    });
  };

  return (
    <Pressable
      onPress={() => router.push(`/tenants/${tenant.slug}`)}
      onLongPress={openContextMenu}
      delayLongPress={350}
      android_ripple={null}
      className="bg-card border border-border rounded-xl p-3.5 flex-row items-center gap-3"
    >
      <View className="size-10 rounded-full bg-muted items-center justify-center">
        <Text
          className="text-foreground text-[13px]"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {getInitials(tenant.name)}
        </Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-0.5">
          <Text
            numberOfLines={1}
            className="text-foreground text-sm shrink"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {tenant.name}
          </Text>
          {hasUnpaid && (
            <View className="bg-warning-bg rounded-full px-1.5 py-px">
              <Text
                className="text-warning text-[10px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Unpaid
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center gap-2.5">
          <View className="flex-row items-center gap-0.5">
            <MapPinIcon size={10} color={palette.mutedForeground} />
            <Text
              className="text-muted-foreground text-[11px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {tenant.unit_number} · {tenant.slot_number}
            </Text>
          </View>
          <View className="flex-row items-center gap-0.5">
            <PhoneIcon size={10} color={palette.mutedForeground} />
            <Text
              className="text-muted-foreground text-[11px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {tenant.phone}
            </Text>
          </View>
        </View>
      </View>
      <View className="bg-success-bg rounded-full px-2 py-0.5">
        <Text
          className="text-success text-[10px]"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Active
        </Text>
      </View>
    </Pressable>
  );
}
