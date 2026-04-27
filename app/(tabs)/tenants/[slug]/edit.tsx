import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon, UserIcon } from 'phosphor-react-native';
import { useColors } from '../../../../lib/hooks/use-colors';
import { useTenant } from '../../../../lib/hooks/use-tenants';
import { TenantForm } from '../../../../components/tenants/TenantForm';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Entrance } from '../../../../components/animations';
import type { AppColors } from '../../../../lib/theme/colors';

// ── Edit form skeleton — matches TenantForm shape ─────────────────────────────
function EditFormSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View>
      {/* 7 sections, each a card */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={{
          backgroundColor: colors.card,
          borderWidth: 1, borderColor: colors.border,
          borderRadius: 12, padding: 16, marginBottom: 12, gap: 12,
        }}>
          <Skeleton width={140} height={14} />
          <Skeleton width="100%" height={42} radius={10} />
          {i % 2 === 1 && <Skeleton width="100%" height={42} radius={10} />}
        </View>
      ))}
      {/* Actions */}
      <View style={{ gap: 10 }}>
        <Skeleton width="100%" height={50} radius={12} />
        <Skeleton width="100%" height={48} radius={12} />
      </View>
    </View>
  );
}

// ── Not-found state ───────────────────────────────────────────────────────────
function NotFound({ colors }: { colors: AppColors }) {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 32, alignItems: 'center',
    }}>
      <View style={{
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: colors.mutedBg,
        alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      }}>
        <UserIcon size={26} color={colors.mutedFg} weight="duotone" />
      </View>
      <Text style={{
        color: colors.foreground, fontSize: 15,
        fontFamily: 'Inter_600SemiBold', marginBottom: 6, textAlign: 'center',
      }}>
        Tenant not found
      </Text>
      <Text style={{
        color: colors.mutedFg, fontSize: 13,
        fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20, marginBottom: 18,
      }}>
        The tenant you're trying to edit doesn't exist or has been deleted.
      </Text>
      <Pressable
        onPress={() => router.replace('/(tabs)/tenants')}
        android_ripple={null}
        style={{
          backgroundColor: colors.primary, borderRadius: 10,
          paddingHorizontal: 16, paddingVertical: 10,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
          Back to Tenants
        </Text>
      </Pressable>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function EditTenantScreen() {
  const colors = useColors();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: tenant, isLoading } = useTenant(slug);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              Edit Tenant
            </Text>
            {isLoading ? (
              <View style={{ marginTop: 4 }}>
                <Skeleton width={200} height={14} />
              </View>
            ) : tenant ? (
              <Text
                numberOfLines={1}
                style={{
                  color: colors.mutedFg, fontSize: 13,
                  fontFamily: 'Inter_400Regular', marginTop: 2,
                }}
              >
                Editing{' '}
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>
                  {tenant.name}
                </Text>
              </Text>
            ) : null}
          </Entrance>

          {/* ── Body ── */}
          {isLoading ? (
            <Entrance trigger={1} delay={60}>
              <EditFormSkeleton colors={colors} />
            </Entrance>
          ) : !tenant ? (
            <Entrance trigger={1} delay={60}>
              <NotFound colors={colors} />
            </Entrance>
          ) : (
            <TenantForm
              mode="edit"
              tenant={tenant}
              onSuccess={(newSlug) => router.replace(`/(tabs)/tenants/${newSlug}` as never)}
              onCancel={() => router.back()}
              colors={colors}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
