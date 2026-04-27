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
import { useColorScheme } from 'nativewind';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay, withRepeat, withSequence,
  Easing,
} from 'react-native-reanimated';
import { authApi } from '../../lib/api/auth';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { TextInputProps } from 'react-native';

function FocusableInput({
  label, error, ...props
}: TextInputProps & {
  label: string;
  error?: string;
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
      <TextInput
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={palette.mutedForeground}
        className={cn(
          'bg-card border-[1.5px] rounded-xl px-4 py-3.5 text-foreground text-[15px]',
          borderClass,
        )}
        style={{ fontFamily: 'Inter_400Regular' }}
      />
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

function SuccessView({ email }: { email: string }) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const color = palette.success;

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

  return (
    <View className="items-center px-2">
      <Animated.View style={iconWrapStyle} className="items-center justify-center mb-10">
        <Animated.View
          style={[
            { width: 180, height: 180, borderRadius: 90, backgroundColor: `${color}08` },
            ring1Style,
          ]}
          className="items-center justify-center"
        >
          <Animated.View
            style={[
              { width: 140, height: 140, borderRadius: 70, backgroundColor: `${color}12` },
              ring2Style,
            ]}
            className="items-center justify-center"
          >
            <View
              style={{
                width: 100, height: 100, borderRadius: 50,
                backgroundColor: `${color}20`,
                borderWidth: 1, borderColor: `${color}40`,
              }}
              className="items-center justify-center"
            >
              <CheckCircleIcon size={42} color={color} weight="duotone" />
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.View style={textStyle} className="items-center mb-9">
        <Text
          className="text-foreground text-[22px] mb-2.5 text-center tracking-tight"
          style={{ fontFamily: 'SpaceGrotesk_700Bold', paddingRight: 0.4 }}
        >
          Check your inbox
        </Text>
        <Text
          className="text-muted-foreground text-[15px] text-center leading-[22px]"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          We sent a password reset link to
        </Text>
        <Text
          className="text-foreground text-[15px] mt-1"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {email}
        </Text>
      </Animated.View>

      <Animated.View style={ctaStyle} className="w-full gap-3">
        <AnimatedButton onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-white text-[15px]" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Back to Login
          </Text>
        </AnimatedButton>
      </Animated.View>
    </View>
  );
}

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
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
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />
      {!sent && (
        <View className="px-4 pt-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            android_ripple={null}
            className="size-9 rounded-full bg-card border border-border items-center justify-center"
          >
            <ArrowLeftIcon size={16} color={palette.foreground} />
          </Pressable>
        </View>
      )}

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {sent ? (
            <SuccessView email={submittedEmail} />
          ) : (
            <>
              <Animated.View style={headerStyle} className="items-center mb-9">
                <View
                  style={{
                    backgroundColor: palette.primary + '15',
                    borderColor: palette.primary + '30',
                  }}
                  className="size-14 rounded-2xl border items-center justify-center mb-4"
                >
                  <EnvelopeIcon size={26} color={palette.primary} weight="duotone" />
                </View>
                <Text
                  className="text-foreground text-[22px] tracking-tight"
                  style={{ fontFamily: 'SpaceGrotesk_700Bold', paddingRight: 0.4 }}
                >
                  Forgot Password?
                </Text>
                <Text
                  className="text-muted-foreground text-sm mt-1.5 text-center leading-5"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
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
                    />
                  )}
                />

                <AnimatedButton onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  {isSubmitting
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text className="text-white text-[15px]" style={{ fontFamily: 'Inter_600SemiBold' }}>Send Reset Link</Text>
                  }
                </AnimatedButton>

                <Pressable
                  onPress={() => router.back()}
                  android_ripple={null}
                  className="items-center mt-5"
                >
                  <Text
                    className="text-muted-foreground text-sm"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    Back to{' '}
                    <Text
                      className="text-primary"
                      style={{ fontFamily: 'Inter_500Medium' }}
                    >
                      Log In
                    </Text>
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
