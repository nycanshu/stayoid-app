import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { authApi } from '../../lib/api/auth';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await authApi.forgotPassword(data.email);
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0F0F0F' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Text style={{ color: '#4F9D7E', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: '#FAFAFA', fontSize: 22, fontFamily: 'Inter_600SemiBold', marginBottom: 8 }}>
          Reset Password
        </Text>
        <Text style={{ color: '#A3A3A3', fontSize: 14, marginBottom: 24 }}>
          Enter your email and we'll send you a reset link.
        </Text>

        {sent ? (
          <View style={{ backgroundColor: '#1E3C28', borderRadius: 12, padding: 16 }}>
            <Text style={{ color: '#22C55E', fontSize: 14 }}>Check your email for a reset link.</Text>
          </View>
        ) : (
          <>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FAFAFA', fontSize: 15, marginBottom: 4 }}
                  placeholder="you@example.com"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.email && <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12 }}>{errors.email.message}</Text>}

            <TouchableOpacity
              style={{ backgroundColor: '#4F9D7E', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 }}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
