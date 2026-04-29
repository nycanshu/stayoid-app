import { Linking, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Strip +91, leading 0, spaces, hyphens, parens — return digits only with 91 prefix.
 * Defensive for the variety of formats admins enter ("+91 98765 43210", "098765 43210", "9876543210").
 */
export function formatPhoneForWhatsApp(raw: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return null;
  // Strip leading 91 if already present, then re-add
  const local = digits.startsWith('91') && digits.length === 12
    ? digits.slice(2)
    : digits.startsWith('0') && digits.length === 11
      ? digits.slice(1)
      : digits;
  if (local.length !== 10) return null;
  return `91${local}`;
}

/**
 * Open WhatsApp with a pre-filled message using the universal wa.me link.
 *
 * Why wa.me and not whatsapp://send?
 * - wa.me is a universal link: opens WhatsApp app directly if installed, falls back to browser
 *   (which redirects to the install page) otherwise. Works without LSApplicationQueriesSchemes
 *   entitlement on iOS, and without intent filter declarations on Android.
 * - whatsapp:// requires canOpenURL probing which iOS gates behind plist entries.
 *
 * Returns true if the link was dispatched, false if the phone couldn't be parsed.
 */
export async function sendWhatsApp(rawPhone: string, message: string): Promise<boolean> {
  const formatted = formatPhoneForWhatsApp(rawPhone);
  if (!formatted) {
    Alert.alert('Invalid number', "We couldn't parse this phone number. Please update the tenant's contact info.");
    return false;
  }
  const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
    Haptics.selectionAsync();
    return true;
  } catch {
    Alert.alert('Could not open WhatsApp', 'Please make sure WhatsApp is installed.');
    return false;
  }
}

/**
 * Open the system SMS composer with a pre-filled body.
 * Uses sms:<phone>?body=<msg> on iOS and sms:<phone>?body=<msg> on Android (both supported).
 */
export async function sendSMS(rawPhone: string, message: string): Promise<boolean> {
  const formatted = formatPhoneForWhatsApp(rawPhone);
  if (!formatted) {
    Alert.alert('Invalid number', "We couldn't parse this phone number.");
    return false;
  }
  // Android prefers `?` separator; iOS accepts both `?` and `&`. `?` works on both.
  const separator = Platform.OS === 'ios' ? '&' : '?';
  const url = `sms:${formatted}${separator}body=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
    Haptics.selectionAsync();
    return true;
  } catch {
    Alert.alert('Could not open SMS', 'Your device may not support SMS.');
    return false;
  }
}

/**
 * Open the dialer for a phone call. Works the same on both platforms.
 */
export async function callPhone(rawPhone: string): Promise<boolean> {
  const formatted = formatPhoneForWhatsApp(rawPhone);
  if (!formatted) return false;
  try {
    await Linking.openURL(`tel:${formatted}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return true;
  } catch {
    return false;
  }
}
