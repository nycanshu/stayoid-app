import { View, Text, Pressable, Switch } from 'react-native';
import { CaretRightIcon } from 'phosphor-react-native';
import type { AppColors } from '../../lib/theme/colors';

interface BaseProps {
  Icon?: React.ComponentType<{ size: number; color: string; weight?: any }>;
  iconBg?: string;
  iconColor?: string;
  label: string;
  description?: string;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  colors: AppColors;
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
  const { Icon, iconBg, iconColor, label, description, destructive, isFirst, isLast, colors } = props;
  const fg = destructive ? colors.danger : colors.foreground;

  const content = (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 12,
      borderTopWidth: isFirst ? 0 : 1, borderTopColor: colors.border,
    }}>
      {Icon && (
        <View style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: iconBg ?? colors.mutedBg,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={iconColor ?? colors.mutedFg} weight="duotone" />
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{ color: fg, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}
          >
            {description}
          </Text>
        )}
      </View>
      {props.type === 'nav' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {props.value && (
            <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
              {props.value}
            </Text>
          )}
          <CaretRightIcon size={13} color={colors.mutedFg} />
        </View>
      )}
      {props.type === 'switch' && (
        <Switch
          value={props.value}
          onValueChange={props.onValueChange}
          trackColor={{ false: colors.mutedBg, true: `${colors.primary}88` }}
          thumbColor={props.value ? colors.primary : colors.mutedFg}
          ios_backgroundColor={colors.mutedBg}
        />
      )}
      {props.type === 'text' && (
        <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
          {props.value}
        </Text>
      )}
    </View>
  );

  if (props.type === 'nav') {
    return (
      <Pressable
        onPress={props.onPress}
        android_ripple={null}
        style={{
          backgroundColor: 'transparent',
          borderBottomLeftRadius: isLast ? 11 : 0,
          borderBottomRightRadius: isLast ? 11 : 0,
          borderTopLeftRadius: isFirst ? 11 : 0,
          borderTopRightRadius: isFirst ? 11 : 0,
        }}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

// ── Section card wrapper ──────────────────────────────────────────────────────
export function SettingsSection({
  title, colors, children,
}: { title?: string; colors: AppColors; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      {title && (
        <Text style={{
          color: colors.mutedFg, fontSize: 11,
          fontFamily: 'Inter_600SemiBold', letterSpacing: 1,
          textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 4,
        }}>
          {title}
        </Text>
      )}
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, overflow: 'hidden',
      }}>
        {children}
      </View>
    </View>
  );
}
