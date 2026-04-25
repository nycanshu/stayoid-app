import { Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProperty } from '../../../../lib/hooks/use-properties';
import { propertiesApi } from '../../../../lib/api/properties';
import { useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
});
type FormData = z.infer<typeof schema>;

export default function EditPropertyScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: property } = useProperty(slug);
  const qc = useQueryClient();

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    values: { name: property?.name ?? '', address: property?.address ?? '' },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await propertiesApi.update(slug, data);
    qc.invalidateQueries({ queryKey: ['properties'] });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0F0F0F' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Text style={{ color: '#4F9D7E', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: '#FAFAFA', fontSize: 22, fontFamily: 'Inter_600SemiBold', marginBottom: 24 }}>Edit Property</Text>

        <Text style={{ color: '#A3A3A3', fontSize: 13, marginBottom: 6 }}>Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FAFAFA', fontSize: 15, marginBottom: 16 }}
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <Text style={{ color: '#A3A3A3', fontSize: 13, marginBottom: 6 }}>Address</Text>
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FAFAFA', fontSize: 15, marginBottom: 16 }}
              value={value}
              onChangeText={onChange}
              multiline
            />
          )}
        />

        <TouchableOpacity
          style={{ backgroundColor: '#4F9D7E', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
