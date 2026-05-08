import {
  createContext, useContext, useState, useCallback, useRef, useMemo,
  type ReactNode,
} from 'react';
import {
  Modal, View, Pressable, Platform,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  CaretLeftIcon, CaretRightIcon, CalendarIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import * as Haptics from '@/lib/utils/haptics';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function toISO(d: Date): string {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function fromISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export interface PickDateOptions {
  value?: string;
  minDate?: string;
  maxDate?: string;
  title?: string;
}

export interface PickMonthOptions {
  month?: number;
  year?: number;
  /** Inclusive lower bound; e.g. tenant join month. */
  minMonth?: number;
  minYear?: number;
  /** Inclusive upper bound; defaults to current month. */
  maxMonth?: number;
  maxYear?: number;
  title?: string;
}

interface Ctx {
  pickDate: (opts?: PickDateOptions) => Promise<string | null>;
  pickMonth: (opts?: PickMonthOptions) => Promise<{ month: number; year: number } | null>;
}

const DatePickerContext = createContext<Ctx | null>(null);

export function useDatePicker() {
  const ctx = useContext(DatePickerContext);
  if (!ctx) throw new Error('useDatePicker must be used inside <DatePickerProvider>');
  return ctx;
}

type DateState = {
  kind: 'date';
  current: Date;
  minDate?: Date;
  maxDate?: Date;
  title: string;
  resolve: (iso: string | null) => void;
};

type MonthState = {
  kind: 'month';
  month: number;
  year: number;
  minMonth?: number;
  minYear?: number;
  maxMonth?: number;
  maxYear?: number;
  title: string;
  resolve: (val: { month: number; year: number } | null) => void;
};

type State = DateState | MonthState | null;

export function DatePickerProvider({ children }: { children: ReactNode }) {
  const { colorScheme } = useColorScheme();
  const scheme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = THEME[scheme];
  const [state, setState] = useState<State>(null);

  const pickDate = useCallback((opts: PickDateOptions = {}) => {
    return new Promise<string | null>((resolve) => {
      const initial = opts.value ? fromISO(opts.value) : new Date();
      setState({
        kind: 'date',
        current: initial,
        minDate: opts.minDate ? fromISO(opts.minDate) : undefined,
        maxDate: opts.maxDate ? fromISO(opts.maxDate) : undefined,
        title: opts.title ?? 'Select date',
        resolve,
      });
    });
  }, []);

  const pickMonth = useCallback((opts: PickMonthOptions = {}) => {
    return new Promise<{ month: number; year: number } | null>((resolve) => {
      const now = new Date();
      setState({
        kind: 'month',
        month: opts.month ?? now.getMonth() + 1,
        year: opts.year ?? now.getFullYear(),
        minMonth: opts.minMonth,
        minYear: opts.minYear,
        maxMonth: opts.maxMonth ?? now.getMonth() + 1,
        maxYear: opts.maxYear ?? now.getFullYear(),
        title: opts.title ?? 'Select month',
        resolve,
      });
    });
  }, []);

  const ctxValue = useMemo<Ctx>(() => ({ pickDate, pickMonth }), [pickDate, pickMonth]);

  return (
    <DatePickerContext.Provider value={ctxValue}>
      {children}
      {state && (
        <PickerModal
          state={state}
          palette={palette}
          scheme={scheme}
          onClose={() => setState(null)}
        />
      )}
    </DatePickerContext.Provider>
  );
}

function PickerModal({
  state, palette, scheme, onClose,
}: {
  state: NonNullable<State>;
  palette: typeof THEME.light;
  scheme: 'light' | 'dark';
  onClose: () => void;
}) {
  const visible = true;

  const cancel = () => {
    state.resolve(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cancel}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={cancel}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
          <Pressable onPress={() => { /* swallow */ }}>
            <View
              style={{
                backgroundColor: palette.card,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: 28,
                paddingTop: 12,
              }}
            >
              {/* grabber */}
              <View
                style={{
                  alignSelf: 'center',
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: palette.border,
                  marginBottom: 12,
                }}
              />

              {state.kind === 'date'
                ? <DateBody state={state} palette={palette} scheme={scheme} onClose={onClose} />
                : <MonthBody state={state} palette={palette} onClose={onClose} />
              }
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

function DateBody({
  state, palette, scheme, onClose,
}: {
  state: DateState;
  palette: typeof THEME.light;
  scheme: 'light' | 'dark';
  onClose: () => void;
}) {
  const valueRef = useRef<Date>(state.current);
  const [, force] = useState(0);

  const onChange = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === 'android') {
      // Android picker is a native modal — `set` means user tapped OK.
      if (event.type === 'set' && picked) {
        state.resolve(toISO(picked));
      } else {
        state.resolve(null);
      }
      onClose();
      return;
    }
    if (picked) {
      valueRef.current = picked;
      force((n) => n + 1);
    }
  };

  const confirm = () => {
    Haptics.selectionAsync();
    state.resolve(toISO(valueRef.current));
    onClose();
  };

  const cancel = () => {
    state.resolve(null);
    onClose();
  };

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={state.current}
        mode="date"
        display="default"
        minimumDate={state.minDate}
        maximumDate={state.maxDate}
        onChange={onChange}
      />
    );
  }

  return (
    <View>
      <View className="flex-row items-center justify-between px-4 mb-1">
        <Pressable onPress={cancel} hitSlop={8} android_ripple={null}>
          <Text
            className="text-muted-foreground text-[15px]"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Cancel
          </Text>
        </Pressable>
        <Text
          className="text-foreground text-[15px]"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {state.title}
        </Text>
        <Pressable onPress={confirm} hitSlop={8} android_ripple={null}>
          <Text
            className="text-primary text-[15px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            Done
          </Text>
        </Pressable>
      </View>
      <DateTimePicker
        value={valueRef.current}
        mode="date"
        display="inline"
        minimumDate={state.minDate}
        maximumDate={state.maxDate}
        themeVariant={scheme}
        accentColor={palette.primary}
        onChange={onChange}
      />
    </View>
  );
}

