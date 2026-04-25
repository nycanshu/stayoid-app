import { View } from 'react-native';
import type { AppColors } from '../../lib/theme/colors';

interface OccupancyBarProps {
  occupied: number;
  total: number;
  colors: AppColors;
}

export function OccupancyBar({ occupied, total, colors }: OccupancyBarProps) {
  const pct = total > 0 ? Math.min((occupied / total) * 100, 100) : 0;
  const fill = pct >= 80 ? colors.success : pct >= 50 ? colors.warning : colors.danger;

  return (
    <View style={{ height: 6, backgroundColor: colors.mutedBg, borderRadius: 99, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${pct}%`, backgroundColor: fill, borderRadius: 99 }} />
    </View>
  );
}
