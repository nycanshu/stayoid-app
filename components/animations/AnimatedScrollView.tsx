import React, { forwardRef } from 'react';
import { ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import type { ScrollViewProps } from 'react-native';
import { ScrollYContext } from './scroll-context';

type Props = ScrollViewProps & { children?: React.ReactNode };

const ReanimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export const AnimatedScrollView = forwardRef<ScrollView, Props>(
  function AnimatedScrollView({ children, onScroll, ...props }, ref) {
    const scrollY = useSharedValue(0);

    const handleScroll = useAnimatedScrollHandler({
      onScroll: (e) => {
        scrollY.value = e.contentOffset.y;
      },
    });

    return (
      <ScrollYContext.Provider value={scrollY}>
        <ReanimatedScrollView
          ref={ref as any}
          {...props}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {children}
        </ReanimatedScrollView>
      </ScrollYContext.Provider>
    );
  }
);
