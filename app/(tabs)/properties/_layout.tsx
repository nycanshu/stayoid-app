import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { THEME } from '../../../lib/theme';

export default function PropertiesLayout() {
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
      {/* Listing keeps its custom in-body header */}
      <Stack.Screen name="index"        options={{ headerShown: false }} />
      <Stack.Screen name="new"          options={{ title: 'Add Property' }} />
      <Stack.Screen name="[slug]/index" options={{ title: '' }} />
      <Stack.Screen name="[slug]/edit"  options={{ title: 'Edit Property' }} />
    </Stack>
  );
}
