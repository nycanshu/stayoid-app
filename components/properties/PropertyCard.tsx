import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MapPinIcon, HouseIcon, UsersIcon } from 'phosphor-react-native';
import { OccupancyBar } from './OccupancyBar';
import { formatCurrency } from '../../lib/utils/formatters';
import type { AppColors } from '../../lib/theme/colors';
import type { Property, DashboardProperty } from '../../types/property';

// ── Type meta — pulls from theme tokens, no hardcoded hex ─────────────────────
function getTypeMeta(type: string, colors: AppColors) {
  if (type === 'FLAT') {
    return { label: 'Flat', Icon: HouseIcon, iconColor: colors.info,    iconBg: colors.infoBg };
  }
  if (type === 'PG') {
    return { label: 'PG',   Icon: UsersIcon, iconColor: colors.success, iconBg: colors.successBg };
  }
  return   { label: type,   Icon: HouseIcon, iconColor: colors.mutedFg, iconBg: colors.mutedBg };
}

interface PropertyCardProps {
  property: Property;
  stats?: DashboardProperty;
  colors: AppColors;
}

export function PropertyCard({ property, stats, colors }: PropertyCardProps) {
  const meta      = getTypeMeta(property.property_type, colors);
  const Icon      = meta.Icon;
  const collected = stats ? Number(stats.collected_rent) : 0;
  const expected  = stats ? Number(stats.expected_rent)  : 0;
  const hasStats  = !!stats;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/properties/${property.slug}`)}
      android_ripple={null}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 14,
      }}
    >
      {/* ── Top: colored icon chip (matches dashboard StatCard) ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <View style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: meta.iconBg,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={meta.iconColor} weight="fill" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}
          >
            {property.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MapPinIcon size={11} color={colors.mutedFg} />
            <Text
              numberOfLines={1}
              style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1 }}
            >
              {property.address}
            </Text>
          </View>
        </View>
        <View style={{
          borderWidth: 1, borderColor: colors.border,
          borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
        }}>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
            {meta.label}
          </Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />

      {/* ── Occupancy ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
          Occupancy
        </Text>
        {hasStats ? (
          <Text style={{ color: colors.foreground, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
            {stats!.occupied}/{stats!.total_slots} slots
          </Text>
        ) : (
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>—</Text>
        )}
      </View>
      <OccupancyBar occupied={stats?.occupied ?? 0} total={stats?.total_slots ?? 0} colors={colors} />

      {/* ── Rent this month ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
          Rent this month
        </Text>
        {hasStats && expected > 0 ? (
          <Text style={{ color: colors.foreground, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
            {formatCurrency(collected)}
            <Text style={{ color: colors.mutedFg, fontFamily: 'Inter_400Regular' }}>
              {' / '}{formatCurrency(expected)}
            </Text>
          </Text>
        ) : (
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
            No tenants yet
          </Text>
        )}
      </View>
    </Pressable>
  );
}
