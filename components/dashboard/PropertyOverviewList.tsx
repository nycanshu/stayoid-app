import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ArrowRightIcon, BuildingsIcon } from 'phosphor-react-native';
import { useMemo } from 'react';
import { useColorScheme } from 'nativewind';
import { useProperties } from '../../lib/hooks/use-properties';
import { formatCurrency } from '../../lib/utils/formatters';
import { getProgressHex } from '../../lib/utils/progress-colors';
import { THEME } from '../../lib/theme';
import type { DashboardProperty } from '../../types/property';

interface PropertyOverviewListProps {
  properties: DashboardProperty[];
}

export function PropertyOverviewList({ properties }: PropertyOverviewListProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = THEME[scheme];
  const { data: fullProperties } = useProperties();

  const slugById = useMemo(() => {
    const m = new Map<string, string>();
    (fullProperties ?? []).forEach((p) => m.set(p.id, p.slug));
    return m;
  }, [fullProperties]);

  if (properties.length === 0) {
    return (
      <View className="bg-card border border-border rounded-xl p-4">
        <Text
          className="text-foreground text-sm mb-3.5"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Your Properties
        </Text>
        <View className="items-center py-4">
          <View className="size-11 rounded-full bg-muted items-center justify-center mb-2.5">
            <BuildingsIcon size={20} color={palette.mutedForeground} weight="duotone" />
          </View>
          <Text
            className="text-foreground text-[13px] mb-1"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            No properties yet
          </Text>
          <Text
            className="text-muted-foreground text-xs text-center leading-[18px] mb-3.5"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Add your first property to start managing rentals.
          </Text>
          <Pressable
            onPress={() => router.push('/properties/new' as never)}
            android_ripple={null}
            className="bg-primary rounded-[10px] px-3.5 py-2"
          >
            <Text
              className="text-white text-[13px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Add Property
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-card border border-border rounded-xl overflow-hidden">
      <View className="p-4 pb-2.5">
        <Text
          className="text-foreground text-sm"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Your Properties
        </Text>
      </View>

      {properties.map((p) => {
        const pct = p.total_slots > 0 ? (p.occupied / p.total_slots) * 100 : 0;
        const barHex = getProgressHex(pct, scheme);
        const slug = slugById.get(p.id);
        const collected = Number(p.collected_rent);
        return (
          <Pressable
            key={p.id}
            onPress={slug ? () => router.push(`/properties/${slug}`) : undefined}
            disabled={!slug}
            android_ripple={null}
            className="px-4 py-3 border-t border-border"
          >
            <View className="flex-row items-center justify-between mb-1.5">
              <Text
                numberOfLines={1}
                className="text-foreground text-[13px] flex-1"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {p.name}
              </Text>
              <Text
                className="text-foreground text-[13px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {formatCurrency(collected)}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <View
                  style={{ width: `${pct}%`, backgroundColor: barHex }}
                  className="h-full rounded-full"
                />
              </View>
              <Text
                className="text-muted-foreground text-[11px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {p.occupied}/{p.total_slots}
              </Text>
            </View>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => router.push('/properties')}
        android_ripple={null}
        className="p-3.5 flex-row items-center gap-1 border-t border-border"
      >
        <Text
          className="text-muted-foreground text-[13px]"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          View all properties
        </Text>
        <ArrowRightIcon size={13} color={palette.mutedForeground} />
      </Pressable>
    </View>
  );
}
