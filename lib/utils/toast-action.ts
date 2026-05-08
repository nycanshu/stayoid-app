import { toast } from 'sonner-native';
import * as Haptics from './haptics';
import { getApiErrorMessage } from './api-error';

interface WithToastOptions {
  /** Required — the success message. Pass null to skip the success toast. */
  success: string | null;
  /** Optional — the error fallback. Backend code lookup wins over this. */
  error?: string;
  /** When true (default), fire haptic notifications on success/failure. */
  haptic?: boolean;
}

/**
 * Wraps a Promise-returning action (typically a mutation) with toast feedback.
 *
 *   await withToast(
 *     () => exitTenant.mutateAsync({ id, exit_date }),
 *     { success: 'Tenant marked as exited' },
 *   );
 *
 * - On success: green toast with `success` message, success haptic.
 * - On failure: red toast with the user-friendly backend message (via
 *   getApiErrorMessage), error haptic, and the rejection re-thrown so callers
 *   can branch on it (e.g. close a sheet only on success).
 *
 * Returns the resolved value, or rethrows the error.
 */
export async function withToast<T>(
  fn: () => Promise<T>,
  { success, error, haptic = true }: WithToastOptions,
): Promise<T> {
  try {
    const result = await fn();
    if (success !== null) toast.success(success);
    if (haptic) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return result;
  } catch (err) {
    toast.error(getApiErrorMessage(err, error));
    if (haptic) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    throw err;
  }
}
