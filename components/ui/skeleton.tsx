import { cn } from '@/lib/utils';
import { View, type DimensionValue } from 'react-native';

type SkeletonProps = React.ComponentProps<typeof View> & {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
};

function Skeleton({ className, width, height, radius, style, ...props }: SkeletonProps) {
  const sizeStyle =
    width != null || height != null || radius != null
      ? { width, height, borderRadius: radius }
      : undefined;
  return (
    <View
      className={cn('bg-muted animate-pulse rounded-md', className)}
      style={[sizeStyle, style]}
      {...props}
    />
  );
}

export { Skeleton };
