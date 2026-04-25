import { useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import type { ViewStyle, StyleProp } from 'react-native';
import { useColors } from '../../lib/hooks/use-colors';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width, height = 12, radius = 8, style }: SkeletonProps) {
  const colors  = useColors();
  const shimmer = useSharedValue(0.4);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5,  { duration: 650, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: shimmer.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.mutedBg },
        shimmerStyle,
        style,
      ]}
    />
  );
}
