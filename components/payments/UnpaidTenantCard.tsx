import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { WarningCircleIcon, CaretRightIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { formatCurrency, getInitials } from '../../lib/utils/formatters';
import { THEME } from '../../lib/theme';
import type { Tenant } from '../../types/tenant';

export function UnpaidTenantCard({ tenant }: { tenant: Tenant }) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/payments/new?tenant=${tenant.slug}` as never)}
      android_ripple={null}
      className="bg-card border border-border border-l-[3px] border-l-warning rounded-xl p-3.5 flex-row items-center gap-3"
    >
      <View className="size-10 rounded-[10px] bg-warning-bg items-center justify-center">
        <WarningCircleIcon size={20} color={palette.warning} weight="fill" />
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
      <CaretRightIcon size={14} color={palette.mutedForeground} />
    </Pressable>
  );
}
