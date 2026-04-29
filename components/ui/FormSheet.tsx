import { useEffect, useState, type ReactNode, type ComponentType } from 'react';
import {
  Modal, View, Pressable, ScrollView, Dimensions, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  runOnJS, Easing,
} from 'react-native-reanimated';
import { XIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_MAX_H = SCREEN_H * 0.9;

interface FormSheetProps {
  visible: boolean;
  onClose: () => void;
  /** When true, backdrop tap and Android back are no-ops (use during submit). */
  busy?: boolean;
  title: string;
  subtitle?: string;
  Icon?: ComponentType<{ size: number; color: string; weight?: any }>;
  iconBg?: string;
  iconColor?: string;
  /** Form fields. */
  children: ReactNode;
  /** Sticky footer — typically Cancel + Submit buttons. */
  footer?: ReactNode;
}

export function FormSheet({
  visible, onClose, busy, title, subtitle,
  Icon, iconBg, iconColor, children, footer,
}: FormSheetProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const backdrop = useSharedValue(0);
  const translate = useSharedValue(SCREEN_H);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Haptics.selectionAsync();
      requestAnimationFrame(() => {
        backdrop.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
        translate.value = withSpring(0, { damping: 24, stiffness: 240, mass: 0.6 });
      });
    } else if (mounted) {
      backdrop.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) });
      translate.value = withTiming(SCREEN_H, { duration: 220, easing: Easing.in(Easing.quad) },
        (done) => { if (done) runOnJS(setMounted)(false); });
    }
  }, [visible, backdrop, translate, mounted]);

  const handleDismiss = () => {
    if (!busy) onClose();
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value * 0.6 }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translate.value }] }));

  return (
    <Modal
      transparent
      visible={mounted}
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Pressable onPress={handleDismiss} style={StyleSheet.absoluteFill}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdropStyle]}
        />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
      >
        <View style={{ flex: 1 }} pointerEvents="box-none" />
        <Animated.View
          style={[
            {
              backgroundColor: palette.background,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              borderTopWidth: 1, borderColor: palette.border,
              paddingBottom: Math.max(insets.bottom, 12) + 8,
              maxHeight: SHEET_MAX_H,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.35,
              shadowRadius: 18,
              elevation: 30,
            },
            sheetStyle,
          ]}
        >
          <View className="items-center pt-3 pb-2">
            <View className="w-11 h-[5px] rounded-[3px] bg-muted-foreground opacity-40" />
          </View>

          <View className="flex-row items-start gap-3 px-4 pt-2 pb-3 border-b border-border">
            {Icon && (
              <View
                style={iconBg ? { backgroundColor: iconBg } : undefined}
                className="size-10 rounded-[10px] bg-primary-bg items-center justify-center"
              >
                <Icon size={18} color={iconColor ?? palette.primary} weight="duotone" />
              </View>
            )}
            <View className="flex-1 min-w-0">
              <Text
                numberOfLines={1}
                className="text-foreground text-[17px] tracking-tight"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  numberOfLines={2}
                  className="text-muted-foreground text-[12px] mt-0.5 leading-[16px]"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {subtitle}
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleDismiss}
              disabled={busy}
              android_ripple={null}
              hitSlop={6}
              className="size-9 rounded-[10px] border border-border bg-card items-center justify-center"
            >
              <XIcon size={14} color={palette.foreground} weight="bold" />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
          >
            {children}
          </ScrollView>

          {footer && (
            <View className="px-4 pt-3 border-t border-border">
              {footer}
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
