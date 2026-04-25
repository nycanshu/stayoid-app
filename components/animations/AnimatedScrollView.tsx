import React, { forwardRef } from 'react';
import { ScrollView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import type { ScrollViewProps, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ScrollYContext } from './scroll-context';

type Props = ScrollViewProps & { children?: React.ReactNode };

export const AnimatedScrollView = forwardRef<ScrollView, Props>(
  function AnimatedScrollView({ children, onScroll, ...props }, ref) {
    const scrollY = useSharedValue(0);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;
      onScroll?.(e);
    };

    return (
      <ScrollYContext.Provider value={scrollY}>
        <ScrollView
          ref={ref}
          {...props}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      </ScrollYContext.Provider>
    );
  }
);
