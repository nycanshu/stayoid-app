import {
  createContext, useContext, useState, useCallback, type ReactNode,
} from 'react';
import {
  Modal, View, Text, Pressable, ActivityIndicator, StyleSheet, Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  runOnJS, Easing,
} from 'react-native-reanimated';
import { useColors } from '../../lib/hooks/use-colors';
import { blend } from '../../lib/theme/blend';

const { width: SCREEN_W } = Dimensions.get('window');
// Cap dialog width — never wider than 380, never wider than the screen minus 48px gutter
const DIALOG_MAX_W = Math.min(SCREEN_W - 48, 380);

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ConfirmConfig {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface Ctx {
  confirm: (config: ConfirmConfig) => void;
}

const ConfirmDialogContext = createContext<Ctx | null>(null);

export function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) throw new Error('useConfirmDialog must be used inside <ConfirmDialogProvider>');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const colors = useColors();
  const [config, setConfig] = useState<ConfirmConfig | null>(null);
  const [busy, setBusy]     = useState(false);

  const backdrop = useSharedValue(0);
  const scale    = useSharedValue(0.92);
  const opacity  = useSharedValue(0);

  const finish = useCallback(() => {
    setConfig(null);
    setBusy(false);
  }, []);

  const show = useCallback((c: ConfirmConfig) => {
    setConfig(c);
    setBusy(false);
    requestAnimationFrame(() => {
      backdrop.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
      scale.value    = withSpring(1, { damping: 22, stiffness: 260, mass: 0.6 });
      opacity.value  = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
    });
  }, [backdrop, scale, opacity]);

  const close = useCallback(() => {
    backdrop.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) });
    scale.value    = withTiming(0.92, { duration: 180 });
    opacity.value  = withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) },
      (done) => { if (done) runOnJS(finish)(); });
  }, [backdrop, scale, opacity, finish]);

  const handleConfirm = useCallback(async () => {
    if (!config || busy) return;
    if (config.destructive) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.selectionAsync();
    }
    setBusy(true);
    try {
      await config.onConfirm();
      close();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setBusy(false);
    }
  }, [config, busy, close]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value * 0.6 }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const isDestructive = !!config?.destructive;
  // ── Cancel button colors: blend foreground into card bg so they're a SOLID
  //    different shade from the card on EVERY theme. Then a strong border on top.
  //    Light mode card #FFFFFF → cancelBg ≈ #F0F0F0 (clearly different)
  //    Dark  mode card #181818 → cancelBg ≈ #242424 (clearly different)
  const cancelBg      = blend(colors.foreground, colors.card, 0.07);
  const cancelOutline = blend(colors.foreground, colors.card, 0.30);
  const cardOutline   = blend(colors.foreground, colors.card, 0.20);
  const confirmLabel  = config?.confirmLabel ?? (isDestructive ? 'Delete' : 'Confirm');
  const cancelLabel   = config?.cancelLabel ?? 'Cancel';
  const confirmBg     = isDestructive ? colors.danger : colors.primary;

  return (
    <ConfirmDialogContext.Provider value={{ confirm: show }}>
      {children}

      <Modal
        transparent
        visible={!!config}
        statusBarTranslucent
        animationType="none"
        onRequestClose={busy ? undefined : close}
      >
        {/* Layer 1: backdrop fade */}
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdropStyle]}
        />

        {/* Layer 2: full-screen tap-to-dismiss */}
        <Pressable
          onPress={busy ? undefined : close}
          style={StyleSheet.absoluteFill}
        />

        {/* Layer 3: dialog — absolutely centered, on TOP in z-order */}
        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, styles.center]}
        >
          <Animated.View
            style={[
              styles.card,
              {
                width: DIALOG_MAX_W,
                backgroundColor: colors.card,
                borderColor: cardOutline,
              },
              cardStyle,
            ]}
          >
            <Text style={[styles.title, { color: colors.foreground }]}>
              {config?.title}
            </Text>
            {config?.message && (
              <Text style={[styles.message, { color: colors.mutedFg }]}>
                {config.message}
              </Text>
            )}

            {/* BUTTONS — row with 50/50 halves, internal padding creates the gap.
                          Reliable on both iOS and Android — no flex, no gap prop. */}
            <View style={styles.row}>
              {/* CANCEL — left half */}
              <View style={styles.halfLeft}>
                <Pressable
                  onPress={busy ? undefined : close}
                  disabled={busy}
                  android_ripple={null}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnSecondary,
                    {
                      backgroundColor: pressed ? blend(colors.foreground, cancelBg, 0.15) : cancelBg,
                      borderColor: cancelOutline,
                      opacity: busy ? 0.6 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.btnText, { color: colors.foreground }]}>
                    {cancelLabel}
                  </Text>
                </Pressable>
              </View>

              {/* CONFIRM / DELETE — right half, solid red (destructive) or green */}
              <View style={styles.halfRight}>
                <Pressable
                  onPress={busy ? undefined : handleConfirm}
                  disabled={busy}
                  android_ripple={null}
                  style={({ pressed }) => [
                    styles.btn,
                    {
                      backgroundColor: confirmBg,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  {busy && (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text style={[styles.btnText, { color: '#FFFFFF' }]}>
                    {busy ? 'Working…' : confirmLabel}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ConfirmDialogContext.Provider>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 24,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
  },
  row: {
    marginTop: 22,
    flexDirection: 'row',
    width: '100%',          // explicit width so Android measures correctly
  },
  halfLeft: {
    width: '50%',           // explicit 50% — works on both platforms
    paddingRight: 4,        // half of the 8px gap
  },
  halfRight: {
    width: '50%',
    paddingLeft: 4,         // other half of the 8px gap
  },
  btn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // Subtle shadow so each button feels like a tactile, raised surface
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  btnSecondary: {
    borderWidth: 1.5,
  },
  btnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
