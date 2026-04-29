import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { THEME } from '../../lib/theme';

export default function SlotsLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Slots' }} />
    </Stack>
  );
}
