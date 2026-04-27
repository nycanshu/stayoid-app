import { Tabs } from 'expo-router';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  HouseIcon, BuildingsIcon, CreditCardIcon, GearSixIcon,
} from 'phosphor-react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { THEME } from '../../lib/theme';

const TAB_ICONS: Record<string, any> = {
  index:      HouseIcon,
  properties: BuildingsIcon,
  payments:   CreditCardIcon,
  settings:   GearSixIcon,
};

function TabItem({
  routeName, isFocused, onPress, mutedFg,
}: {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  mutedFg: string;
}) {
  const Icon = TAB_ICONS[routeName] ?? HouseIcon;

  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(isFocused ? 1 : 0);
  const iconColor = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    bgOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
    iconColor.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.86, { damping: 14, stiffness: 280 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
      android_ripple={null}
      hitSlop={6}
    >
      <Animated.View style={scaleStyle} className="items-center justify-center">
        <Animated.View
          style={highlightStyle}
          className="absolute w-[58px] h-11 rounded-[22px] bg-primary"
        />
        <View className="px-5 py-3">
          <Icon
            size={21}
            color={isFocused ? '#fff' : mutedFg}
            weight={isFocused ? 'fill' : 'regular'}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

function FloatingTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const bottom = Math.max(insets.bottom, 12) + 12;

  return (
    <View
      pointerEvents="box-none"
      style={{ bottom }}
      className="absolute left-0 right-0 items-center"
    >
      <View
        className="flex-row items-center bg-card border border-border rounded-[32px] px-2 py-2 gap-1"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 28,
          elevation: 20,
        }}
      >
        {state.routes.map((route: any) => {
          if (!TAB_ICONS[route.name]) return null;

          const isFocused = state.routes[state.index].name === route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (event.defaultPrevented) return;

            if (isFocused) {
              Haptics.selectionAsync();
              navigation.dispatch({
                type: 'NAVIGATE',
                payload: { name: route.name },
                target: state.key,
              });
            } else {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TabItem
              key={route.key}
              routeName={route.name}
              isFocused={isFocused}
              onPress={onPress}
              mutedFg={palette.mutedForeground}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="properties" />
      <Tabs.Screen name="payments" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="tenants" options={{ href: null }} />
    </Tabs>
  );
}
