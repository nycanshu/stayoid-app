import 'react-native-gesture-handler';
import '../global.css';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { useEffect } from 'react';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
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
import { Toaster } from 'sonner-native';
import { ActionSheetProvider } from '../components/ui/ActionSheet';
import { ConfirmDialogProvider } from '../components/ui/ConfirmDialog';
import { DatePickerProvider } from '../components/ui/DatePickerSheet';
import { RecordPaymentSheetProvider } from '../components/payments/RecordPaymentSheet';
import { useThemeStore } from '../lib/stores/theme-store';
import { NAV_THEME, THEME } from '../lib/theme';

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
  const palette = THEME[effectiveScheme];

  // Shared native-stack header style for top-level routes (slots, floors)
  // pushed from inside (tabs). The native back chevron renders automatically
  // because the previous screen — (tabs) — is in the same stack.
  const nativeHeaderOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: palette.background },
    headerTitleStyle: {
      color: palette.foreground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 17,
    },
    headerTintColor: palette.primary,
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={NAV_THEME[effectiveScheme]}>
            <StatusBar style={effectiveScheme === 'dark' ? 'light' : 'dark'} />
            <ActionSheetProvider>
              <ConfirmDialogProvider>
                <DatePickerProvider>
                  <RecordPaymentSheetProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(auth)" />
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="onboarding" />
                      <Stack.Screen
                        name="slots/index"
                        options={{ ...nativeHeaderOptions, title: 'Slots' }}
                      />
                      <Stack.Screen
                        name="floors/[floorSlug]/index"
                        options={{ ...nativeHeaderOptions, title: '' }}
                      />
                    </Stack>
                  </RecordPaymentSheetProvider>
                </DatePickerProvider>
              </ConfirmDialogProvider>
            </ActionSheetProvider>
            <PortalHost />
            <Toaster
              theme={effectiveScheme}
              position="top-center"
              richColors
              offset={12}
              swipeToDismissDirection="up"
            />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
