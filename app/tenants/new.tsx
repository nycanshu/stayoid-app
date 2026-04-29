import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { TenantForm } from '../../components/tenants/TenantForm';
import { Entrance } from '../../components/animations';
import { THEME } from '../../lib/theme';

export default function NewTenantScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { property: propertySlug } = useLocalSearchParams<{ property?: string }>();

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
              Add Tenant
            </Text>
            <Text
              className="text-muted-foreground text-[13px] mt-0.5"
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
            onSuccess={(slug) => router.replace(`/(tabs)/tenants/${slug}` as never)}
            onCancel={() => router.back()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
