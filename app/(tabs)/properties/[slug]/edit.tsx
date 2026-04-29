import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { HouseIcon } from 'phosphor-react-native';
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
        onPress={() => router.replace('/properties')}
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

  const goToDetail = () => router.replace(`/properties/${property?.slug ?? slug}`);

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
          {property && (
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
                  {property.name}
                </Text>
              </Text>
            </Entrance>
          )}

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
                onSuccess={(newSlug) => router.replace(`/properties/${newSlug}`)}
                onCancel={goToDetail}
              />
            </Entrance>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
