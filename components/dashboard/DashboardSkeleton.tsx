import { View } from 'react-native';
import { Skeleton } from '../ui/skeleton';
import type { AppColors } from '../../lib/theme/colors';

/** Mirrors the rendered dashboard layout while data is loading. */
export function DashboardSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View>
      {/* Stats: 2x2 grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: '48.5%',
              backgroundColor: colors.card,
              borderWidth: 1, borderColor: colors.border,
              borderRadius: 12, padding: 14, gap: 8,
            }}
          >
            <Skeleton width={36} height={36} radius={10} />
            <Skeleton width={70} height={10} />
            <Skeleton width={56} height={18} />
            <Skeleton width="80%" height={10} />
          </View>
        ))}
      </View>

      {/* Rent collection */}
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16, marginBottom: 12, gap: 10,
      }}>
        <Skeleton width={180} height={14} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width={120} height={22} />
          <Skeleton width={80} height={12} />
        </View>
        <Skeleton width="100%" height={8} radius={99} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width={90} height={11} />
          <Skeleton width={100} height={11} />
        </View>
      </View>

      {/* Occupancy */}
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center', gap: 12,
      }}>
        <Skeleton width={80} height={14} style={{ alignSelf: 'flex-start' }} />
        <Skeleton width={120} height={120} radius={60} />
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Skeleton width={90} height={11} />
          <Skeleton width={70} height={11} />
        </View>
      </View>

      {/* Properties list */}
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16, marginBottom: 12, gap: 12,
      }}>
        <Skeleton width={120} height={14} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Skeleton width="50%" height={12} />
              <Skeleton width={70} height={12} />
            </View>
            <Skeleton width="100%" height={4} radius={99} />
          </View>
        ))}
      </View>

      {/* Recent payments */}
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 16, gap: 12,
      }}>
        <Skeleton width={140} height={14} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skeleton width={36} height={36} radius={18} />
            <View style={{ flex: 1, gap: 5 }}>
              <Skeleton width="60%" height={12} />
              <Skeleton width="80%" height={10} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 5 }}>
              <Skeleton width={60} height={12} />
              <Skeleton width={50} height={10} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
