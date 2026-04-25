import React, { useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withDelay, withTiming, withSpring,
} from 'react-native-reanimated';

interface EntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  /** Change this value to replay the animation (e.g. a focus tick counter). */
  trigger?: unknown;
  style?: any;
}

/**
 * Fades + slides children in on mount. Pass a changing `trigger` prop
 * (e.g. a focus counter) to replay the animation each time.
 * Mirror of the website's FadeIn / PageTransition / StaggerItem.
 */
export function Entrance({
  children,
  delay = 0,
  duration = 460,
  direction = 'up',
  distance = 18,
  trigger,
  style,
}: EntranceProps) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
  const tx = useSharedValue(direction === 'left' ? distance : direction === 'right' ? -distance : 0);

  useEffect(() => {
    opacity.value = 0;
    ty.value = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
    tx.value = direction === 'left' ? distance : direction === 'right' ? -distance : 0;

    opacity.value = withDelay(delay, withTiming(1, { duration }));
    if (direction !== 'none') {
      ty.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 100 }));
      tx.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 100 }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }, { translateX: tx.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}
