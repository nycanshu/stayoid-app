import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../../../lib/stores/auth-store';
import { authApi } from '../../../../lib/api/auth';

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { control, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name ?? '' },
  });

  const onSave = async (data: { name: string }) => {
    const updated = await authApi.updateMe(data);
    setUser(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ color: '#4F9D7E', fontSize: 15 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ color: '#FAFAFA', fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: '#A3A3A3', fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Profile</Text>
          <View style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: '#A3A3A3', fontSize: 13, marginBottom: 6 }}>Display Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{ backgroundColor: '#0F0F0F', borderWidth: 1, borderColor: '#272727', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#FAFAFA', fontSize: 15 }}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#4F9D7E', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 }}
              onPress={handleSubmit(onSave)}
              disabled={isSubmitting}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#A3A3A3', fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Account</Text>
          <View style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, padding: 16 }}>
            <Text style={{ color: '#A3A3A3', fontSize: 13 }}>Email</Text>
            <Text style={{ color: '#FAFAFA', fontSize: 15, marginTop: 4 }}>{user?.email}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
