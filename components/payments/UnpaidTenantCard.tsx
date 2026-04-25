import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { WarningCircleIcon, CaretRightIcon } from 'phosphor-react-native';
import { formatCurrency, getInitials } from '../../lib/utils/formatters';
import type { AppColors } from '../../lib/theme/colors';
import type { Tenant } from '../../types/tenant';

export function UnpaidTenantCard({ tenant, colors }: { tenant: Tenant; colors: AppColors }) {
  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/payments/new?tenant=${tenant.slug}` as never)}
      android_ripple={null}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderLeftWidth: 3, borderLeftColor: colors.warning,
        borderRadius: 12, padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}
    >
      <View style={{
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: colors.warningBg,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <WarningCircleIcon size={20} color={colors.warning} weight="fill" />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <Text
            numberOfLines={1}
            style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', flexShrink: 1 }}
          >
            {tenant.name}
          </Text>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
            ({getInitials(tenant.name)})
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 }}
        >
          {tenant.property_name} · {tenant.unit_number} · {tenant.slot_number}
        </Text>
        <Text style={{ color: colors.warning, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
          {formatCurrency(tenant.monthly_rent)} due
        </Text>
      </View>
      <CaretRightIcon size={14} color={colors.mutedFg} />
    </Pressable>
  );
}
