import {
  View, Text, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from 'phosphor-react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay,
} from 'react-native-reanimated';
import { authApi } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useColors } from '../../lib/hooks/use-colors';
import { StayoidLogo } from '../../components/shared/StayoidLogo';
import type { TextInputProps } from 'react-native';
import { TextInput } from 'react-native';

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
  onPress, disabled, children, variant = 'primary', colors,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
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
          backgroundColor: variant === 'primary' ? colors.primary : 'transparent',
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? colors.border : undefined,
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

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Entrance animations
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + heading */}
          <Animated.View style={[{ alignItems: 'center', marginBottom: 40 }, logoStyle]}>
            <StayoidLogo size={48} />
            <Text style={{ color: colors.foreground, fontSize: 26, fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.5, marginTop: 14 }}>
              Stayoid
            </Text>
            <Text style={{ color: colors.mutedFg, fontSize: 15, fontFamily: 'Inter_400Regular', marginTop: 4 }}>
              Welcome back
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

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={{ alignSelf: 'flex-end', marginTop: -8, marginBottom: 28 }}>
                <Text style={{ color: colors.primary, fontSize: 13, fontFamily: 'Inter_400Regular' }}>
                  Forgot Password?
                </Text>
              </Pressable>
            </Link>
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
                : <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>Log In</Text>
              }
            </AnimatedButton>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
              <Text style={{ color: colors.mutedFg, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
                Don't have an account?{' '}
              </Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable>
                  <Text style={{ color: colors.primary, fontSize: 14, fontFamily: 'Inter_500Medium' }}>Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
