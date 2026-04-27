import 'react-native-gesture-handler';
import '../global.css';
import { useEffect } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  useFonts as useSpaceGroteskFonts,
} from '@expo-google-fonts/space-grotesk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useColorScheme } from 'nativewind';
import { ActionSheetProvider } from '../components/ui/ActionSheet';
import { ConfirmDialogProvider } from '../components/ui/ConfirmDialog';
import { useThemeStore } from '../lib/stores/theme-store';
import { NAV_THEME } from '../lib/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [spaceGroteskLoaded] = useSpaceGroteskFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const fontsLoaded = interLoaded && spaceGroteskLoaded;

  const preference = useThemeStore((s) => s.preference);
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(preference);
  }, [preference, setColorScheme]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const effectiveScheme = colorScheme ?? 'light';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={NAV_THEME[effectiveScheme]}>
            <StatusBar style={effectiveScheme === 'dark' ? 'light' : 'dark'} />
            <ActionSheetProvider>
              <ConfirmDialogProvider>
                <Stack screenOptions={{ headerShown: false }} />
              </ConfirmDialogProvider>
            </ActionSheetProvider>
            <PortalHost />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
