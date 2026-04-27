import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { PaymentForm } from '../../../components/payments/PaymentForm';
import { Entrance } from '../../../components/animations';
import { THEME } from '../../../lib/theme';

export default function RecordPaymentScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { tenant: tenantSlug } = useLocalSearchParams<{ tenant?: string }>();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Entrance trigger={1} style={{ marginBottom: 20 }}>
            <View className="flex-row items-center mb-3.5">
              <Pressable
                onPress={() => router.back()}
                android_ripple={null}
                hitSlop={8}
                className="size-10 rounded-[10px] border border-border bg-card items-center justify-center"
              >
                <ArrowLeftIcon size={18} color={palette.foreground} />
              </Pressable>
            </View>

            <Text
              className="text-foreground text-[22px] tracking-tight"
              style={{ fontFamily: 'Inter_600SemiBold', paddingRight: 0.3 }}
            >
              Record Payment
            </Text>
            <Text
              className="text-muted-foreground text-[13px] mt-0.5"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {tenantSlug
                ? 'Tenant pre-selected — review and submit'
                : 'Select a tenant and confirm the details'}
            </Text>
          </Entrance>

          <Entrance trigger={1} delay={60}>
            <PaymentForm
              preselectedTenantSlug={tenantSlug}
              onSuccess={() => router.replace('/(tabs)/payments')}
              onCancel={() => router.back()}
            />
          </Entrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
