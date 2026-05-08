import { View, Text, Pressable } from 'react-native';
import { CaretLeftIcon, CaretRightIcon, CalendarIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { formatMonthYear } from '../../lib/utils/formatters';
import { useDatePickerScoped } from '../ui/DatePickerSheet';
import { THEME } from '../../lib/theme';

interface MonthNavigatorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthNavigator({ month, year, onChange }: MonthNavigatorProps) {
  const { pickMonth } = useDatePickerScoped();
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const now = new Date();
  const isCurrent = month === now.getMonth() + 1 && year === now.getFullYear();

  // Future months wouldn't have any payments yet, so cap at the current month.
  // No lower bound — let the user scrub back through historical data freely.
  const maxMonth = now.getMonth() + 1;
  const maxYear = now.getFullYear();

  const isCurrentBound = month === maxMonth && year === maxYear;

  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const next = () => {
    if (isCurrentBound) return;
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const openMonthPicker = async () => {
    const result = await pickMonth({
      title: 'Jump to month',
      month, year,
      maxMonth, maxYear,
    });
    if (result) onChange(result.month, result.year);
  };

  return (
    <View className="flex-row items-center gap-1.5 bg-card border border-border rounded-xl p-1.5">
      <Pressable
        onPress={prev}
        android_ripple={null}
        hitSlop={6}
        className="size-9 rounded-lg items-center justify-center bg-muted"
      >
        <CaretLeftIcon size={16} color={palette.foreground} weight="bold" />
      </Pressable>

      <Pressable
        onPress={openMonthPicker}
        android_ripple={null}
        className="flex-1 flex-row items-center justify-center gap-2 py-2"
      >
        <CalendarIcon size={14} color={palette.mutedForeground} />
        <Text
          className="text-foreground text-sm"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {formatMonthYear(month, year)}
        </Text>
        {isCurrent && (
          <View className="bg-success-bg rounded-full px-1.5 py-px">
            <Text
              className="text-success text-[10px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Now
            </Text>
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={next}
        android_ripple={null}
        hitSlop={6}
        disabled={isCurrentBound}
        className="size-9 rounded-lg items-center justify-center bg-muted"
        style={isCurrentBound ? { opacity: 0.4 } : undefined}
      >
        <CaretRightIcon size={16} color={palette.foreground} weight="bold" />
      </Pressable>
    </View>
  );
}
