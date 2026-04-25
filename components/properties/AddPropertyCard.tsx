import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { PlusIcon } from 'phosphor-react-native';
import type { AppColors } from '../../lib/theme/colors';

export function AddPropertyCard({ colors }: { colors: AppColors }) {
  return (
    <Pressable
      onPress={() => router.push('/(tabs)/properties/new')}
      android_ripple={null}
      style={{
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: colors.mutedBg,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <PlusIcon size={18} color={colors.mutedFg} weight="bold" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
          Add Property
        </Text>
        <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
          Create another PG or flat to manage
        </Text>
      </View>
    </Pressable>
  );
}
