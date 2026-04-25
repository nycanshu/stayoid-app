import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '../../lib/utils/cn';

type Variant = 'default' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'default' | 'lg' | 'icon';

interface ButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<Variant, string> = {
  default:     'bg-[#4F9D7E] border border-[#4F9D7E]',
  outline:     'bg-transparent border border-[#272727]',
  ghost:       'bg-transparent border border-transparent',
  destructive: 'bg-[#EF4444] border border-[#EF4444]',
};

const textVariantStyles: Record<Variant, string> = {
  default:     'text-white',
  outline:     'text-[#FAFAFA]',
  ghost:       'text-[#A3A3A3]',
  destructive: 'text-white',
};

const sizeStyles: Record<Size, string> = {
  sm:      'h-8 px-3 rounded-lg',
  default: 'h-11 px-5 rounded-xl',
  lg:      'h-13 px-6 rounded-xl',
  icon:    'h-10 w-10 rounded-xl',
};

const textSizeStyles: Record<Size, string> = {
  sm:      'text-xs',
  default: 'text-sm',
  lg:      'text-base',
  icon:    'text-sm',
};

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled,
  loading,
  className,
  textClassName,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      className={cn(
        'flex-row items-center justify-center',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'default' ? '#fff' : '#4F9D7E'} />
      ) : (
        <Text
          className={cn(
            'font-semibold tracking-wide',
            textVariantStyles[variant],
            textSizeStyles[size],
            textClassName,
          )}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
