import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { BedIcon, MapPinIcon, PlusIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { formatCurrency, getInitials } from '../../lib/utils/formatters';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Slot } from '../../types/property';

interface SlotListRowProps {
  slot: Slot;
}

export function SlotListRow({ slot }: SlotListRowProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const occupied = slot.is_occupied;
  const tenant = slot.active_tenant;
  const rent = Number(slot.monthly_rent);

  const goToTenant = () => {
    if (tenant?.slug) router.push(`/(tabs)/tenants/${tenant.slug}`);
  };
  const assignTenant = () => {
    router.push(`/(tabs)/tenants/new?property=${slot.property_slug}` as never);
  };

  return (
    <Pressable
      onPress={occupied ? goToTenant : assignTenant}
      android_ripple={null}
      className={cn(
        'bg-card border border-border rounded-xl p-3.5',
        !occupied && 'border-l-[3px] border-l-primary',
      )}
    >
      <View className="flex-row items-start gap-3">
        <View
          className={cn(
            'size-11 rounded-[10px] items-center justify-center',
            occupied ? 'bg-muted' : 'bg-primary-bg',
          )}
        >
          {occupied && tenant ? (
            <Text
              className="text-foreground text-[13px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {getInitials(tenant.name)}
            </Text>
          ) : (
            <BedIcon size={18} color={palette.primary} weight="duotone" />
          )}
        </View>

        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <Text
              numberOfLines={1}
              className="text-foreground text-sm shrink"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {occupied && tenant ? tenant.name : `Slot ${slot.slot_number}`}
            </Text>
            <View
              className={cn(
                'rounded-full px-2 py-px',
                occupied ? 'bg-success-bg' : 'bg-primary-bg',
              )}
            >
              <Text
                className={cn(
                  'text-[10px]',
                  occupied ? 'text-success' : 'text-primary',
                )}
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {occupied ? 'Occupied' : 'Vacant'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1 mb-0.5">
            <MapPinIcon size={11} color={palette.mutedForeground} />
            <Text
              numberOfLines={1}
              className="text-muted-foreground text-[11px] flex-1"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {slot.property_name} · Unit {slot.unit_number} · Slot {slot.slot_number}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-1">
            <Text
              className="text-foreground text-[13px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {rent > 0 ? formatCurrency(rent) : 'Rent not set'}
              {rent > 0 && (
                <Text
                  className="text-muted-foreground text-[11px]"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {' / month'}
                </Text>
              )}
            </Text>
            {!occupied && (
              <View className="flex-row items-center gap-1 bg-primary rounded-lg px-2.5 py-1">
                <PlusIcon size={11} color="#fff" weight="bold" />
                <Text
                  className="text-white text-[11px]"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  Assign
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
