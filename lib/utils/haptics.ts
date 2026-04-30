/**
 * Drop-in replacement for `expo-haptics` that respects the user's
 * `hapticsEnabled` preference. ALL haptic calls in the app should import
 * from here, never from `expo-haptics` directly, so flipping the toggle in
 * Settings actually silences vibrations everywhere.
 *
 * Migration:
 *   - import * as Haptics from 'expo-haptics';
 *   + import * as Haptics from '@/lib/utils/haptics';
 *
 * The named exports mirror expo-haptics so call sites don't need to change:
 *   Haptics.selectionAsync()
 *   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
 *   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
 */
import * as ExpoHaptics from 'expo-haptics';
import { usePreferencesStore } from '../stores/preferences-store';

// Re-export the enums verbatim so call sites continue to use
// `Haptics.ImpactFeedbackStyle.Medium` etc. without changes.
export const ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType;
export type ImpactFeedbackStyleType = ExpoHaptics.ImpactFeedbackStyle;
export type NotificationFeedbackTypeType = ExpoHaptics.NotificationFeedbackType;

const isEnabled = () => usePreferencesStore.getState().hapticsEnabled;

export async function selectionAsync(): Promise<void> {
  if (!isEnabled()) return;
  try { await ExpoHaptics.selectionAsync(); } catch { /* swallow — never block UI on haptics */ }
}

export async function impactAsync(
  style: ExpoHaptics.ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle.Medium,
): Promise<void> {
  if (!isEnabled()) return;
  try { await ExpoHaptics.impactAsync(style); } catch { /* swallow */ }
}

export async function notificationAsync(
  type: ExpoHaptics.NotificationFeedbackType,
): Promise<void> {
  if (!isEnabled()) return;
  try { await ExpoHaptics.notificationAsync(type); } catch { /* swallow */ }
}
