import {
  View, Text, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from 'phosphor-react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay,
  interpolateColor,
} from 'react-native-reanimated';
import { authApi } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useColors } from '../../lib/hooks/use-colors';
import { StayoidLogo } from '../../components/shared/StayoidLogo';
import type { TextInputProps } from 'react-native';

// ─── Shared local components ──────────────────────────────────────────────────

function FocusableInput({
  label, error, showToggle, onToggle, secureTextEntry, colors, ...props
}: TextInputProps & {
  label: string;
  error?: string;
  showToggle?: boolean;
  onToggle?: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.mutedFg, fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 6 }}>
        {label}
      </Text>
      <View>
        <TextInput
          {...props}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.mutedFg}
          style={{
            backgroundColor: colors.card,
            borderWidth: 1.5,
            borderColor: error ? colors.danger : isFocused ? colors.primary : colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            paddingRight: showToggle ? 48 : 16,
            color: colors.foreground,
            fontSize: 15,
            fontFamily: 'Inter_400Regular',
          }}
        />
        {showToggle && onToggle && (
          <Pressable
            onPress={onToggle}
            hitSlop={8}
            style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            {secureTextEntry
              ? <EyeIcon size={18} color={colors.mutedFg} />
              : <EyeSlashIcon size={18} color={colors.mutedFg} />
            }
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={{ color: colors.danger, fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

function AnimatedButton({
  onPress, disabled, children, colors,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
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
        style={{
          backgroundColor: colors.primary,
          borderRadius: 14,
          paddingVertical: 15,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function StrengthPill({ passed, label, colors }: {
  passed: boolean;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  const progress = useSharedValue(passed ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(passed ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [passed]);

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.mutedBg, colors.successBg]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.success + '60']),
    transform: [{ scale: 0.97 + progress.value * 0.03 }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.mutedFg, colors.success]),
  }));

  return (
    <Animated.View style={[{ borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 }, pillStyle]}>
      <Animated.Text style={[{ fontSize: 11, fontFamily: 'Inter_500Medium' }, textStyle]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

// ─── Schema ───────────────────────────────────────────────────────────────────

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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SignupScreen() {
  const colors = useColors();
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

  // Entrance animations
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Back button */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          hitSlop={8}
          style={{ width: 36, height: 36, borderRadius: 99, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeftIcon size={16} color={colors.foreground} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + heading */}
          <Animated.View style={[{ alignItems: 'center', marginBottom: 36 }, headerStyle]}>
            <StayoidLogo size={48} />
            <Text style={{ color: colors.foreground, fontSize: 26, fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.5, marginTop: 14 }}>
              Stayoid
            </Text>
            <Text style={{ color: colors.mutedFg, fontSize: 15, fontFamily: 'Inter_400Regular', marginTop: 4 }}>
              Create your account
            </Text>
          </Animated.View>

          {/* API error banner */}
          {apiError && (
            <View style={{ backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger + '50', borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.danger, fontSize: 13, fontFamily: 'Inter_400Regular' }}>{apiError}</Text>
            </View>
          )}

          {/* Form fields */}
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
                  colors={colors}
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
                  colors={colors}
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
                  colors={colors}
                />
              )}
            />

            {/* Password strength pills */}
            {password.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: -4, marginBottom: 16, flexWrap: 'wrap' }}>
                <StrengthPill passed={checks.length} label="8+ characters" colors={colors} />
                <StrengthPill passed={checks.letter} label="One letter" colors={colors} />
                <StrengthPill passed={checks.number} label="One number" colors={colors} />
              </View>
            )}
          </Animated.View>

          {/* CTA */}
          <Animated.View style={[{ gap: 12 }, ctaStyle]}>
            <AnimatedButton
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              colors={colors}
            >
              {isSubmitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>Create Account</Text>
              }
            </AnimatedButton>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
              <Text style={{ color: colors.mutedFg, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
                Already have an account?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={{ color: colors.primary, fontSize: 14, fontFamily: 'Inter_500Medium' }}>Log in</Text>
                </Pressable>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
