import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { authApi } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/stores/auth-store';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    console.log('[login] submitting to', process.env.EXPO_PUBLIC_API_URL);
    try {
      const tokens = await authApi.login(data);
      await SecureStore.setItemAsync('access_token', tokens.access);
      await SecureStore.setItemAsync('refresh_token', tokens.refresh);
      const me = await authApi.me();
      setUser(me);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('[login] error', err?.response?.status, err?.message, err?.code);
      const status = err?.response?.status;
      if (status === 401 || status === 400) {
        setError('Invalid email or password.');
      } else if (err?.code === 'ECONNREFUSED' || err?.code === 'ERR_NETWORK') {
        setError(`Cannot reach server at ${process.env.EXPO_PUBLIC_API_URL}. Is Django running?`);
      } else {
        setError(err?.message ?? 'Something went wrong.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0F0F0F]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-[#FAFAFA] text-3xl font-semibold text-center mb-1" style={{ fontFamily: 'SpaceGrotesk_700Bold' }}>
          Stayoid
        </Text>
        <Text className="text-[#A3A3A3] text-base text-center mb-10">Welcome back</Text>

        {error && (
          <View className="bg-[#3C1515] border border-[#EF4444]/40 rounded-xl p-3 mb-4">
            <Text className="text-[#EF4444] text-sm">{error}</Text>
          </View>
        )}

        <Text className="text-[#A3A3A3] text-sm mb-1">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-[#181818] border border-[#272727] rounded-xl px-4 py-3.5 text-[#FAFAFA] text-base mb-1"
              placeholder="you@example.com"
              placeholderTextColor="#A3A3A3"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.email && <Text className="text-[#EF4444] text-xs mb-3">{errors.email.message}</Text>}

        <Text className="text-[#A3A3A3] text-sm mt-3 mb-1">Password</Text>
        <View className="relative">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="bg-[#181818] border border-[#272727] rounded-xl px-4 py-3.5 text-[#FAFAFA] text-base pr-12"
                placeholder="••••••••"
                placeholderTextColor="#A3A3A3"
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowPassword((p) => !p)}
          >
            <Text className="text-[#A3A3A3] text-sm">{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        {errors.password && <Text className="text-[#EF4444] text-xs mb-3">{errors.password.message}</Text>}

        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity className="self-end mt-2 mb-6">
            <Text className="text-[#4F9D7E] text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          className="bg-[#4F9D7E] rounded-xl py-4 items-center"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="text-white text-base font-semibold">
            {isSubmitting ? 'Signing in…' : 'Log In'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-[#A3A3A3]">Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-[#4F9D7E]">Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
