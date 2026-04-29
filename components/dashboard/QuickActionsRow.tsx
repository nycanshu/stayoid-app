import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  CurrencyCircleDollarIcon, UserPlusIcon, BuildingsIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { useRecordPaymentSheet } from '@/components/payments/RecordPaymentSheet';
import { THEME } from '@/lib/theme';

interface ActionChipProps {
  Icon: React.ComponentType<{ size: number; color: string; weight?: any }>;
  label: string;
  iconBg: string;
  iconColor: string;
  onPress: () => void;
}

function ActionChip({ Icon, label, iconBg, iconColor, onPress }: ActionChipProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      android_ripple={null}
      hitSlop={4}
      className="flex-1 bg-card border border-border rounded-xl p-3 items-center gap-2"
    >
      <View
        style={{ backgroundColor: iconBg }}
        className="size-10 rounded-[10px] items-center justify-center"
      >
        <Icon size={18} color={iconColor} weight="duotone" />
      </View>
      <Text
        numberOfLines={1}
        className="text-foreground text-[12px] text-center"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function QuickActionsRow() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { open: openPaymentSheet } = useRecordPaymentSheet();

  return (
    <View className="flex-row gap-2.5">
      <ActionChip
        Icon={CurrencyCircleDollarIcon}
        label="Record Payment"
        iconBg={palette.successBg}
        iconColor={palette.success}
        onPress={() => openPaymentSheet()}
      />
      <ActionChip
        Icon={UserPlusIcon}
        label="Add Tenant"
        iconBg={palette.primaryBg}
        iconColor={palette.primary}
        onPress={() => router.push('/tenants/new' as never)}
      />
      <ActionChip
        Icon={BuildingsIcon}
        label="Add Property"
        iconBg={palette.infoBg}
        iconColor={palette.info}
        onPress={() => router.push('/properties/new' as never)}
      />
    </View>
  );
}
