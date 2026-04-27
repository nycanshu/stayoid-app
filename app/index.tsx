import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '../lib/stores/auth-store';

type State = 'loading' | 'onboarding' | 'login' | 'app';

export default function Index() {
  const [state, setState] = useState<State>('loading');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    (async () => {
      const [token, seen] = await Promise.all([
        SecureStore.getItemAsync('access_token'),
        AsyncStorage.getItem('onboarding_seen'),
      ]);

      // Token without a corresponding authenticated session = stale.
      // Clear it so the user lands in onboarding/login as if fresh.
      if (token && !isAuthenticated) {
        await Promise.all([
          SecureStore.deleteItemAsync('access_token'),
          SecureStore.deleteItemAsync('refresh_token'),
        ]);
      }

      const reallyAuthenticated = !!token && isAuthenticated;

      if (reallyAuthenticated) setState('app');
      else if (seen && !__DEV__) setState('login');
      else setState('onboarding');
    })();
  }, [isAuthenticated]);

  if (state === 'loading') return <View className="flex-1 bg-background" />;
  if (state === 'onboarding') return <Redirect href="/onboarding" />;
  if (state === 'app') return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
