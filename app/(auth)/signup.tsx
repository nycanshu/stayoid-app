import {
  View, Text, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay,
  interpolateColor,
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
  onPress, disabled, children,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
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
          'bg-primary rounded-2xl py-[15px] items-center justify-center',
          disabled && 'opacity-60',
        )}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function StrengthPill({ passed, label }: {
  passed: boolean;
  label: string;
}) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const progress = useSharedValue(passed ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(passed ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [passed]);

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [palette.muted, palette.successBg]),
    borderColor: interpolateColor(progress.value, [0, 1], [palette.border, palette.success + '60']),
    transform: [{ scale: 0.97 + progress.value * 0.03 }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [palette.mutedForeground, palette.success]),
  }));

  return (
    <Animated.View style={[{ borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 }, pillStyle]}>
      <Animated.Text style={[{ fontSize: 11, fontFamily: 'Inter_500Medium' }, textStyle]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[a-zA-Z]/, 'Must contain a letter')
    .regex(/[0-9]/, 'Must contain a number'),
});
type FormData = z.infer<typeof schema>;

export default function SignupScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const checks = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(22);
  const ctaOpacity = useSharedValue(0);
  const ctaY = useSharedValue(16);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerY.value = withSpring(0, { damping: 14, stiffness: 90 });
    formOpacity.value = withDelay(160, withTiming(1, { duration: 460 }));
    formY.value = withDelay(160, withSpring(0, { damping: 14, stiffness: 90 }));
    ctaOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    ctaY.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
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
      const tokens = await authApi.signup(data);
      await SecureStore.setItemAsync('access_token', tokens.access);
      await SecureStore.setItemAsync('refresh_token', tokens.refresh);
      const me = await authApi.me();
      setUser(me);
      router.replace('/(tabs)');
    } catch {
      setApiError('Could not create account. Email may already be in use.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="px-4 pt-2">
        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          hitSlop={8}
          android_ripple={null}
          className="size-9 rounded-full bg-card border border-border items-center justify-center"
        >
          <ArrowLeftIcon size={16} color={palette.foreground} />
        </Pressable>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={headerStyle} className="items-center mb-9">
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
              Create your account
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
              name="name"
              render={({ field: { onChange, value } }) => (
                <FocusableInput
                  label="Full Name"
                  placeholder="Himanshu Kumar"
                  autoCapitalize="words"
                  autoComplete="name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />

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

            {password.length > 0 && (
              <View className="flex-row gap-2 -mt-1 mb-4 flex-wrap">
                <StrengthPill passed={checks.length} label="8+ characters" />
                <StrengthPill passed={checks.letter} label="One letter" />
                <StrengthPill passed={checks.number} label="One number" />
              </View>
            )}
          </Animated.View>

          <Animated.View style={ctaStyle} className="gap-3">
            <AnimatedButton onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text className="text-white text-[15px]" style={{ fontFamily: 'Inter_600SemiBold' }}>Create Account</Text>
              }
            </AnimatedButton>

            <View className="flex-row justify-center mt-2">
              <Text
                className="text-muted-foreground text-sm"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Already have an account?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable android_ripple={null}>
                  <Text
                    className="text-primary text-sm"
                    style={{ fontFamily: 'Inter_500Medium' }}
                  >
                    Log in
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
