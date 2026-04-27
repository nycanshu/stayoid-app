import { View, Text } from 'react-native';
import { MapPinIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { OccupancyBar } from './OccupancyBar';
import { getPropertyTypeMeta } from '../../lib/constants/property-type-meta';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { PropertyType } from '../../types/property';

interface PropertyPreviewCardProps {
  name: string;
  propertyType: PropertyType;
  address: string;
  mode?: 'create' | 'edit';
}

export function PropertyPreviewCard({
  name, propertyType, address, mode = 'create',
}: PropertyPreviewCardProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const meta = getPropertyTypeMeta(propertyType, palette);
  const Icon = meta.Icon;

  return (
    <View>
      <Text
        className="text-muted-foreground text-[11px] mb-2 uppercase tracking-[1px]"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        Preview
      </Text>

      <View className="bg-card border border-border rounded-xl p-3.5">
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
              className={cn(
                'text-sm',
                name.trim() ? 'text-foreground' : 'text-muted-foreground',
              )}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {name.trim() || 'Property name'}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <MapPinIcon size={11} color={palette.mutedForeground} />
              <Text
                numberOfLines={1}
                className="text-muted-foreground text-[11px] flex-1"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {address.trim() || 'Full street address'}
              </Text>
            </View>
          </View>
          <View className="border border-border rounded-full px-2 py-0.5">
            <Text
              className="text-muted-foreground text-[11px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {meta.shortLabel}
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
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            —
          </Text>
        </View>
        <OccupancyBar occupied={0} total={0} />

        <View className="flex-row justify-between items-center mt-2.5">
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Rent this month
          </Text>
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            No tenants yet
          </Text>
        </View>
      </View>

      <Text
        className="text-muted-foreground text-xs mt-2 leading-[18px]"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {mode === 'edit'
          ? 'Changes here are reflected live — they save when you submit the form.'
          : 'This is how your property will appear in the list after creation.'}
      </Text>
    </View>
  );
}
