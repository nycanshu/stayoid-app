import { View } from 'react-native';
import { Skeleton } from '../ui/skeleton';

export function PropertyCardSkeleton() {
  return (
    <View className="bg-card border border-border rounded-xl p-3.5">
      <View className="flex-row items-center gap-3 mb-3">
        <Skeleton width={36} height={36} radius={10} />
        <View className="flex-1 gap-1.5">
          <Skeleton width="60%" height={12} />
          <Skeleton width="85%" height={10} />
        </View>
        <Skeleton width={42} height={18} radius={99} />
      </View>

      <View className="h-px bg-border mb-3" />

      <View className="flex-row justify-between items-center mb-1.5">
        <Skeleton width={64} height={10} />
        <Skeleton width={56} height={10} />
      </View>
      <Skeleton width="100%" height={6} radius={99} />

      <View className="flex-row justify-between items-center mt-2.5">
        <Skeleton width={80} height={10} />
        <Skeleton width={100} height={10} />
      </View>
    </View>
  );
}
