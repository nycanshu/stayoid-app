import { View } from 'react-native';
import { Skeleton } from '../ui/skeleton';

const cardClass = 'bg-card border border-border rounded-xl';

export function DashboardSkeleton() {
  return (
    <View>
      <View className="flex-row flex-wrap gap-2.5 mb-3">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} className={`w-[48.5%] ${cardClass} p-3.5 gap-2`}>
            <Skeleton width={36} height={36} radius={10} />
            <Skeleton width={70} height={10} />
            <Skeleton width={56} height={18} />
            <Skeleton width="80%" height={10} />
          </View>
        ))}
      </View>

      <View className={`${cardClass} p-4 mb-3 gap-2.5`}>
        <Skeleton width={180} height={14} />
        <View className="flex-row justify-between">
          <Skeleton width={120} height={22} />
          <Skeleton width={80} height={12} />
        </View>
        <Skeleton width="100%" height={8} radius={99} />
        <View className="flex-row justify-between">
          <Skeleton width={90} height={11} />
          <Skeleton width={100} height={11} />
        </View>
      </View>

      <View className={`${cardClass} p-4 mb-3 items-center gap-3`}>
        <Skeleton width={80} height={14} style={{ alignSelf: 'flex-start' }} />
        <Skeleton width={120} height={120} radius={60} />
        <View className="flex-row gap-4">
          <Skeleton width={90} height={11} />
          <Skeleton width={70} height={11} />
        </View>
      </View>

      <View className={`${cardClass} p-4 mb-3 gap-3`}>
        <Skeleton width={120} height={14} />
        {[0, 1, 2].map((i) => (
          <View key={i} className="gap-1.5">
            <View className="flex-row justify-between">
              <Skeleton width="50%" height={12} />
              <Skeleton width={70} height={12} />
            </View>
            <Skeleton width="100%" height={4} radius={99} />
          </View>
        ))}
      </View>

      <View className={`${cardClass} p-4 gap-3`}>
        <Skeleton width={140} height={14} />
        {[0, 1, 2].map((i) => (
          <View key={i} className="flex-row items-center gap-3">
            <Skeleton width={36} height={36} radius={18} />
            <View className="flex-1 gap-1">
              <Skeleton width="60%" height={12} />
              <Skeleton width="80%" height={10} />
            </View>
            <View className="items-end gap-1">
              <Skeleton width={60} height={12} />
              <Skeleton width={50} height={10} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
