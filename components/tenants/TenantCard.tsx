import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { PhoneIcon, MapPinIcon, WarningCircleIcon } from 'phosphor-react-native';
import { getInitials, formatCurrency } from '../../lib/utils/formatters';
import type { AppColors } from '../../lib/theme/colors';
import type { Tenant } from '../../types/tenant';

export function TenantCard({ tenant, colors }: { tenant: Tenant; colors: AppColors }) {
  const isActive  = tenant.is_active;
  const hasUnpaid = !!tenant.has_unpaid && isActive;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/more/tenants/${tenant.slug}`)}
      android_ripple={null}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderLeftWidth: hasUnpaid ? 3 : 1,
        borderLeftColor: hasUnpaid ? colors.warning : colors.border,
        borderRadius: 12, padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}
    >
      <View style={{
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: isActive ? colors.mutedBg : colors.mutedBg,
        alignItems: 'center', justifyContent: 'center',
        opacity: isActive ? 1 : 0.6,
      }}>
        <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
          {getInitials(tenant.name)}
        </Text>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <Text
            numberOfLines={1}
            style={{
              color: isActive ? colors.foreground : colors.mutedFg,
              fontSize: 14, fontFamily: 'Inter_600SemiBold', flexShrink: 1,
            }}
          >
            {tenant.name}
          </Text>
          {hasUnpaid && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 3,
              backgroundColor: colors.warningBg, borderRadius: 99,
              paddingHorizontal: 6, paddingVertical: 1,
            }}>
              <WarningCircleIcon size={9} color={colors.warning} weight="fill" />
              <Text style={{ color: colors.warning, fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>
                Unpaid
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 1 }}>
            <MapPinIcon size={10} color={colors.mutedFg} />
            <Text
              numberOfLines={1}
              style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', flexShrink: 1 }}
            >
              {tenant.property_name} · {tenant.unit_number} · {tenant.slot_number}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <PhoneIcon size={10} color={colors.mutedFg} />
            <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
              {tenant.phone}
            </Text>
          </View>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
            ·
          </Text>
          <Text style={{ color: colors.foreground, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
            {formatCurrency(tenant.monthly_rent)}
            <Text style={{ color: colors.mutedFg, fontFamily: 'Inter_400Regular' }}>/mo</Text>
          </Text>
        </View>
      </View>

      <View style={{
        backgroundColor: isActive ? colors.successBg : colors.mutedBg,
        borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3,
      }}>
        <Text style={{
          color: isActive ? colors.success : colors.mutedFg,
          fontSize: 10, fontFamily: 'Inter_600SemiBold',
        }}>
          {isActive ? 'Active' : 'Exited'}
        </Text>
      </View>
    </Pressable>
  );
}
