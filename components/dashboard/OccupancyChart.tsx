import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { TrendUpIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { getProgressHex } from '../../lib/utils/progress-colors';
import { THEME } from '../../lib/theme';

interface OccupancyChartProps {
  occupied: number;
  vacant: number;
}

export function OccupancyChart({ occupied, vacant }: OccupancyChartProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = THEME[scheme];

  const total         = occupied + vacant;
  const pct           = total > 0 ? (occupied / total) * 100 : 0;
  const ringColor     = getProgressHex(pct, scheme);
  const circumference = 2 * Math.PI * 40;
  const offset        = circumference - (pct / 100) * circumference;

  const goToProperties = () => router.push('/(tabs)/properties');

  if (total === 0) {
    return (
      <Pressable
        onPress={goToProperties}
        android_ripple={null}
        className="bg-card border border-border rounded-xl p-4"
      >
        <Text
          className="text-foreground text-sm mb-3.5"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Occupancy
        </Text>
        <View className="items-center py-3">
          <View className="size-11 rounded-full bg-muted items-center justify-center mb-2.5">
            <TrendUpIcon size={20} color={palette.mutedForeground} weight="duotone" />
          </View>
          <Text
            className="text-foreground text-[13px] mb-1"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            No slots yet
          </Text>
          <Text
            className="text-muted-foreground text-xs text-center leading-[18px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
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
      className="bg-card border border-border rounded-xl p-4"
    >
      <Text
        className="text-foreground text-sm mb-4"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        Occupancy
      </Text>
      <View className="items-center">
        <View style={{ width: 120, height: 120 }}>
          <Svg width={120} height={120} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx="50" cy="50" r="40" fill="none"
              stroke={palette.muted} strokeWidth="8" />
            <Circle cx="50" cy="50" r="40" fill="none"
              stroke={ringColor} strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round" />
          </Svg>
          <View
            style={{ position: 'absolute', inset: 0 }}
            className="items-center justify-center"
          >
            <Text
              className="text-foreground text-[22px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {Math.round(pct)}%
            </Text>
          </View>
        </View>
        <View className="flex-row gap-5 mt-3.5">
          <View className="flex-row items-center gap-1.5">
            <View
              style={{ backgroundColor: ringColor }}
              className="size-2.5 rounded-full"
            />
            <Text
              className="text-muted-foreground text-xs"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {occupied} Occupied
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="size-2.5 rounded-full bg-muted border border-border" />
            <Text
              className="text-muted-foreground text-xs"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {vacant} Vacant
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
