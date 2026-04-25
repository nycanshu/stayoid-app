import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

type State = 'loading' | 'onboarding' | 'login' | 'app';

export default function Index() {
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    (async () => {
      const [token, seen] = await Promise.all([
        SecureStore.getItemAsync('access_token'),
        AsyncStorage.getItem('onboarding_seen'),
      ]);

      if (token) setState('app');
      else if (seen && !__DEV__) setState('login');
      else setState('onboarding');
    })();
  }, []);

  if (state === 'loading') return <View style={{ flex: 1, backgroundColor: '#0F0F0F' }} />;
  if (state === 'onboarding') return <Redirect href="/onboarding" />;
  if (state === 'app') return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
