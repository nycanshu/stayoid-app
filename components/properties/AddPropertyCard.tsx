import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { PlusIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '../../lib/theme';

export function AddPropertyCard() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/properties/new')}
      android_ripple={null}
      className="border-[1.5px] border-dashed border-border rounded-xl p-3.5 flex-row items-center gap-3"
    >
      <View className="size-9 rounded-[10px] bg-muted items-center justify-center">
        <PlusIcon size={18} color={palette.mutedForeground} weight="bold" />
      </View>
      <View className="flex-1">
        <Text
          className="text-foreground text-sm"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Add Property
        </Text>
        <Text
          className="text-muted-foreground text-[11px] mt-0.5"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Create another PG or flat to manage
        </Text>
      </View>
    </Pressable>
  );
}
