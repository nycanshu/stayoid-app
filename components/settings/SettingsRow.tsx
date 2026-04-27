import { View, Text, Pressable, Switch } from 'react-native';
import { CaretRightIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';

interface BaseProps {
  Icon?: React.ComponentType<{ size: number; color: string; weight?: any }>;
  iconBg?: string;
  iconColor?: string;
  label: string;
  description?: string;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

interface NavRowProps extends BaseProps {
  type: 'nav';
  value?: string;
  onPress: () => void;
}

interface SwitchRowProps extends BaseProps {
  type: 'switch';
  value: boolean;
  onValueChange: (v: boolean) => void;
}

interface TextRowProps extends BaseProps {
  type: 'text';
  value: string;
}

type SettingsRowProps = NavRowProps | SwitchRowProps | TextRowProps;

export function SettingsRow(props: SettingsRowProps) {
  const { Icon, iconBg, iconColor, label, description, destructive, isFirst } = props;
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const content = (
    <View
      className={cn(
        'flex-row items-center gap-3 px-3.5 py-3',
        !isFirst && 'border-t border-border',
      )}
    >
      {Icon && (
        <View
          style={iconBg ? { backgroundColor: iconBg } : undefined}
          className={cn(
            'size-8 rounded-lg items-center justify-center',
            !iconBg && 'bg-muted',
          )}
        >
          <Icon size={16} color={iconColor ?? palette.mutedForeground} weight="duotone" />
        </View>
      )}
      <View className="flex-1 min-w-0">
        <Text
          numberOfLines={1}
          className={cn(
            'text-sm',
            destructive ? 'text-destructive' : 'text-foreground',
          )}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {label}
        </Text>
        {description && (
          <Text
            className="text-muted-foreground text-[11px] mt-0.5"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {description}
          </Text>
        )}
      </View>
      {props.type === 'nav' && (
        <View className="flex-row items-center gap-1.5">
          {props.value && (
            <Text
              className="text-muted-foreground text-xs"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {props.value}
            </Text>
          )}
          <CaretRightIcon size={13} color={palette.mutedForeground} />
        </View>
      )}
      {props.type === 'switch' && (
        <Switch
          value={props.value}
          onValueChange={props.onValueChange}
          trackColor={{ false: palette.muted, true: `${palette.primary}88` }}
          thumbColor={props.value ? palette.primary : palette.mutedForeground}
          ios_backgroundColor={palette.muted}
        />
      )}
      {props.type === 'text' && (
        <Text
          className="text-muted-foreground text-xs"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {props.value}
        </Text>
      )}
    </View>
  );

  if (props.type === 'nav') {
    return (
      <Pressable onPress={props.onPress} android_ripple={null}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function SettingsSection({
  title, children,
}: { title?: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      {title && (
        <Text
          className="text-muted-foreground text-[11px] uppercase tracking-[1px] mb-2 px-1"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {title}
        </Text>
      )}
      <View className="bg-card border border-border rounded-xl overflow-hidden">
        {children}
      </View>
    </View>
  );
}
