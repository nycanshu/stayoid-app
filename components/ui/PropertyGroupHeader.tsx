import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CaretRightIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '../../lib/theme';

interface PropertyGroupHeaderProps {
  propertyName: string;
  /** Slug for deep-linking to the property detail screen. Optional — header is non-tappable when absent. */
  propertySlug?: string;
  /** Number of items in this group currently loaded. */
  count: number;
  /** Set to true on the first header so it doesn't get extra top margin. */
  isFirst?: boolean;
}

function PropertyGroupHeaderImpl({
  propertyName, propertySlug, count, isFirst,
}: PropertyGroupHeaderProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const Wrapper: typeof Pressable | typeof View = propertySlug ? Pressable : View;
  const wrapperProps = propertySlug
    ? {
      onPress: () => router.push(`/properties/${propertySlug}` as never),
      android_ripple: null,
      hitSlop: 4,
    }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as object)}
      style={{ marginTop: isFirst ? 0 : 8 }}
      className="flex-row items-center gap-2 px-1 py-1.5"
    >
      <Text
        numberOfLines={1}
        className="text-foreground text-[13px] uppercase tracking-wide flex-shrink"
        style={{ fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 }}
      >
        {propertyName}
      </Text>
      <Text
        className="text-muted-foreground text-[11px]"
        style={{ fontFamily: 'Inter_500Medium' }}
      >
        · {count}
      </Text>
      <View className="flex-1" />
      {propertySlug ? (
        <CaretRightIcon size={14} color={palette.mutedForeground} weight="bold" />
      ) : null}
    </Wrapper>
  );
}

export const PropertyGroupHeader = memo(PropertyGroupHeaderImpl);
