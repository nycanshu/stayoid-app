import { View } from 'react-native';
import { cn } from '../../lib/utils/cn';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View className={cn('bg-[#181818] border border-[#272727] rounded-2xl', className)}>
      {children}
    </View>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <View className={cn('px-5 pt-5 pb-3', className)}>
      {children}
    </View>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <View className={cn('px-5 pb-5', className)}>
      {children}
    </View>
  );
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <View className={cn('px-5 pt-3 pb-5 border-t border-[#272727]', className)}>
      {children}
    </View>
  );
}
