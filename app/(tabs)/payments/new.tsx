import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useColors } from '../../../lib/hooks/use-colors';
import { PaymentForm } from '../../../components/payments/PaymentForm';
import { Entrance } from '../../../components/animations';

export default function RecordPaymentScreen() {
  const colors = useColors();
  const { tenant: tenantSlug } = useLocalSearchParams<{ tenant?: string }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <Entrance trigger={1} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Pressable
                onPress={() => router.back()}
                android_ripple={null}
                hitSlop={8}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  borderWidth: 1, borderColor: colors.border,
                  backgroundColor: colors.card,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ArrowLeftIcon size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <Text style={{
              color: colors.foreground,
              fontSize: 22, fontFamily: 'Inter_600SemiBold',
              letterSpacing: -0.3, paddingRight: 0.3,
            }}>
              Record Payment
            </Text>
            <Text style={{
              color: colors.mutedFg, fontSize: 13,
              fontFamily: 'Inter_400Regular', marginTop: 2,
            }}>
              {tenantSlug
                ? 'Tenant pre-selected — review and submit'
                : 'Select a tenant and confirm the details'}
            </Text>
          </Entrance>

          {/* ── Form ── */}
          <Entrance trigger={1} delay={60}>
            <PaymentForm
              preselectedTenantSlug={tenantSlug}
              onSuccess={() => router.replace('/(tabs)/payments')}
              onCancel={() => router.back()}
              colors={colors}
            />
          </Entrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
