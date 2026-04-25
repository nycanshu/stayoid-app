import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProperty } from '../../../lib/hooks/use-properties';
import type { PropertyType } from '../../../types/property';

const TYPES: PropertyType[] = ['PG', 'HOSTEL', 'APARTMENT'];

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.enum(['PG', 'HOSTEL', 'APARTMENT']),
  address: z.string().min(5, 'Address is required'),
});
type FormData = z.infer<typeof schema>;

export default function NewPropertyScreen() {
  const createProperty = useCreateProperty();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { type: 'PG' },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await createProperty.mutateAsync(data);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0F0F0F' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Text style={{ color: '#4F9D7E', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: '#FAFAFA', fontSize: 22, fontFamily: 'Inter_600SemiBold', marginBottom: 24 }}>
          Add Property
        </Text>

        <Text style={{ color: '#A3A3A3', fontSize: 13, marginBottom: 6 }}>Property Type</Text>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => onChange(t)}
                  style={{
                    flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12,
                    backgroundColor: value === t ? '#4F9D7E' : '#181818',
                    borderWidth: 1, borderColor: value === t ? '#4F9D7E' : '#272727',
                  }}
                >
                  <Text style={{ color: value === t ? '#fff' : '#A3A3A3', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        <Text style={{ color: '#A3A3A3', fontSize: 13, marginBottom: 6 }}>Property Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FAFAFA', fontSize: 15, marginBottom: 4 }}
              placeholder="Sunrise PG"
              placeholderTextColor="#A3A3A3"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.name && <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12 }}>{errors.name.message}</Text>}

        <Text style={{ color: '#A3A3A3', fontSize: 13, marginBottom: 6, marginTop: 12 }}>Address</Text>
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FAFAFA', fontSize: 15, marginBottom: 4 }}
              placeholder="123 MG Road, Bangalore"
              placeholderTextColor="#A3A3A3"
              value={value}
              onChangeText={onChange}
              multiline
            />
          )}
        />
        {errors.address && <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12 }}>{errors.address.message}</Text>}

        <TouchableOpacity
          style={{ backgroundColor: '#4F9D7E', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 }}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
            {isSubmitting ? 'Creating…' : 'Create Property'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
