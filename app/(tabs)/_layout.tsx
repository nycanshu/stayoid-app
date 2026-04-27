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
import { useColors } from '../../lib/hooks/use-colors';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const TAB_ICONS: Record<string, any> = {
  index:      HouseIcon,
  properties: BuildingsIcon,
  payments:   CreditCardIcon,
  settings:   GearSixIcon,
};

// ─── Single tab item ──────────────────────────────────────────────────────────

function TabItem({
  routeName, isFocused, onPress, colors,
}: {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
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
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, scaleStyle]}>
        {/* Pill highlight */}
        <Animated.View style={[{
          position: 'absolute',
          width: 58, height: 44,
          borderRadius: 22,
          backgroundColor: colors.primary,
        }, highlightStyle]} />

        {/* Icon */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <Icon
            size={21}
            color={isFocused ? '#fff' : colors.mutedFg}
            weight={isFocused ? 'fill' : 'regular'}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Floating tab bar ─────────────────────────────────────────────────────────

function FloatingTabBar({ state, navigation }: any) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const bottom = Math.max(insets.bottom, 12) + 12;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom,
        left: 0,
        right: 0,
        alignItems: 'center',
      }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 8,
        paddingVertical: 8,
        gap: 4,
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 28,
        // Android elevation
        elevation: 20,
      }}>
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
              // Re-tap on the currently focused tab → pop its inner stack to
              // root and bring the user back to the tab's default screen.
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
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

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
      {/* Tenants is reachable via deep links + the Settings hub, not the tab bar */}
      <Tabs.Screen name="tenants" options={{ href: null }} />
    </Tabs>
  );
}
