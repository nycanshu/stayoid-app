import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { PhoneIcon, MapPinIcon } from 'phosphor-react-native';
import { getInitials } from '../../lib/utils/formatters';
import type { AppColors } from '../../lib/theme/colors';
import type { Tenant } from '../../types/tenant';

export function TenantRow({ tenant, colors }: { tenant: Tenant; colors: AppColors }) {
  const hasUnpaid = !!tenant.has_unpaid;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/more/tenants/${tenant.slug}`)}
      android_ripple={null}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}
    >
      <View style={{
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.mutedBg,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
          {getInitials(tenant.name)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <Text
            numberOfLines={1}
            style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', flexShrink: 1 }}
          >
            {tenant.name}
          </Text>
          {hasUnpaid && (
            <View style={{
              backgroundColor: colors.warningBg, borderRadius: 99,
              paddingHorizontal: 6, paddingVertical: 1,
            }}>
              <Text style={{ color: colors.warning, fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>
                Unpaid
              </Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <MapPinIcon size={10} color={colors.mutedFg} />
            <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
              {tenant.unit_number} · {tenant.slot_number}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <PhoneIcon size={10} color={colors.mutedFg} />
            <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
              {tenant.phone}
            </Text>
          </View>
        </View>
      </View>
      <View style={{
        backgroundColor: colors.successBg, borderRadius: 99,
        paddingHorizontal: 8, paddingVertical: 3,
      }}>
        <Text style={{ color: colors.success, fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>
          Active
        </Text>
      </View>
    </Pressable>
  );
}
