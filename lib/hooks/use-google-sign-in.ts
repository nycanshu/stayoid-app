import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/auth-store';

// Required so the in-app browser auth session resolves cleanly when the
// browser closes and the app comes back to the foreground.
WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Drives the "Continue with Google" flow via our backend's web OAuth.
 *
 * Why we don't use the auth.expo.io proxy or expo-auth-session/providers/google:
 * Google rejects `exp://` redirect URIs, and the auth.expo.io proxy is
 * unreliable on newer Expo accounts. So instead we route the entire OAuth
 * dance through our own backend:
 *
 *   1. Mobile generates a deep-link URL into Expo Go (or our scheme in dev/
 *      production builds) and opens an in-app browser to
 *      `<API_URL>/auth/google/start?return_to=<deep-link>`.
 *   2. Backend redirects to Google. User signs in.
 *   3. Google redirects to backend `/callback?code=...`.
 *   4. Backend exchanges the code server-side, mints our JWT pair, and
 *      302s the browser to `<deep-link>?access=...&refresh=...`.
 *   5. WebBrowser.openAuthSessionAsync detects the deep-link, closes the
 *      browser, and returns the URL to us. We parse, persist, navigate.
 *
 * Returns:
 *   signIn:    call this from a button onPress
 *   isLoading: true while the OAuth flow is in flight
 *   error:     human-readable error to display
 *   isReady:   the API URL is configured (button can be enabled)
 */
export function useGoogleSignIn() {
  const setUser = useAuthStore((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = !!API_URL;

  const signIn = useCallback(async () => {
    if (!API_URL) {
      setError('App is not configured. Missing EXPO_PUBLIC_API_URL.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      // The URL the backend will redirect us to once OAuth completes.
      // In Expo Go this is `exp://<tunnel>/--/auth/google` (or similar);
      // in a dev/prod build with the `stayoid` scheme it's `stayoid://auth/google`.
      const returnTo = Linking.createURL('auth/google');

      const startUrl =
        `${API_URL}/auth/google/start`
        + `?return_to=${encodeURIComponent(returnTo)}`;

      const result = await WebBrowser.openAuthSessionAsync(startUrl, returnTo);

      if (result.type !== 'success') {
        // 'cancel' / 'dismiss' / 'locked' — silent unless it's an explicit error.
        setIsLoading(false);
        return;
      }

      // Parse the tokens or error our backend appended to the deep link.
      const url = new URL(result.url);
      const errorParam   = url.searchParams.get('error');
      const accessToken  = url.searchParams.get('access');
      const refreshToken = url.searchParams.get('refresh');

      if (errorParam) {
        setError(humanError(errorParam));
        setIsLoading(false);
        return;
      }
      if (!accessToken || !refreshToken) {
        setError('Sign in completed but no tokens were returned.');
        setIsLoading(false);
        return;
      }

      // Persist + load profile + redirect.
      await SecureStore.setItemAsync('access_token', accessToken);
      await SecureStore.setItemAsync('refresh_token', refreshToken);
      const me = await authApi.me();
      setUser(me);
      router.replace('/(tabs)' as never);
    } catch (err: any) {
      setError(err?.message ?? 'Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  return { signIn, isLoading, error, isReady };
}

function humanError(code: string): string {
  switch (code) {
    case 'no_code':                       return 'Google did not return an authorization code.';
    case 'invalid_oauth_state':           return 'Sign-in session expired. Please try again.';
    case 'google_oauth_exchange_failed':  return 'Google rejected the sign-in. Please try again.';
    case 'google_oauth_unreachable':      return 'Could not reach Google. Check your connection.';
    case 'google_email_not_verified':     return 'Your Google account email is not verified.';
    case 'account_inactive':              return 'This account has been deactivated.';
    case 'access_denied':                 return 'Sign-in was cancelled.';
    default:                              return `Sign-in failed (${code}).`;
  }
}
