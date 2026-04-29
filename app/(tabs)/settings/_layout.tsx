import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { THEME } from '../../../lib/theme';

export default function SettingsLayout() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTitleStyle: {
          color: palette.foreground,
          fontFamily: 'Inter_600SemiBold',
          fontSize: 17,
        },
        headerTintColor: palette.primary,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      {/* Settings root keeps its custom in-body header */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="about"   options={{ title: 'About' }} />
      <Stack.Screen name="terms"   options={{ title: 'Terms of Service' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
    </Stack>
  );
}
