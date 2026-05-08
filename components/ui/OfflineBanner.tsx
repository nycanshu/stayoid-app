import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated';
import { CloudSlashIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { logger } from '@/lib/utils/logger';

const log = logger('netinfo');

/**
 * Persistent banner that shows when the device loses connectivity. Slides
 * down below the safe-area top and stays until reachability is restored.
 *
 * Mounted at the root in `app/_layout.tsx`. Uses `@react-native-community/netinfo`
 * which handles iOS + Android transparently.
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const [offline, setOffline] = useState(false);

  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      // `isInternetReachable === false` is the strict check. When null
      // (probing in progress) we don't toggle yet to avoid flicker.
      const isOffline = state.isConnected === false || state.isInternetReachable === false;
      setOffline(isOffline);
      log.debug('netinfo', { isConnected: state.isConnected, reachable: state.isInternetReachable });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    translateY.value = withTiming(offline ? 0 : -80, { duration: 220 });
    opacity.value = withTiming(offline ? 1 : 0, { duration: 200 });
  }, [offline, translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents={offline ? 'auto' : 'none'}
      style={[
        styles.wrapper,
        { paddingTop: insets.top + 6 },
        animStyle,
      ]}
    >
      <View
        style={{
          backgroundColor: palette.foreground,
          marginHorizontal: 12,
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          alignSelf: 'center',
        }}
      >
        <CloudSlashIcon size={14} color={palette.background} weight="bold" />
        <Text
          style={{
            color: palette.background,
            fontSize: 12,
            fontFamily: 'Inter_600SemiBold',
          }}
        >
          You're offline
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 99999,
  },
});
