import {
  createContext, useContext, useState, useCallback, useRef,
  type ReactNode,
} from 'react';
import {
  Modal, View, Text, Pressable, ScrollView, Dimensions, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  runOnJS, Easing,
} from 'react-native-reanimated';
import { CheckIcon } from 'phosphor-react-native';
import { useColors } from '../../lib/hooks/use-colors';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_MAX_H = SCREEN_H * 0.85;

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Single option button — its own component, static styles, full bg + border ─
function OptionButton({
  option, colors, onActivate,
}: {
  option: ActionSheetOption;
  colors: ReturnType<typeof useColors>;
  onActivate: (o: ActionSheetOption) => void;
}) {
  // Build solid colors for this option's button card
  // Use clearly-different bg per state and a strong outline that's always visible.
  const Icon = option.Icon;
  const fg   = option.destructive ? colors.danger : colors.foreground;

  // Three-level depth: sheet (background) → cards (card) → buttons
  // Each option uses theme tokens directly — same pattern as the dashboard.
  const bg = option.destructive
    ? colors.dangerBg
    : option.selected
      ? colors.primaryBg   // subtle green tint for selected
      : colors.card;

  const border = option.destructive
    ? colors.danger
    : option.selected
      ? colors.primary
      : colors.border;          // adapts: light #E5E7EB / dark #3A3A3A

  return (
    <Pressable
      onPress={() => onActivate(option)}
      android_ripple={null}
      style={[
        styles.option,
        { backgroundColor: bg, borderColor: border },
      ]}
    >
      {Icon && (
        <View style={[
          styles.iconChip,
          { backgroundColor: option.iconBg ?? (option.destructive ? colors.dangerBg : colors.mutedBg) },
        ]}>
          <Icon size={18} color={option.iconColor ?? fg} weight="duotone" />
        </View>
      )}
      <View style={styles.labelCol}>
        <Text
          numberOfLines={1}
          style={[styles.label, { color: fg }]}
        >
          {option.label}
        </Text>
        {option.description && (
          <Text
            numberOfLines={2}
            style={[styles.description, { color: colors.mutedFg }]}
          >
            {option.description}
          </Text>
        )}
      </View>
      {option.selected && (
        <View style={[styles.checkBubble, { backgroundColor: colors.primary }]}>
          <CheckIcon size={13} color="#fff" weight="bold" />
        </View>
      )}
    </Pressable>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ActionSheetProvider({ children }: { children: ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [config, setConfig] = useState<ActionSheetConfig | null>(null);

  const backdrop  = useSharedValue(0);
  const translate = useSharedValue(SCREEN_H);

  // Action to run AFTER the close animation completes + Modal unmounts.
  // We stash it here so callers that chain another Modal (ConfirmDialog) don't
  // collide with our still-mounted Modal — Android only renders one at a time.
  const pendingActionRef = useRef<(() => void) | null>(null);

  const finishHide = useCallback(() => {
    setConfig(null);
    const next = pendingActionRef.current;
    pendingActionRef.current = null;
    if (next) {
      // Tiny buffer so React commits the Modal unmount before the next opens
      setTimeout(next, 50);
    }
  }, []);

  const open = useCallback((c: ActionSheetConfig) => {
    Haptics.selectionAsync();
    setConfig(c);
    requestAnimationFrame(() => {
      backdrop.value  = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
      translate.value = withSpring(0, { damping: 24, stiffness: 240, mass: 0.6 });
    });
  }, [backdrop, translate]);

  const close = useCallback(() => {
    backdrop.value  = withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) });
    translate.value = withTiming(SCREEN_H, { duration: 220, easing: Easing.in(Easing.quad) },
      (done) => { if (done) runOnJS(finishHide)(); });
  }, [backdrop, translate, finishHide]);

  const handleOption = useCallback((opt: ActionSheetOption) => {
    if (opt.destructive) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.selectionAsync();
    }
    // Defer the action until close() finishes (finishHide will run it).
    // This guarantees our Modal is unmounted before the caller potentially
    // opens another Modal (e.g. a ConfirmDialog).
    pendingActionRef.current = opt.onPress ?? null;
    close();
  }, [close]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value * 0.6 }));
  const sheetStyle    = useAnimatedStyle(() => ({ transform: [{ translateY: translate.value }] }));

  // Card outline that's always visible regardless of theme
  // Use theme tokens directly — same pattern as the dashboard's cards.

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
        {/* Backdrop — tappable */}
        <Pressable onPress={close} style={StyleSheet.absoluteFill}>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdropStyle]}
          />
        </Pressable>

        {/* Sheet container — solid panel that visually stands above the backdrop */}
        <Animated.View
          style={[
            {
              position: 'absolute', left: 0, right: 0, bottom: 0,
              backgroundColor: colors.background,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              borderTopWidth: 1, borderColor: colors.border,
              paddingHorizontal: 12,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 12) + 8,
              maxHeight: SHEET_MAX_H,
              // Lift off the backdrop with shadow (iOS) + elevation (Android)
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.35,
              shadowRadius: 18,
              elevation: 30,
            },
            sheetStyle,
          ]}
        >
          {/* Grab handle */}
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.mutedFg }]} />
          </View>

          {/* Title card */}
          {(config?.title || config?.message) && (
            <View style={[
              styles.titleCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}>
              {config?.title && (
                <Text
                  numberOfLines={1}
                  style={[styles.titleText, { color: colors.foreground }]}
                >
                  {config.title}
                </Text>
              )}
              {config?.message && (
                <Text style={[
                  styles.messageText,
                  { color: colors.mutedFg, marginTop: config?.title ? 4 : 0 },
                ]}>
                  {config.message}
                </Text>
              )}
            </View>
          )}

          {/* Options stack — each is its own bordered button card */}
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={styles.optionsList}
          >
            {config?.options.map((opt, i) => (
              <OptionButton
                key={i}
                option={opt}
                colors={colors}
                onActivate={handleOption}
              />
            ))}
          </ScrollView>

          {/* Cancel — separate distinct card */}
          {!config?.hideCancel && (
            <Pressable
              onPress={close}
              android_ripple={null}
              style={[
                styles.cancel,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.cancelText, { color: colors.foreground }]}>
                {config?.cancelLabel ?? 'Cancel'}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </Modal>
    </ActionSheetContext.Provider>
  );
}

// ── Static styles — guarantees consistent rendering on iOS + Android ──────────
const styles = StyleSheet.create({
  handleWrap: { alignItems: 'center', marginBottom: 12 },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#FFFFFF', opacity: 0.4 },

  titleCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText:   { fontSize: 16, fontFamily: 'Inter_600SemiBold', letterSpacing: -0.2 },
  messageText: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17, textAlign: 'center' },

  optionsList: { gap: 10 },
  option: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
  },
  iconChip: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  labelCol: { flex: 1, minWidth: 0 },
  label:       { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  description: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3, lineHeight: 16 },
  checkBubble: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  cancel: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 12,
    minHeight: 60,
  },
  cancelText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});

export type { ActionSheetOption as Option };
