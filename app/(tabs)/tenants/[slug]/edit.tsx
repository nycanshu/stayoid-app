import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { UserIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useTenant } from '../../../../lib/hooks/use-tenants';
import { TenantForm } from '../../../../components/tenants/TenantForm';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Entrance } from '../../../../components/animations';
import { THEME } from '../../../../lib/theme';

function EditFormSkeleton() {
  return (
    <View>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <View
          key={i}
          className="bg-card border border-border rounded-xl p-4 mb-3 gap-3"
        >
          <Skeleton width={140} height={14} />
          <Skeleton width="100%" height={42} radius={10} />
          {i % 2 === 1 && <Skeleton width="100%" height={42} radius={10} />}
        </View>
      ))}
      <View className="gap-2.5">
        <Skeleton width="100%" height={50} radius={12} />
        <Skeleton width="100%" height={48} radius={12} />
      </View>
    </View>
  );
}

function NotFound({ mutedFg }: { mutedFg: string }) {
  return (
    <View className="bg-card border border-border rounded-xl p-8 items-center">
      <View className="size-14 rounded-2xl bg-muted items-center justify-center mb-3.5">
        <UserIcon size={26} color={mutedFg} weight="duotone" />
      </View>
      <Text
        className="text-foreground text-[15px] mb-1.5 text-center"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        Tenant not found
      </Text>
      <Text
        className="text-muted-foreground text-[13px] text-center leading-5 mb-[18px]"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        The tenant you're trying to edit doesn't exist or has been deleted.
      </Text>
      <Pressable
        onPress={() => router.replace('/tenants')}
        android_ripple={null}
        className="bg-primary rounded-[10px] px-4 py-2.5"
      >
        <Text
          className="text-white text-[13px]"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Back to Tenants
        </Text>
      </Pressable>
    </View>
  );
}

export default function EditTenantScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: tenant, isLoading } = useTenant(slug);

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
          {tenant && (
            <Entrance trigger={1} style={{ marginBottom: 16 }}>
              <Text
                numberOfLines={1}
                className="text-muted-foreground text-[13px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Editing{' '}
                <Text
                  className="text-foreground"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {tenant.name}
                </Text>
              </Text>
            </Entrance>
          )}

          {isLoading ? (
            <Entrance trigger={1} delay={60}>
              <EditFormSkeleton />
            </Entrance>
          ) : !tenant ? (
            <Entrance trigger={1} delay={60}>
              <NotFound mutedFg={palette.mutedForeground} />
            </Entrance>
          ) : (
            <TenantForm
              mode="edit"
              tenant={tenant}
              onSuccess={(newSlug) => router.replace(`/tenants/${newSlug}` as never)}
              onCancel={() => router.back()}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
