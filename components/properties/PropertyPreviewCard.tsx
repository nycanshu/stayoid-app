import { View, Text } from 'react-native';
import { MapPinIcon } from 'phosphor-react-native';
import { OccupancyBar } from './OccupancyBar';
import { getPropertyTypeMeta } from '../../lib/constants/property-type-meta';
import type { AppColors } from '../../lib/theme/colors';
import type { PropertyType } from '../../types/property';

interface PropertyPreviewCardProps {
  name: string;
  propertyType: PropertyType;
  address: string;
  colors: AppColors;
  mode?: 'create' | 'edit';
}

export function PropertyPreviewCard({
  name, propertyType, address, colors, mode = 'create',
}: PropertyPreviewCardProps) {
  const meta = getPropertyTypeMeta(propertyType, colors);
  const Icon = meta.Icon;

  return (
    <View>
      <Text style={{
        color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_600SemiBold',
        letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase',
      }}>
        Preview
      </Text>

      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 14,
      }}>
        {/* Chip + name/address + type pill */}
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
              style={{
                color: name.trim() ? colors.foreground : colors.mutedFg,
                fontSize: 14, fontFamily: 'Inter_600SemiBold',
              }}
            >
              {name.trim() || 'Property name'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MapPinIcon size={11} color={colors.mutedFg} />
              <Text
                numberOfLines={1}
                style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1 }}
              >
                {address.trim() || 'Full street address'}
              </Text>
            </View>
          </View>
          <View style={{
            borderWidth: 1, borderColor: colors.border,
            borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
          }}>
            <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
              {meta.shortLabel}
            </Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />

        {/* Placeholder occupancy + rent — same as PropertyCard for empty state */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
            Occupancy
          </Text>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>—</Text>
        </View>
        <OccupancyBar occupied={0} total={0} colors={colors} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
            Rent this month
          </Text>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
            No tenants yet
          </Text>
        </View>
      </View>

      <Text style={{
        color: colors.mutedFg, fontSize: 12,
        fontFamily: 'Inter_400Regular', marginTop: 8, lineHeight: 18,
      }}>
        {mode === 'edit'
          ? 'Changes here are reflected live — they save when you submit the form.'
          : 'This is how your property will appear in the list after creation.'}
      </Text>
    </View>
  );
}
