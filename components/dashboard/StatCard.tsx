import { View, Text, Pressable } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  Icon: React.FC<{ size: number; color: string; weight?: any }>;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  onPress?: () => void;
}

export function StatCard({
  title, value, description, Icon, iconBg, iconColor, valueColor, onPress,
}: StatCardProps) {
  const Wrapper: any = onPress ? Pressable : View;
  const wrapperProps = onPress ? { onPress, android_ripple: null } : {};
  return (
    <Wrapper
      {...wrapperProps}
      className="flex-1 bg-card border border-border rounded-xl p-3.5"
    >
      <View
        style={{ backgroundColor: iconBg }}
        className="size-9 rounded-[10px] items-center justify-center mb-2.5"
      >
        <Icon size={18} color={iconColor} weight="fill" />
      </View>
      <Text
        className="text-muted-foreground text-[11px] mb-0.5"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {title}
      </Text>
      <Text
        className="text-lg mb-0.5 text-foreground"
        style={[
          { fontFamily: 'Inter_600SemiBold' },
          valueColor ? { color: valueColor } : null,
        ]}
      >
        {value}
      </Text>
      <Text
        numberOfLines={1}
        className="text-muted-foreground text-[11px]"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {description}
      </Text>
    </Wrapper>
  );
}
