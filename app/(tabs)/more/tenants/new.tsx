import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTenant } from '../../../../lib/hooks/use-tenants';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  join_date: z.string().min(1, 'Join date is required'),
  deposit_amount: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewTenantScreen() {
  const createTenant = useCreateTenant();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { join_date: new Date().toISOString().split('T')[0] },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // slot selection would be a bottom sheet — placeholder for now
    await createTenant.mutateAsync({
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      join_date: data.join_date,
      deposit_amount: data.deposit_amount ? Number(data.deposit_amount) : 0,
      slot: 0, // TODO: slot picker bottom sheet
    });
    router.back();
  };

  const fields = [
    { name: 'name' as const, label: 'Full Name', placeholder: 'Anjali Kapoor', type: 'default' as const },
    { name: 'phone' as const, label: 'Phone', placeholder: '+91 98765 43210', type: 'phone-pad' as const },
    { name: 'email' as const, label: 'Email (optional)', placeholder: 'tenant@email.com', type: 'email-address' as const },
    { name: 'join_date' as const, label: 'Join Date', placeholder: 'YYYY-MM-DD', type: 'default' as const },
    { name: 'deposit_amount' as const, label: 'Deposit Amount (₹)', placeholder: '10000', type: 'number-pad' as const },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0F0F0F' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Text style={{ color: '#4F9D7E', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: '#FAFAFA', fontSize: 22, fontFamily: 'Inter_600SemiBold', marginBottom: 24 }}>Add Tenant</Text>

        {fields.map(({ name, label, placeholder, type }) => (
          <View key={name}>
            <Text style={{ color: '#A3A3A3', fontSize: 13, marginBottom: 6 }}>{label}</Text>
            <Controller
              control={control}
              name={name}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FAFAFA', fontSize: 15, marginBottom: 4 }}
                  placeholder={placeholder}
                  placeholderTextColor="#A3A3A3"
                  keyboardType={type}
                  autoCapitalize={name === 'name' ? 'words' : 'none'}
                  value={value?.toString() ?? ''}
                  onChangeText={onChange}
                />
              )}
            />
            {errors[name] && <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 8 }}>{errors[name]?.message}</Text>}
          </View>
        ))}

        <TouchableOpacity
          style={{ backgroundColor: '#4F9D7E', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 }}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
            {isSubmitting ? 'Adding…' : 'Add Tenant'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
