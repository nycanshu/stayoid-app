import { View, Text, Pressable, Linking } from 'react-native';
import { router } from 'expo-router';
import {
  PhoneIcon, MapPinIcon, WarningCircleIcon,
  CurrencyCircleDollarIcon, PencilIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { useActionSheet } from '../ui/ActionSheet';
import { getInitials, formatCurrency } from '../../lib/utils/formatters';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Tenant } from '../../types/tenant';

export function TenantCard({ tenant }: { tenant: Tenant }) {
  const isActive  = tenant.is_active;
  const hasUnpaid = !!tenant.has_unpaid && isActive;
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { show: showActionSheet } = useActionSheet();

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
          onPress: () => router.push(`/(tabs)/payments/new?tenant=${tenant.slug}` as never),
        }] : []),
        ...(tenant.phone ? [{
          label: `Call ${tenant.phone}`,
          Icon: PhoneIcon,
          iconBg: palette.infoBg,
          iconColor: palette.info,
          onPress: () => Linking.openURL(`tel:${tenant.phone}`),
        }] : []),
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
      className={cn(
        'bg-card border border-border rounded-xl p-3.5 flex-row items-center gap-3',
        hasUnpaid && 'border-l-[3px] border-l-warning',
      )}
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
