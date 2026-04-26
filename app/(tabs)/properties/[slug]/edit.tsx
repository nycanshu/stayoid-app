import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon, HouseIcon } from 'phosphor-react-native';
import { useColors } from '../../../../lib/hooks/use-colors';
import { useProperty } from '../../../../lib/hooks/use-properties';
import { PropertyForm } from '../../../../components/properties/PropertyForm';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Entrance } from '../../../../components/animations';
import type { AppColors } from '../../../../lib/theme/colors';

// ── Edit form skeleton — matches PropertyForm shape ───────────────────────────
function EditFormSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View>
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16, marginBottom: 12, gap: 18,
      }}>
        <Skeleton width={140} height={14} />
        {/* Name */}
        <View style={{ gap: 8 }}>
          <Skeleton width={110} height={12} />
          <Skeleton width="100%" height={42} radius={10} />
        </View>
        {/* Type */}
        <View style={{ gap: 8 }}>
          <Skeleton width={110} height={12} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Skeleton width="48%" height={92} radius={12} />
            <Skeleton width="48%" height={92} radius={12} />
          </View>
        </View>
        {/* Address */}
        <View style={{ gap: 8 }}>
          <Skeleton width={70} height={12} />
          <Skeleton width="100%" height={80} radius={10} />
        </View>
      </View>

      {/* Preview placeholder */}
      <View style={{ gap: 8, marginBottom: 20 }}>
        <Skeleton width={70} height={11} />
        <Skeleton width="100%" height={140} radius={12} />
        <Skeleton width="80%" height={12} />
      </View>

      {/* Actions */}
      <View style={{ gap: 10 }}>
        <Skeleton width="100%" height={50} radius={12} />
        <Skeleton width="100%" height={48} radius={12} />
      </View>
    </View>
  );
}

// ── Not-found state ───────────────────────────────────────────────────────────
function NotFoundState({ colors }: { colors: AppColors }) {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 32,
      alignItems: 'center',
    }}>
      <View style={{
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: colors.mutedBg,
        alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      }}>
        <HouseIcon size={26} color={colors.mutedFg} weight="duotone" />
      </View>
      <Text style={{
        color: colors.foreground, fontSize: 15,
        fontFamily: 'Inter_600SemiBold', marginBottom: 6, textAlign: 'center',
      }}>
        Property not found
      </Text>
      <Text style={{
        color: colors.mutedFg, fontSize: 13,
        fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20, marginBottom: 18,
      }}>
        The property you're trying to edit doesn't exist or has been deleted.
      </Text>
      <Pressable
        onPress={() => router.replace('/(tabs)/properties')}
        android_ripple={null}
        style={{
          backgroundColor: colors.primary, borderRadius: 10,
          paddingHorizontal: 16, paddingVertical: 10,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
          Back to Properties
        </Text>
      </Pressable>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function EditPropertyScreen() {
  const colors = useColors();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: property, isLoading } = useProperty(slug);

  const goToDetail = () => router.replace(`/(tabs)/properties/${property?.slug ?? slug}`);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
              Edit Property
            </Text>
            {isLoading ? (
              <View style={{ marginTop: 4 }}>
                <Skeleton width={200} height={14} />
              </View>
            ) : property ? (
              <Text
                numberOfLines={1}
                style={{
                  color: colors.mutedFg, fontSize: 13,
                  fontFamily: 'Inter_400Regular', marginTop: 2,
                }}
              >
                Editing{' '}
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>
                  {property.name}
                </Text>
              </Text>
            ) : null}
          </Entrance>

          {/* ── Body ── */}
          {isLoading ? (
            <Entrance trigger={1} delay={60}>
              <EditFormSkeleton colors={colors} />
            </Entrance>
          ) : !property ? (
            <Entrance trigger={1} delay={60}>
              <NotFoundState colors={colors} />
            </Entrance>
          ) : (
            <Entrance trigger={1} delay={60}>
              <PropertyForm
                mode="edit"
                slug={property.slug}
                defaultValues={{
                  name: property.name,
                  property_type: property.property_type,
                  address: property.address,
                }}
                onSuccess={(newSlug) => router.replace(`/(tabs)/properties/${newSlug}`)}
                onCancel={goToDetail}
                colors={colors}
              />
            </Entrance>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
