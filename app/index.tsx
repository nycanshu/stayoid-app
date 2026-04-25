import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function Index() {
  const [checked, setChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('access_token').then((token) => {
      setHasToken(!!token);
      setChecked(true);
    });
  }, []);

  if (!checked) return <View className="flex-1 bg-[#0F0F0F]" />;
  return <Redirect href={hasToken ? '/(tabs)/' : '/(auth)/login'} />;
}
