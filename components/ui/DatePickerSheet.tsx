import {
  createContext, useContext, useState, useCallback, useEffect, useRef, useMemo,
  type ReactNode,
} from 'react';
import {
  Modal, View, Pressable, Platform, StyleSheet, Keyboard,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  CaretLeftIcon, CaretRightIcon, CalendarIcon,
} from 'phosphor-react-native';
import { Portal } from '@rn-primitives/portal';
import { useColorScheme } from 'nativewind';
import * as Haptics from '@/lib/utils/haptics';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';
import { useOverlayHost } from '@/components/ui/OverlayHost';

const log = logger('date-picker');

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
  minMonth?: number;
  minYear?: number;
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
  // Closed-over host name from the calling site — locks the render target
  // for THIS picker session even if the consumer unmounts/remounts.
  hostName?: string;
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
  hostName?: string;
  resolve: (val: { month: number; year: number } | null) => void;
};

type State = DateState | MonthState | null;

export function DatePickerProvider({ children }: { children: ReactNode }) {
  const { colorScheme } = useColorScheme();
  const scheme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = THEME[scheme];
  const [state, setState] = useState<State>(null);

  // We can't read context from inside `pickDate` because the consumer's
  // OverlayHost context changes per call site — but since pickDate IS called
  // from inside that consumer's tree, we capture the host via a ref-callback
  // wrapper. Implementation detail: the actual host is resolved by the hook
  // wrapper exposed below (useDatePicker), which reads context.
  const pickDate = useCallback((opts: PickDateOptions & { hostName?: string } = {}) => {
    log.debug('pickDate called', opts);
    // Dismiss any open keyboard so the picker doesn't fight for vertical space.
    Keyboard.dismiss();
    return new Promise<string | null>((resolve) => {
      const initial = opts.value ? fromISO(opts.value) : new Date();
      setState({
        kind: 'date',
        current: initial,
        minDate: opts.minDate ? fromISO(opts.minDate) : undefined,
        maxDate: opts.maxDate ? fromISO(opts.maxDate) : undefined,
        title: opts.title ?? 'Select date',
        hostName: opts.hostName,
        resolve,
      });
    });
  }, []);

  const pickMonth = useCallback((opts: PickMonthOptions & { hostName?: string } = {}) => {
    log.debug('pickMonth called', opts);
    Keyboard.dismiss();
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
        hostName: opts.hostName,
        resolve,
      });
    });
  }, []);

  const ctxValue = useMemo<Ctx>(() => ({
    pickDate, pickMonth,
  }), [pickDate, pickMonth]);

  const close = useCallback(() => setState(null), []);

  const body = state ? (
    <PickerBody
      state={state}
      palette={palette}
      scheme={scheme}
      onClose={close}
    />
  ) : null;

  return (
    <DatePickerContext.Provider value={ctxValue}>
      {children}
      {/*
        When the picker was triggered from inside a FormSheet, it provided a
        `hostName` — render via Portal into THAT FormSheet's PortalHost so the
        picker UI lives inside the FormSheet's Modal layer (avoids iOS double-
        Modal failure). Otherwise fall back to a top-level Modal.
      */}
      {state?.hostName ? (
        <Portal name={`date-picker-${state.hostName}`} hostName={state.hostName}>
          {body}
        </Portal>
      ) : (
        <Modal
          transparent
          visible={!!state}
          statusBarTranslucent
          animationType="fade"
          onRequestClose={() => {
            if (state) state.resolve(null);
            close();
          }}
        >
          {body}
        </Modal>
      )}
    </DatePickerContext.Provider>
  );
}

/** Wrapper hook injects the current OverlayHost so consumers don't have to. */
export function useDatePickerScoped(): Ctx {
  const raw = useContext(DatePickerContext);
  if (!raw) throw new Error('useDatePickerScoped must be used inside <DatePickerProvider>');
  const { hostName } = useOverlayHost();
  return useMemo<Ctx>(() => ({
    pickDate: (opts = {}) => raw.pickDate({ ...opts, hostName } as PickDateOptions),
    pickMonth: (opts = {}) => raw.pickMonth({ ...opts, hostName } as PickMonthOptions),
  }), [raw, hostName]);
}

