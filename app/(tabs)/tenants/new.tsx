import {
  View, Text, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { TenantForm } from '../../../components/tenants/TenantForm';
import { Entrance } from '../../../components/animations';

export default function NewTenantScreen() {
  const { property: propertySlug } = useLocalSearchParams<{ property?: string }>();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Entrance trigger={1} style={{ marginBottom: 16 }}>
            <Text
              className="text-muted-foreground text-[13px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {propertySlug
                ? 'Property pre-selected — pick a vacant slot'
                : 'Add a tenant and assign them to a vacant slot'}
            </Text>
          </Entrance>

          <TenantForm
            mode="create"
            lockedPropertySlug={propertySlug}
            onSuccess={(slug) => router.replace(`/tenants/${slug}` as never)}
            onCancel={() => router.back()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
