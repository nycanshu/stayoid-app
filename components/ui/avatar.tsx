import { View, Text } from 'react-native';
import { cn } from '../../lib/utils/cn';
import { getInitials } from '../../lib/utils/formatters';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeStyles: Record<AvatarSize, { container: string; text: string; dim: number }> = {
  xs: { container: 'w-7 h-7 rounded-full',  text: 'text-xs', dim: 28 },
  sm: { container: 'w-9 h-9 rounded-full',  text: 'text-sm', dim: 36 },
  md: { container: 'w-11 h-11 rounded-full', text: 'text-sm', dim: 44 },
  lg: { container: 'w-14 h-14 rounded-full', text: 'text-lg', dim: 56 },
  xl: { container: 'w-20 h-20 rounded-full', text: 'text-2xl', dim: 80 },
};

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  bg?: string;
  className?: string;
}

export function Avatar({ name, size = 'md', bg = '#4F9D7E', className }: AvatarProps) {
  const { container, text } = sizeStyles[size];
  return (
    <View
      className={cn('items-center justify-center', container, className)}
      style={{ backgroundColor: bg }}
    >
      <Text
        className={cn('text-white font-semibold', text)}
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}