function PickerBody({
  state, palette, scheme, onClose,
}: {
  state: NonNullable<State>;
  palette: typeof THEME.light;
  scheme: 'light' | 'dark';
  onClose: () => void;
}) {
  const cancel = () => {
    log.debug('picker cancelled');
    state.resolve(null);
    onClose();
  };

  // Android date dialog renders itself; just emit it bare.
  if (state.kind === 'date' && Platform.OS === 'android') {
    return (
      <DateBody state={state} palette={palette} scheme={scheme} onClose={onClose} />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { justifyContent: 'flex-end', zIndex: 9999 },
      ]}
    >
      <Pressable
        onPress={cancel}
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
      />
      <View
        style={{
          backgroundColor: palette.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: 28,
          paddingTop: 12,
        }}
      >
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
    </View>
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

  useEffect(() => {
    valueRef.current = state.current;
  }, [state.current]);

  const onChange = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === 'android') {
      log.debug('android datepicker event', { type: event.type, picked });
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
    log.debug('picker confirmed', { iso: toISO(valueRef.current) });
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

  useEffect(() => {
    setYear(state.year);
  }, [state.year]);

  const today = useMemo(() => new Date(), []);
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();

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
  // Hide the year stepper entirely when the bounds collapse to a single year —
  // showing two greyed-out chevrons looks like a UI bug.
  const yearLocked = !canPrevYear && !canNextYear;

  const cancel = () => {
    state.resolve(null);
    onClose();
  };

  const pick = (m: number) => {
    Haptics.selectionAsync();
    log.debug('month picked', { month: m, year });
    state.resolve({ month: m, year });
    onClose();
  };

  const subtitle = `Currently ${MONTH_NAMES[state.month - 1]} ${state.year}`;

  // "Today" jump — only valid if today's month/year is within bounds.
  const todayInBounds = minOk(todayMonth, todayYear) && maxOk(todayMonth, todayYear);
  const onToday = () => {
    if (!todayInBounds) return;
    Haptics.selectionAsync();
    state.resolve({ month: todayMonth, year: todayYear });
    onClose();
  };
  const showTodayBtn = todayInBounds
    && !(state.month === todayMonth && state.year === todayYear);

  return (
    <View>
      <View className="flex-row items-start justify-between px-4 mb-3">
        <Pressable onPress={cancel} hitSlop={8} android_ripple={null}>
          <Text
            className="text-muted-foreground text-[15px]"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Cancel
          </Text>
        </Pressable>
        <View className="items-center">
          <Text
            className="text-foreground text-[15px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {state.title}
          </Text>
          <Text
            className="text-muted-foreground text-[11px] mt-0.5"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {subtitle}
          </Text>
        </View>
        {showTodayBtn ? (
          <Pressable onPress={onToday} hitSlop={8} android_ripple={null}>
            <Text
              className="text-primary text-[15px]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Today
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      {yearLocked ? (
        <View className="flex-row items-center justify-center gap-2 mb-4">
          <CalendarIcon size={16} color={palette.mutedForeground} />
          <Text
            className="text-foreground text-[20px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {year}
          </Text>
        </View>
      ) : (
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
          <View className="flex-row items-center gap-2 min-w-[90px] justify-center">
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
      )}

      <View className="px-4 pb-2">
        <View className="flex-row flex-wrap">
          {MONTH_NAMES.map((label, i) => {
            const m = i + 1;
            const enabled = minOk(m, year) && maxOk(m, year);
            const selected = m === state.month && year === state.year;
            const isToday = m === todayMonth && year === todayYear;
            return (
              <View key={label} style={{ width: '33.333%', padding: 4 }}>
                <Pressable
                  onPress={() => enabled && pick(m)}
                  android_ripple={null}
                  disabled={!enabled}
                  className={cn(
                    'rounded-[10px] py-4 items-center border',
                    selected
                      ? 'bg-primary border-primary'
                      : isToday && enabled
                        ? 'bg-primary-bg border-primary'
                        : !enabled
                          ? 'bg-muted border-border'
                          : 'bg-card border-border',
                  )}
                  style={!enabled ? { opacity: 0.45 } : undefined}
                >
                  <Text
                    className={cn(
                      'text-[14px]',
                      selected ? 'text-white'
                        : isToday && enabled ? 'text-primary'
                          : 'text-foreground',
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
