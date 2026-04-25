import { View, Text, Pressable, Alert } from 'react-native';
import { CaretLeftIcon, CaretRightIcon, CalendarIcon } from 'phosphor-react-native';
import { formatMonthYear } from '../../lib/utils/formatters';
import type { AppColors } from '../../lib/theme/colors';

interface MonthNavigatorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  colors: AppColors;
}

export function MonthNavigator({ month, year, onChange, colors }: MonthNavigatorProps) {
  const now = new Date();
  const isCurrent = month === now.getMonth() + 1 && year === now.getFullYear();

  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const next = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const openMonthPicker = () => {
    const buttons = [
      { text: 'This month', onPress: () => onChange(now.getMonth() + 1, now.getFullYear()) },
      { text: 'Last month', onPress: () => {
        const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        onChange(d.getMonth() + 1, d.getFullYear());
      } },
      { text: '2 months ago', onPress: () => {
        const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        onChange(d.getMonth() + 1, d.getFullYear());
      } },
      { text: '3 months ago', onPress: () => {
        const d = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        onChange(d.getMonth() + 1, d.getFullYear());
      } },
      { text: 'Cancel', style: 'cancel' as const },
    ];
    Alert.alert('Jump to month', undefined, buttons);
  };

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 6,
    }}>
      <Pressable
        onPress={prev}
        android_ripple={null}
        hitSlop={6}
        style={{
          width: 36, height: 36, borderRadius: 8,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: colors.mutedBg,
        }}
      >
        <CaretLeftIcon size={16} color={colors.foreground} weight="bold" />
      </Pressable>

      <Pressable
        onPress={openMonthPicker}
        android_ripple={null}
        style={{
          flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          paddingVertical: 8,
        }}
      >
        <CalendarIcon size={14} color={colors.mutedFg} />
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
          {formatMonthYear(month, year)}
        </Text>
        {isCurrent && (
          <View style={{
            backgroundColor: colors.successBg, borderRadius: 99,
            paddingHorizontal: 6, paddingVertical: 1,
          }}>
            <Text style={{ color: colors.success, fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>
              Now
            </Text>
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={next}
        android_ripple={null}
        hitSlop={6}
        style={{
          width: 36, height: 36, borderRadius: 8,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: colors.mutedBg,
        }}
      >
        <CaretRightIcon size={16} color={colors.foreground} weight="bold" />
      </Pressable>
    </View>
  );
}
