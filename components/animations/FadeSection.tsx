import React, { useRef, useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedReaction,
  withSpring, runOnJS,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import { useScrollY } from './scroll-context';

const SCREEN_H = Dimensions.get('window').height;

interface FadeSectionProps {
  children: React.ReactNode;
  /**
   * Distance from the bottom of the viewport at which the fade triggers.
   * Higher = earlier. Default 80.
   */
  threshold?: number;
  distance?: number;
  style?: any;
}

/**
 * Fades + slides in when scrolled into view.
 * Place inside <AnimatedScrollView>. Mirror of the website's whileInView / FadeSection.
 */
export function FadeSection({
  children,
  threshold = 80,
  distance = 20,
  style,
}: FadeSectionProps) {
  const scrollY = useScrollY();
  const layoutY = useSharedValue(9999);
  const opacity = useSharedValue(0);
  const ty = useSharedValue(distance);
  const hasAnimated = useRef(false);

  // If there's no scroll context, show content immediately
  useEffect(() => {
    if (!scrollY) {
      opacity.value = 1;
      ty.value = 0;
      hasAnimated.current = true;
    }
  }, []);

  const triggerAnimation = () => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    opacity.value = withSpring(1, { damping: 16, stiffness: 90 });
    ty.value = withSpring(0, { damping: 16, stiffness: 90 });
  };

  // Fires on the UI thread whenever scrollY or layoutY changes.
  // When element crosses the viewport bottom edge, trigger a one-shot spring.
  useAnimatedReaction(
    () => {
      if (!scrollY) return false;
      return scrollY.value + SCREEN_H > layoutY.value + threshold;
    },
    (isVisible, wasVisible) => {
      if (isVisible && !wasVisible) {
        runOnJS(triggerAnimation)();
      }
    },
  );

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View
      onLayout={(e) => {
        layoutY.value = e.nativeEvent.layout.y;
      }}
      style={[animStyle, style]}
    >
      {children}
    </Animated.View>
  );
}
