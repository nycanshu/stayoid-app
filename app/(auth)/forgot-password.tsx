import {
  View, Text, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { ArrowLeftIcon, EnvelopeIcon, CheckCircleIcon } from 'phosphor-react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay, withRepeat, withSequence,
  Easing,
} from 'react-native-reanimated';
import { authApi } from '../../lib/api/auth';
import { useColors } from '../../lib/hooks/use-colors';
import type { TextInputProps } from 'react-native';

// ─── Local components ─────────────────────────────────────────────────────────

function FocusableInput({
  label, error, colors, ...props
}: TextInputProps & {
  label: string;
  error?: string;
  colors: ReturnType<typeof useColors>;
}) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.mutedFg, fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        {...props}
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
          color: colors.foreground,
          fontSize: 15,
          fontFamily: 'Inter_400Regular',
        }}
      />
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
        android_ripple={null}
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

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessView({ email, colors }: { email: string; colors: ReturnType<typeof useColors> }) {
  const iconOpacity = useSharedValue(0);
  const iconY = useSharedValue(28);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(18);
  const ctaOpacity = useSharedValue(0);
  const ctaY = useSharedValue(14);
  const floatY = useSharedValue(0);
  const ring1Scale = useSharedValue(1);
  const ring2Scale = useSharedValue(1);

  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: 560 });
    iconY.value = withSpring(0, { damping: 14, stiffness: 90 });
    textOpacity.value = withDelay(200, withTiming(1, { duration: 420 }));
    textY.value = withDelay(200, withSpring(0, { damping: 14, stiffness: 90 }));
    ctaOpacity.value = withDelay(360, withTiming(1, { duration: 380 }));
    ctaY.value = withDelay(360, withSpring(0, { damping: 15, stiffness: 100 }));

    floatY.value = withDelay(700,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1900, easing: Easing.inOut(Easing.ease) })
        ), -1, false
      )
    );
    ring1Scale.value = withDelay(700,
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 2100, easing: Easing.inOut(Easing.ease) })
        ), -1, false
      )
    );
    ring2Scale.value = withDelay(1350,
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 2100, easing: Easing.inOut(Easing.ease) })
        ), -1, false
      )
    );
  }, []);

  const iconWrapStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ translateY: iconY.value + floatY.value }],
  }));
  const ring1Style = useAnimatedStyle(() => ({ transform: [{ scale: ring1Scale.value }] }));
  const ring2Style = useAnimatedStyle(() => ({ transform: [{ scale: ring2Scale.value }] }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }],
  }));

  const color = colors.success;

  return (
    <View style={{ alignItems: 'center', paddingHorizontal: 8 }}>
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center', marginBottom: 40 }, iconWrapStyle]}>
        <Animated.View style={[{
          width: 180, height: 180, borderRadius: 90,
          backgroundColor: `${color}08`,
          alignItems: 'center', justifyContent: 'center',
        }, ring1Style]}>
          <Animated.View style={[{
            width: 140, height: 140, borderRadius: 70,
            backgroundColor: `${color}12`,
            alignItems: 'center', justifyContent: 'center',
          }, ring2Style]}>
            <View style={{
              width: 100, height: 100, borderRadius: 50,
              backgroundColor: `${color}20`,
              borderWidth: 1, borderColor: `${color}40`,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircleIcon size={42} color={color} weight="duotone" />
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[{ alignItems: 'center', marginBottom: 36 }, textStyle]}>
        <Text style={{ color: colors.foreground, fontSize: 22, fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.4, paddingRight: 0.4, marginBottom: 10, textAlign: 'center' }}>
          Check your inbox
        </Text>
        <Text style={{ color: colors.mutedFg, fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 }}>
          We sent a password reset link to
        </Text>
        <Text style={{ color: colors.foreground, fontSize: 15, fontFamily: 'Inter_600SemiBold', marginTop: 4 }}>
          {email}
        </Text>
      </Animated.View>

      <Animated.View style={[{ width: '100%', gap: 12 }, ctaStyle]}>
        <AnimatedButton onPress={() => router.replace('/(auth)/login')} colors={colors}>
          <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>Back to Login</Text>
        </AnimatedButton>
      </Animated.View>
    </View>
  );
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(22);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerY.value = withSpring(0, { damping: 14, stiffness: 90 });
    formOpacity.value = withDelay(160, withTiming(1, { duration: 460 }));
    formY.value = withDelay(160, withSpring(0, { damping: 14, stiffness: 90 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const onSubmit = async (data: FormData) => {
    await authApi.forgotPassword(data.email);
    setSubmittedEmail(data.email);
    setSent(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />
      {!sent && (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            android_ripple={null}
            style={{ width: 36, height: 36, borderRadius: 99, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeftIcon size={16} color={colors.foreground} />
          </Pressable>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {sent ? (
            <SuccessView email={submittedEmail} colors={colors} />
          ) : (
            <>
              <Animated.View style={[{ alignItems: 'center', marginBottom: 36 }, headerStyle]}>
                <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <EnvelopeIcon size={26} color={colors.primary} weight="duotone" />
                </View>
                <Text style={{ color: colors.foreground, fontSize: 22, fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.4, paddingRight: 0.4 }}>
                  Forgot Password?
                </Text>
                <Text style={{ color: colors.mutedFg, fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
                  Enter your email and we'll send{'\n'}you a reset link.
                </Text>
              </Animated.View>

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

                <AnimatedButton onPress={handleSubmit(onSubmit)} disabled={isSubmitting} colors={colors}>
                  {isSubmitting
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>Send Reset Link</Text>
                  }
                </AnimatedButton>

                <Pressable
                  onPress={() => router.back()}
                  android_ripple={null}
                  style={{ alignItems: 'center', marginTop: 20 }}
                >
                  <Text style={{ color: colors.mutedFg, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
                    Back to{' '}
                    <Text style={{ color: colors.primary, fontFamily: 'Inter_500Medium' }}>Log In</Text>
                  </Text>
                </Pressable>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
