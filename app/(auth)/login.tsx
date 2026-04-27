import {
  View, Text, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay,
} from 'react-native-reanimated';
import { authApi } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/stores/auth-store';
import { StayoidLogo } from '../../components/shared/StayoidLogo';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { TextInputProps } from 'react-native';

function FocusableInput({
  label, error, showToggle, onToggle, secureTextEntry, ...props
}: TextInputProps & {
  label: string;
  error?: string;
  showToggle?: boolean;
  onToggle?: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const borderClass = error
    ? 'border-destructive'
    : isFocused
      ? 'border-primary'
      : 'border-border';

  return (
    <View className="mb-4">
      <Text
        className="text-muted-foreground text-[13px] mb-1.5"
        style={{ fontFamily: 'Inter_500Medium' }}
      >
        {label}
      </Text>
      <View>
        <TextInput
          {...props}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={palette.mutedForeground}
          className={cn(
            'bg-card border-[1.5px] rounded-xl px-4 py-3.5 text-foreground text-[15px]',
            borderClass,
            showToggle && 'pr-12',
          )}
          style={{ fontFamily: 'Inter_400Regular' }}
        />
        {showToggle && onToggle && (
          <Pressable
            onPress={onToggle}
            hitSlop={8}
            android_ripple={null}
            className="absolute right-3.5 top-0 bottom-0 justify-center"
          >
            {secureTextEntry
              ? <EyeIcon size={18} color={palette.mutedForeground} />
              : <EyeSlashIcon size={18} color={palette.mutedForeground} />
            }
          </Pressable>
        )}
      </View>
      {error && (
        <Text
          className="text-destructive text-xs mt-1"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

function AnimatedButton({
  onPress, disabled, children, variant = 'primary',
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => { if (!disabled) scale.value = withSpring(0.97, { damping: 14, stiffness: 220 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 12, stiffness: 180 }); }}
        android_ripple={null}
        className={cn(
          'rounded-2xl py-[15px] items-center justify-center',
          variant === 'primary' ? 'bg-primary' : 'bg-transparent border-[1.5px] border-border',
          disabled && 'opacity-60',
        )}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(20);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(22);
  const ctaOpacity = useSharedValue(0);
  const ctaY = useSharedValue(16);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoY.value = withSpring(0, { damping: 14, stiffness: 90 });
    formOpacity.value = withDelay(160, withTiming(1, { duration: 460 }));
    formY.value = withDelay(160, withSpring(0, { damping: 14, stiffness: 90 }));
    ctaOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    ctaY.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }],
  }));

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      const tokens = await authApi.login(data);
      await SecureStore.setItemAsync('access_token', tokens.access);
      await SecureStore.setItemAsync('refresh_token', tokens.refresh);
      const me = await authApi.me();
      setUser(me);
      router.replace('/(tabs)');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 400) {
        setApiError('Invalid email or password.');
      } else if (err?.code === 'ECONNREFUSED' || err?.code === 'ERR_NETWORK') {
        setApiError('Cannot reach server. Is the backend running?');
      } else {
        setApiError(err?.message ?? 'Something went wrong.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={logoStyle} className="items-center mb-10">
            <StayoidLogo size={48} />
            <Text
              className="text-foreground text-[26px] mt-3.5 tracking-tight"
              style={{ fontFamily: 'SpaceGrotesk_700Bold', paddingRight: 0.5 }}
            >
              Stayoid
            </Text>
            <Text
              className="text-muted-foreground text-[15px] mt-1"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              Welcome back
            </Text>
          </Animated.View>

          {!!apiError && (
            <View className="bg-destructive-bg border border-destructive/30 rounded-xl p-3 mb-4">
              <Text
                className="text-destructive text-[13px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {apiError}
              </Text>
            </View>
          )}

          <Animated.View style={formStyle}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <FocusableInput
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <FocusableInput
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  showToggle
                  onToggle={() => setShowPassword((p) => !p)}
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable android_ripple={null} className="self-end -mt-2 mb-7">
                <Text
                  className="text-primary text-[13px]"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  Forgot Password?
                </Text>
              </Pressable>
            </Link>
          </Animated.View>

          <Animated.View style={ctaStyle} className="gap-3">
            <AnimatedButton onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text className="text-white text-[15px]" style={{ fontFamily: 'Inter_600SemiBold' }}>Log In</Text>
              }
            </AnimatedButton>

            <View className="flex-row justify-center mt-2">
              <Text
                className="text-muted-foreground text-sm"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Don't have an account?{' '}
              </Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable android_ripple={null}>
                  <Text
                    className="text-primary text-sm"
                    style={{ fontFamily: 'Inter_500Medium' }}
                  >
                    Sign up
                  </Text>
                </Pressable>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
