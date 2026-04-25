import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { authApi } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/stores/auth-store';

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const tokens = await authApi.signup(data);
      await SecureStore.setItemAsync('access_token', tokens.access);
      await SecureStore.setItemAsync('refresh_token', tokens.refresh);
      const me = await authApi.me();
      setUser(me);
      router.replace('/(tabs)');
    } catch {
      setError('Could not create account. Email may already be in use.');
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
        <Text className="text-[#FAFAFA] text-3xl font-semibold text-center mb-1" style={{ fontFamily: 'PlayfairDisplay_600SemiBold' }}>
          Stayoid
        </Text>
        <Text className="text-[#A3A3A3] text-base text-center mb-10">Create your account</Text>

        {error && (
          <View className="bg-[#3C1515] border border-[#EF4444]/40 rounded-xl p-3 mb-4">
            <Text className="text-[#EF4444] text-sm">{error}</Text>
          </View>
        )}

        {(['name', 'email', 'password'] as const).map((field) => (
          <View key={field}>
            <Text className="text-[#A3A3A3] text-sm mb-1 capitalize">{field === 'name' ? 'Full Name' : field.charAt(0).toUpperCase() + field.slice(1)}</Text>
            <Controller
              control={control}
              name={field}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-[#181818] border border-[#272727] rounded-xl px-4 py-3.5 text-[#FAFAFA] text-base mb-1"
                  placeholder={field === 'name' ? 'Himanshu Kumar' : field === 'email' ? 'you@example.com' : '••••••••'}
                  placeholderTextColor="#A3A3A3"
                  keyboardType={field === 'email' ? 'email-address' : 'default'}
                  autoCapitalize={field === 'name' ? 'words' : 'none'}
                  secureTextEntry={field === 'password'}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors[field] && <Text className="text-[#EF4444] text-xs mb-2">{errors[field]?.message}</Text>}

            {field === 'password' && password.length > 0 && (
              <View className="flex-row gap-2 mt-1 mb-2 flex-wrap">
                {[
                  { key: 'length', label: '8+ characters' },
                  { key: 'letter', label: 'One letter' },
                  { key: 'number', label: 'One number' },
                ].map(({ key, label }) => (
                  <View
                    key={key}
                    className={`rounded-full px-3 py-1 border ${checks[key as keyof typeof checks] ? 'bg-[#1E3C28] border-[#22C55E]/40' : 'bg-[#272727] border-[#272727]'}`}
                  >
                    <Text className={`text-xs ${checks[key as keyof typeof checks] ? 'text-[#22C55E]' : 'text-[#A3A3A3]'}`}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          className="bg-[#4F9D7E] rounded-xl py-4 items-center mt-4"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="text-white text-base font-semibold">
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-[#A3A3A3]">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-[#4F9D7E]">Log in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
