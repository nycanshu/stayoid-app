import {
  createContext, useContext, useState, useCallback, useRef,
  type ReactNode,
} from 'react';
import {
  Modal, View, Pressable, ScrollView, Dimensions, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  runOnJS, Easing,
} from 'react-native-reanimated';
import { CheckIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_MAX_H = SCREEN_H * 0.85;

export interface ActionSheetOption {
  label: string;
  description?: string;
  Icon?: React.ComponentType<{ size: number; color: string; weight?: any }>;
  iconColor?: string;
  iconBg?: string;
  destructive?: boolean;
  selected?: boolean;
  onPress?: () => void;
}

export interface ActionSheetConfig {
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
  hideCancel?: boolean;
}

interface Ctx {
  show: (config: ActionSheetConfig) => void;
  hide: () => void;
}

const ActionSheetContext = createContext<Ctx | null>(null);

export function useActionSheet() {
  const ctx = useContext(ActionSheetContext);
  if (!ctx) throw new Error('useActionSheet must be used inside <ActionSheetProvider>');
  return ctx;
}

function OptionButton({
  option,
  onActivate,
  fallbackIconColor,
}: {
  option: ActionSheetOption;
  onActivate: (o: ActionSheetOption) => void;
  fallbackIconColor: string;
}) {
  const Icon = option.Icon;

  const containerClass = option.destructive
    ? 'bg-destructive-bg border-destructive'
    : option.selected
      ? 'bg-primary-bg border-primary'
      : 'bg-card border-border';

  const labelClass = option.destructive ? 'text-destructive' : 'text-foreground';

  const iconChipClass = option.destructive ? 'bg-destructive-bg' : 'bg-muted';

  return (
    <Pressable
      onPress={() => onActivate(option)}
      android_ripple={null}
      className={cn(
        'flex-row items-center gap-3.5 rounded-2xl border-[1.5px] px-[18px] py-[18px] min-h-[64px]',
        containerClass,
      )}
    >
      {Icon && (
        <View
          className={cn('size-9 rounded-[10px] items-center justify-center', iconChipClass)}
          style={option.iconBg ? { backgroundColor: option.iconBg } : undefined}
        >
          <Icon
            size={18}
            color={option.iconColor ?? fallbackIconColor}
            weight="duotone"
          />
        </View>
      )}
      <View className="flex-1 min-w-0">
        <Text
          numberOfLines={1}
          className={cn('text-[15px]', labelClass)}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {option.label}
        </Text>
        {option.description && (
          <Text
            numberOfLines={2}
            className="text-xs text-muted-foreground mt-[3px] leading-4"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {option.description}
          </Text>
        )}
      </View>
      {option.selected && (
        <View className="size-6 rounded-full items-center justify-center bg-primary">
          <CheckIcon size={13} color="#fff" weight="bold" />
        </View>
      )}
    </Pressable>
  );
}

export function ActionSheetProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const [config, setConfig] = useState<ActionSheetConfig | null>(null);

  const backdrop = useSharedValue(0);
  const translate = useSharedValue(SCREEN_H);

  const pendingActionRef = useRef<(() => void) | null>(null);

  const finishHide = useCallback(() => {
    setConfig(null);
    const next = pendingActionRef.current;
    pendingActionRef.current = null;
    if (next) {
      setTimeout(next, 50);
    }
  }, []);

  const open = useCallback((c: ActionSheetConfig) => {
    Haptics.selectionAsync();
    setConfig(c);
    requestAnimationFrame(() => {
      backdrop.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
      translate.value = withSpring(0, { damping: 24, stiffness: 240, mass: 0.6 });
    });
  }, [backdrop, translate]);

  const close = useCallback(() => {
    backdrop.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) });
    translate.value = withTiming(SCREEN_H, { duration: 220, easing: Easing.in(Easing.quad) },
      (done) => { if (done) runOnJS(finishHide)(); });
  }, [backdrop, translate, finishHide]);

  const handleOption = useCallback((opt: ActionSheetOption) => {
    if (opt.destructive) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.selectionAsync();
    }
    pendingActionRef.current = opt.onPress ?? null;
    close();
  }, [close]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value * 0.6 }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translate.value }] }));

  return (
    <ActionSheetContext.Provider value={{ show: open, hide: close }}>
      {children}

      <Modal
        transparent
        visible={!!config}
        statusBarTranslucent
        animationType="none"
        onRequestClose={close}
      >
        <Pressable onPress={close} style={StyleSheet.absoluteFill}>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdropStyle]}
          />
        </Pressable>

        <Animated.View
          style={[
            {
              position: 'absolute', left: 0, right: 0, bottom: 0,
              backgroundColor: palette.background,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              borderTopWidth: 1, borderColor: palette.border,
              paddingHorizontal: 12,
              paddingTop: 12,
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
          <View className="items-center mb-3">
            <View className="w-11 h-[5px] rounded-[3px] bg-muted-foreground opacity-40" />
          </View>

          {(config?.title || config?.message) && (
            <View className="bg-card border-[1.5px] border-border rounded-2xl px-4 py-3.5 items-center mb-2.5">
              {config?.title && (
                <Text
                  numberOfLines={1}
                  className="text-base text-foreground tracking-tight"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {config.title}
                </Text>
              )}
              {config?.message && (
                <Text
                  className="text-xs text-muted-foreground text-center leading-4"
                  style={{ fontFamily: 'Inter_400Regular', marginTop: config?.title ? 4 : 0 }}
                >
                  {config.message}
                </Text>
              )}
            </View>
          )}

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ gap: 10 }}
          >
            {config?.options.map((opt, i) => (
              <OptionButton
                key={i}
                option={opt}
                onActivate={handleOption}
                fallbackIconColor={palette.mutedForeground}
              />
            ))}
          </ScrollView>

          {!config?.hideCancel && (
            <Pressable
              onPress={close}
              android_ripple={null}
              className="bg-card border-[1.5px] border-border rounded-2xl py-[18px] items-center justify-center mt-3 min-h-[60px]"
            >
              <Text
                className="text-[15px] text-foreground"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {config?.cancelLabel ?? 'Cancel'}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </Modal>
    </ActionSheetContext.Provider>
  );
}

export type { ActionSheetOption as Option };
