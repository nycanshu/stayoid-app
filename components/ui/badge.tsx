import { View, Text } from 'react-native';
import { cn } from '../../lib/utils/cn';

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'muted' | 'info' | 'outline';

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success:     { bg: 'bg-[#1E3C28]', text: 'text-[#22C55E]' },
  warning:     { bg: 'bg-[#3C2D0F]', text: 'text-[#F59E0B]' },
  destructive: { bg: 'bg-[#3C1010]', text: 'text-[#EF4444]' },
  muted:       { bg: 'bg-[#272727]', text: 'text-[#A3A3A3]' },
  info:        { bg: 'bg-[#192841]', text: 'text-[#60A5FA]' },
  outline:     { bg: 'bg-transparent border border-[#272727]', text: 'text-[#A3A3A3]' },
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'muted', className }: BadgeProps) {
  const styles = variantStyles[variant];
  return (
    <View
      className={cn(
        'self-start rounded-full px-2.5 py-0.5',
        styles.bg,
        className,
      )}
    >
      <Text
        className={cn('text-xs', styles.text)}
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {children}
      </Text>
    </View>
  );
}