function MonthBody({
  state, palette, onClose,
}: {
  state: MonthState;
  palette: typeof THEME.light;
  onClose: () => void;
}) {
  const [year, setYear] = useState(state.year);

  const minOk = (m: number, y: number) => {
    if (state.minYear == null) return true;
    if (y > state.minYear) return true;
    if (y < state.minYear) return false;
    return state.minMonth == null || m >= state.minMonth;
  };
  const maxOk = (m: number, y: number) => {
    if (state.maxYear == null) return true;
    if (y < state.maxYear) return true;
    if (y > state.maxYear) return false;
    return state.maxMonth == null || m <= state.maxMonth;
  };

  const canPrevYear = state.minYear == null || year > state.minYear;
  const canNextYear = state.maxYear == null || year < state.maxYear;

  const cancel = () => {
    state.resolve(null);
    onClose();
  };

  const pick = (m: number) => {
    Haptics.selectionAsync();
    state.resolve({ month: m, year });
    onClose();
  };

  return (
    <View>
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Pressable onPress={cancel} hitSlop={8} android_ripple={null}>
          <Text
            className="text-muted-foreground text-[15px]"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Cancel
          </Text>
        </Pressable>
        <Text
          className="text-foreground text-[15px]"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {state.title}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Year stepper */}
      <View className="flex-row items-center justify-center gap-6 mb-4">
        <Pressable
          onPress={() => canPrevYear && setYear((y) => y - 1)}
          android_ripple={null}
          hitSlop={8}
          disabled={!canPrevYear}
          className={cn(
            'size-10 items-center justify-center rounded-full',
            !canPrevYear && 'opacity-30',
          )}
        >
          <CaretLeftIcon size={18} color={palette.foreground} weight="bold" />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <CalendarIcon size={16} color={palette.mutedForeground} />
          <Text
            className="text-foreground text-[20px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {year}
          </Text>
        </View>
        <Pressable
          onPress={() => canNextYear && setYear((y) => y + 1)}
          android_ripple={null}
          hitSlop={8}
          disabled={!canNextYear}
          className={cn(
            'size-10 items-center justify-center rounded-full',
            !canNextYear && 'opacity-30',
          )}
        >
          <CaretRightIcon size={18} color={palette.foreground} weight="bold" />
        </Pressable>
      </View>

      {/* Month grid */}
      <View className="px-4 pb-2">
        <View className="flex-row flex-wrap">
          {MONTH_NAMES.map((label, i) => {
            const m = i + 1;
            const enabled = minOk(m, year) && maxOk(m, year);
            const selected = m === state.month && year === state.year;
            return (
              <View key={label} style={{ width: '33.333%', padding: 4 }}>
                <Pressable
                  onPress={() => enabled && pick(m)}
                  android_ripple={null}
                  disabled={!enabled}
                  className={cn(
                    'rounded-[10px] py-3.5 items-center border',
                    selected ? 'bg-primary border-primary' : 'bg-card border-border',
                    !enabled && 'opacity-30',
                  )}
                >
                  <Text
                    className={cn(
                      'text-[14px]',
                      selected ? 'text-white' : 'text-foreground',
                    )}
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    {label}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
