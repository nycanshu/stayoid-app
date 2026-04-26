import { View, Text, Pressable } from 'react-native';
import type { AppColors } from '../../lib/theme/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  Icon: React.FC<{ size: number; color: string; weight?: any }>;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  /** When set, the card becomes a tap target that drills into the matching list view. */
  onPress?: () => void;
  colors: AppColors;
}

/** Single stat card: colored icon chip on top, label, value, sub-label.
 *  When `onPress` is provided, the whole card is pressable. */
export function StatCard({
  title, value, description, Icon, iconBg, iconColor, valueColor, onPress, colors,
}: StatCardProps) {
  const Wrapper: any = onPress ? Pressable : View;
  const wrapperProps = onPress ? { onPress, android_ripple: null } : {};
  return (
    <Wrapper {...wrapperProps} style={{
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 14,
    }}>
      <View style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: iconBg,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
      }}>
        <Icon size={18} color={iconColor} weight="fill" />
      </View>
      <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 }}>
        {title}
      </Text>
      <Text style={{
        color: valueColor ?? colors.foreground,
        fontSize: 18, fontFamily: 'Inter_600SemiBold', marginBottom: 2,
      }}>
        {value}
      </Text>
      <Text
        numberOfLines={1}
        style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}
      >
        {description}
      </Text>
    </Wrapper>
  );
}
