import {
  View, Text, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { PropertyForm } from '../../../components/properties/PropertyForm';
import { Entrance } from '../../../components/animations';

export default function NewPropertyScreen() {
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
              Create a new PG or flat to manage
            </Text>
          </Entrance>

          <Entrance trigger={1} delay={60}>
            <PropertyForm
              mode="create"
              onSuccess={(slug) => router.replace(`/properties/${slug}` as never)}
              onCancel={() => router.back()}
            />
          </Entrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
