import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MapPinIcon, HouseIcon, UsersIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { OccupancyBar } from './OccupancyBar';
import { formatCurrency } from '../../lib/utils/formatters';
import { THEME } from '../../lib/theme';
import type { Property, DashboardProperty } from '../../types/property';

function getTypeMeta(type: string, palette: typeof THEME['light']) {
  if (type === 'FLAT') {
    return { label: 'Flat', Icon: HouseIcon, iconColor: palette.info,    iconBg: palette.infoBg };
  }
  if (type === 'PG') {
    return { label: 'PG',   Icon: UsersIcon, iconColor: palette.success, iconBg: palette.successBg };
  }
  return   { label: type,   Icon: HouseIcon, iconColor: palette.mutedForeground, iconBg: palette.muted };
}

interface PropertyCardProps {
  property: Property;
  stats?: DashboardProperty;
}

function PropertyCardImpl({ property, stats }: PropertyCardProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const meta = getTypeMeta(property.property_type, palette);
  const Icon = meta.Icon;
  const collected = stats ? Number(stats.collected_rent) : 0;
  const expected  = stats ? Number(stats.expected_rent)  : 0;
  const hasStats  = !!stats;

  return (
    <Pressable
      onPress={() => router.push(`/properties/${property.slug}`)}
      android_ripple={null}
      className="bg-card border border-border rounded-xl p-3.5"
    >
      <View className="flex-row items-center gap-3 mb-3">
        <View
          style={{ backgroundColor: meta.iconBg }}
          className="size-9 rounded-[10px] items-center justify-center"
        >
          <Icon size={18} color={meta.iconColor} weight="fill" />
        </View>
        <View className="flex-1 min-w-0">
          <Text
            numberOfLines={1}
            className="text-foreground text-sm"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {property.name}
          </Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <MapPinIcon size={11} color={palette.mutedForeground} />
            <Text
              numberOfLines={1}
              className="text-muted-foreground text-[11px] flex-1"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {property.address}
            </Text>
          </View>
        </View>
        <View className="border border-border rounded-full px-2 py-0.5">
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {meta.label}
          </Text>
        </View>
      </View>

      <View className="h-px bg-border mb-3" />

      <View className="flex-row justify-between items-center mb-1.5">
        <Text
          className="text-muted-foreground text-[11px]"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Occupancy
        </Text>
        {hasStats ? (
          <Text
            className="text-foreground text-[11px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {stats!.occupied}/{stats!.total_slots} slots
          </Text>
        ) : (
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            —
          </Text>
        )}
      </View>
      <OccupancyBar occupied={stats?.occupied ?? 0} total={stats?.total_slots ?? 0} />

      <View className="flex-row justify-between items-center mt-2.5">
        <Text
          className="text-muted-foreground text-[11px]"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Rent this month
        </Text>
        {hasStats && expected > 0 ? (
          <Text
            className="text-foreground text-[11px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {formatCurrency(collected)}
            <Text
              className="text-muted-foreground"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {' / '}{formatCurrency(expected)}
            </Text>
          </Text>
        ) : (
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            No tenants yet
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export const PropertyCard = memo(PropertyCardImpl);
