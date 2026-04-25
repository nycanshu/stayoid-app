import { View } from 'react-native';
import { Skeleton } from '../ui/skeleton';
import type { AppColors } from '../../lib/theme/colors';

export function PropertyCardSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 14,
    }}>
      {/* ── Chip + name/address + type pill ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Skeleton width={36} height={36} radius={10} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="60%" height={12} />
          <Skeleton width="85%" height={10} />
        </View>
        <Skeleton width={42} height={18} radius={99} />
      </View>

      {/* ── Divider ── */}
      <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />

      {/* ── Occupancy row ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Skeleton width={64} height={10} />
        <Skeleton width={56} height={10} />
      </View>
      <Skeleton width="100%" height={6} radius={99} />

      {/* ── Rent row ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <Skeleton width={80} height={10} />
        <Skeleton width={100} height={10} />
      </View>
    </View>
  );
}
