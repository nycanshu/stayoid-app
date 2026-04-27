import { View } from 'react-native';
import { cn } from '../../lib/utils';

interface OccupancyBarProps {
  occupied: number;
  total: number;
}

export function OccupancyBar({ occupied, total }: OccupancyBarProps) {
  const pct = total > 0 ? Math.min((occupied / total) * 100, 100) : 0;
  const fillClass = pct >= 80 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-destructive';

  return (
    <View className="h-1.5 bg-muted rounded-full overflow-hidden">
      <View
        style={{ width: `${pct}%` }}
        className={cn('h-full rounded-full', fillClass)}
      />
    </View>
  );
}
