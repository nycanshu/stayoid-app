import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon, HouseIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useProperty } from '../../../../lib/hooks/use-properties';
import { PropertyForm } from '../../../../components/properties/PropertyForm';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Entrance } from '../../../../components/animations';
import { THEME } from '../../../../lib/theme';

function EditFormSkeleton() {
  return (
    <View>
      <View className="bg-card border border-border rounded-xl p-4 mb-3 gap-[18px]">
        <Skeleton width={140} height={14} />
        <View className="gap-2">
          <Skeleton width={110} height={12} />
          <Skeleton width="100%" height={42} radius={10} />
        </View>
        <View className="gap-2">
          <Skeleton width={110} height={12} />
          <View className="flex-row gap-2.5">
            <Skeleton width="48%" height={92} radius={12} />
            <Skeleton width="48%" height={92} radius={12} />
          </View>
        </View>
        <View className="gap-2">
          <Skeleton width={70} height={12} />
          <Skeleton width="100%" height={80} radius={10} />
        </View>
      </View>

      <View className="gap-2 mb-5">
        <Skeleton width={70} height={11} />
        <Skeleton width="100%" height={140} radius={12} />
        <Skeleton width="80%" height={12} />
      </View>

      <View className="gap-2.5">
        <Skeleton width="100%" height={50} radius={12} />
        <Skeleton width="100%" height={48} radius={12} />
      </View>
    </View>
  );
}

function NotFoundState({ mutedFg }: { mutedFg: string }) {
  return (
    <View className="bg-card border border-border rounded-xl p-8 items-center">
      <View className="size-14 rounded-2xl bg-muted items-center justify-center mb-3.5">
        <HouseIcon size={26} color={mutedFg} weight="duotone" />
      </View>
      <Text
        className="text-foreground text-[15px] mb-1.5 text-center"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        Property not found
      </Text>
      <Text
        className="text-muted-foreground text-[13px] text-center leading-5 mb-[18px]"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        The property you're trying to edit doesn't exist or has been deleted.
      </Text>
      <Pressable
        onPress={() => router.replace('/(tabs)/properties')}
        android_ripple={null}
        className="bg-primary rounded-[10px] px-4 py-2.5"
      >
        <Text
          className="text-white text-[13px]"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Back to Properties
        </Text>
      </Pressable>
    </View>
  );
}

export default function EditPropertyScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: property, isLoading } = useProperty(slug);

  const goToDetail = () => router.replace(`/(tabs)/properties/${property?.slug ?? slug}`);

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
              Edit Property
            </Text>
            {isLoading ? (
              <View className="mt-1">
                <Skeleton width={200} height={14} />
              </View>
            ) : property ? (
              <Text
                numberOfLines={1}
                className="text-muted-foreground text-[13px] mt-0.5"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Editing{' '}
                <Text
                  className="text-foreground"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {property.name}
                </Text>
              </Text>
            ) : null}
          </Entrance>

          {isLoading ? (
            <Entrance trigger={1} delay={60}>
              <EditFormSkeleton />
            </Entrance>
          ) : !property ? (
            <Entrance trigger={1} delay={60}>
              <NotFoundState mutedFg={palette.mutedForeground} />
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
              />
            </Entrance>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
