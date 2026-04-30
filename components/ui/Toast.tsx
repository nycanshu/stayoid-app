import {
  createContext, useContext, useState, useCallback, useEffect, useRef,
  type ReactNode,
} from 'react';
import { View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS,
} from 'react-native-reanimated';
import {
  CheckCircleIcon, XCircleIcon, InfoIcon, WarningIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import * as Haptics from '@/lib/utils/haptics';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface Ctx {
  show: (config: ToastConfig) => void;
  hide: () => void;
}

const ToastContext = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const DEFAULT_DURATION = 6000;

function getVariantMeta(variant: ToastVariant, scheme: 'light' | 'dark') {
  const t = THEME[scheme];
  switch (variant) {
    case 'success': return { Icon: CheckCircleIcon, color: t.success };
    case 'error':   return { Icon: XCircleIcon,     color: t.destructive };
    case 'warning': return { Icon: WarningIcon,     color: t.warning };
    case 'info':    return { Icon: InfoIcon,        color: t.info };
    default:        return { Icon: null,            color: t.foreground };
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const scheme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = THEME[scheme];
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-30);
  const scale = useSharedValue(0.96);

  const clearTimer = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  };

  const hide = useCallback(() => {
    clearTimer();
    opacity.value = withTiming(0, { duration: 180 });
    scale.value = withTiming(0.96, { duration: 180 });
    translateY.value = withTiming(-30, { duration: 180 }, (finished) => {
      if (finished) runOnJS(setVisible)(false);
    });
  }, [opacity, translateY, scale]);

  const show = useCallback((next: ToastConfig) => {
    clearTimer();
    setConfig(next);
    setVisible(true);
    opacity.value = withTiming(1, { duration: 220 });
    scale.value = withSpring(1, { damping: 18, stiffness: 240 });
    translateY.value = withSpring(0, { damping: 18, stiffness: 240 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    timer.current = setTimeout(hide, next.durationMs ?? DEFAULT_DURATION);
  }, [opacity, translateY, scale, hide]);

  useEffect(() => () => clearTimer(), []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleAction = () => {
    config?.onAction?.();
    hide();
  };

  const variant: ToastVariant = config?.variant ?? 'default';
  const meta = getVariantMeta(variant, scheme);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {visible && config && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            {
              position: 'absolute',
              left: 16,
              right: 16,
              top: insets.top + 12,
              zIndex: 9999,
            },
            animStyle,
          ]}
        >
          <View
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: scheme === 'dark' ? 0.45 : 0.12,
                  shadowRadius: 18,
                },
                android: { elevation: 8 },
              }),
            }}
            className="flex-row items-center gap-3 border rounded-2xl px-4 py-3.5"
          >
            {meta.Icon && (
              <meta.Icon size={20} color={meta.color} weight="fill" />
            )}
            <Text
              className="flex-1 text-foreground text-[13px] leading-[18px]"
              style={{ fontFamily: 'Inter_500Medium' }}
              numberOfLines={2}
            >
              {config.message}
            </Text>
            {config.actionLabel && (
              <Pressable
                onPress={handleAction}
                hitSlop={8}
                android_ripple={null}
                className="px-2 py-1 -mr-1"
              >
                <Text
                  className="text-primary text-[13px]"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {config.actionLabel}
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}
