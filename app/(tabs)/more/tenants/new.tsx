import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useColors } from '../../../../lib/hooks/use-colors';
import { TenantForm } from '../../../../components/tenants/TenantForm';
import { Entrance } from '../../../../components/animations';

export default function NewTenantScreen() {
  const colors = useColors();
  const { property: propertySlug } = useLocalSearchParams<{ property?: string }>();

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
              Add Tenant
            </Text>
            <Text style={{
              color: colors.mutedFg, fontSize: 13,
              fontFamily: 'Inter_400Regular', marginTop: 2,
            }}>
              {propertySlug
                ? 'Property pre-selected — pick a vacant slot'
                : 'Add a tenant and assign them to a vacant slot'}
            </Text>
          </Entrance>

          <TenantForm
            mode="create"
            lockedPropertySlug={propertySlug}
            onSuccess={(slug) => router.replace(`/(tabs)/more/tenants/${slug}` as never)}
            onCancel={() => router.back()}
            colors={colors}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
