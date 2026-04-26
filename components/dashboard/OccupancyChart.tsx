import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { TrendUpIcon } from 'phosphor-react-native';
import { getProgressColor } from '../../lib/utils/progress-colors';
import type { AppColors } from '../../lib/theme/colors';

interface OccupancyChartProps {
  occupied: number;
  vacant: number;
  colors: AppColors;
}

/** Donut ring showing occupancy %, with a legend underneath. */
export function OccupancyChart({ occupied, vacant, colors }: OccupancyChartProps) {
  const total         = occupied + vacant;
  const pct           = total > 0 ? (occupied / total) * 100 : 0;
  const ringColor     = getProgressColor(pct, colors);
  const circumference = 2 * Math.PI * 40;
  const offset        = circumference - (pct / 100) * circumference;

  const goToProperties = () => router.push('/(tabs)/properties');

  // Empty state — no slots tracked yet
  if (total === 0) {
    return (
      <Pressable
        onPress={goToProperties}
        android_ripple={null}
        style={{
          backgroundColor: colors.card,
          borderWidth: 1, borderColor: colors.border,
          borderRadius: 12, padding: 16,
        }}
      >
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 14 }}>
          Occupancy
        </Text>
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: colors.mutedBg,
            alignItems: 'center', justifyContent: 'center', marginBottom: 10,
          }}>
            <TrendUpIcon size={20} color={colors.mutedFg} weight="duotone" />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4 }}>
            No slots yet
          </Text>
          <Text style={{
            color: colors.mutedFg, fontSize: 12,
            fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18,
          }}>
            Add floors and rooms to start tracking occupancy.
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={goToProperties}
      android_ripple={null}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16,
      }}
    >
      <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 16 }}>
        Occupancy
      </Text>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 120, height: 120 }}>
          <Svg width={120} height={120} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx="50" cy="50" r="40" fill="none"
              stroke={colors.mutedBg} strokeWidth="8" />
            <Circle cx="50" cy="50" r="40" fill="none"
              stroke={ringColor} strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round" />
          </Svg>
          <View style={{
            position: 'absolute', inset: 0,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: colors.foreground, fontSize: 22, fontFamily: 'Inter_600SemiBold' }}>
              {Math.round(pct)}%
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: ringColor }} />
            <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
              {occupied} Occupied
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.mutedBg, borderWidth: 1, borderColor: colors.border }} />
            <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
              {vacant} Vacant
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
