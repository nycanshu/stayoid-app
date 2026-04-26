import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ArrowRightIcon, BuildingsIcon } from 'phosphor-react-native';
import { useMemo } from 'react';
import { useProperties } from '../../lib/hooks/use-properties';
import { formatCurrency } from '../../lib/utils/formatters';
import { getProgressColor } from '../../lib/utils/progress-colors';
import type { AppColors } from '../../lib/theme/colors';
import type { DashboardProperty } from '../../types/property';

interface PropertyOverviewListProps {
  properties: DashboardProperty[];
  colors: AppColors;
}

/** "Your Properties" — list of property rows with collected rent + occupancy bar.
 *  Each row routes to the property detail using a slug looked up from useProperties. */
export function PropertyOverviewList({ properties, colors }: PropertyOverviewListProps) {
  const { data: fullProperties } = useProperties();

  // Build id → slug map so we can navigate from dashboard rows
  const slugById = useMemo(() => {
    const m = new Map<string, string>();
    (fullProperties ?? []).forEach((p) => m.set(p.id, p.slug));
    return m;
  }, [fullProperties]);

  // Empty state
  if (properties.length === 0) {
    return (
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16,
      }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 14 }}>
          Your Properties
        </Text>
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: colors.mutedBg,
            alignItems: 'center', justifyContent: 'center', marginBottom: 10,
          }}>
            <BuildingsIcon size={20} color={colors.mutedFg} weight="duotone" />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4 }}>
            No properties yet
          </Text>
          <Text style={{
            color: colors.mutedFg, fontSize: 12,
            fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18, marginBottom: 14,
          }}>
            Add your first property to start managing rentals.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/properties/new')}
            android_ripple={null}
            style={{
              backgroundColor: colors.primary, borderRadius: 10,
              paddingHorizontal: 14, paddingVertical: 9,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
              Add Property
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, overflow: 'hidden',
    }}>
      <View style={{ padding: 16, paddingBottom: 10 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
          Your Properties
        </Text>
      </View>

      {properties.map((p) => {
        const pct = p.total_slots > 0 ? (p.occupied / p.total_slots) * 100 : 0;
        const barColor = getProgressColor(pct, colors);
        const slug = slugById.get(p.id);
        const collected = Number(p.collected_rent);
        return (
          <Pressable
            key={p.id}
            onPress={slug ? () => router.push(`/(tabs)/properties/${slug}`) : undefined}
            disabled={!slug}
            android_ripple={null}
            style={{
              paddingHorizontal: 16, paddingVertical: 12,
              borderTopWidth: 1, borderTopColor: colors.border,
            }}
          >
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 6,
            }}>
              <Text
                numberOfLines={1}
                style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1 }}
              >
                {p.name}
              </Text>
              <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                {formatCurrency(collected)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                flex: 1, height: 4,
                backgroundColor: colors.mutedBg,
                borderRadius: 99, overflow: 'hidden',
              }}>
                <View style={{
                  height: '100%', width: `${pct}%`,
                  backgroundColor: barColor, borderRadius: 99,
                }} />
              </View>
              <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                {p.occupied}/{p.total_slots}
              </Text>
            </View>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => router.push('/(tabs)/properties')}
        android_ripple={null}
        style={{
          padding: 14,
          flexDirection: 'row', alignItems: 'center', gap: 4,
          borderTopWidth: 1, borderTopColor: colors.border,
        }}
      >
        <Text style={{ color: colors.mutedFg, fontSize: 13, fontFamily: 'Inter_400Regular' }}>
          View all properties
        </Text>
        <ArrowRightIcon size={13} color={colors.mutedFg} />
      </Pressable>
    </View>
  );
}
