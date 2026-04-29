import { View } from 'react-native';
import { router } from 'expo-router';
import {
  BuildingsIcon, TrendUpIcon, CurrencyInrIcon, UsersIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { StatCard } from './StatCard';
import { formatCurrency } from '../../lib/utils/formatters';
import { getProgressHex, getProgressBgHex } from '../../lib/utils/progress-colors';
import { THEME } from '../../lib/theme';
import type { DashboardSummary, DashboardCurrentMonth } from '../../types/property';

interface SummaryCardsProps {
  summary: DashboardSummary;
  currentMonth: DashboardCurrentMonth;
}

export function SummaryCards({ summary, currentMonth }: SummaryCardsProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = THEME[scheme];

  return (
    <View className="flex-row flex-wrap gap-2.5">
      <View className="w-[48.5%]">
        <StatCard
          title="Properties"
          value={summary.total_properties}
          description={`${summary.total_slots} total slots`}
          Icon={BuildingsIcon}
          iconBg={palette.infoBg}
          iconColor={palette.info}
          onPress={() => router.push('/properties')}
        />
      </View>
      <View className="w-[48.5%]">
        <StatCard
          title="Occupancy"
          value={`${Math.round(summary.occupancy_rate)}%`}
          description={`${summary.occupied_slots} of ${summary.total_slots} slots`}
          Icon={TrendUpIcon}
          iconBg={getProgressBgHex(summary.occupancy_rate, scheme)}
          iconColor={getProgressHex(summary.occupancy_rate, scheme)}
          valueColor={getProgressHex(summary.occupancy_rate, scheme)}
          onPress={() => router.push('/properties')}
        />
      </View>
      <View className="w-[48.5%]">
        <StatCard
          title="Revenue"
          value={formatCurrency(currentMonth.collected_rent)}
          description={`${Math.round(currentMonth.collection_rate)}% collected`}
          Icon={CurrencyInrIcon}
          iconBg={getProgressBgHex(currentMonth.collection_rate, scheme)}
          iconColor={getProgressHex(currentMonth.collection_rate, scheme)}
          valueColor={getProgressHex(currentMonth.collection_rate, scheme)}
          onPress={() => router.push('/payments')}
        />
      </View>
      <View className="w-[48.5%]">
        <StatCard
          title="Active Tenants"
          value={summary.active_tenants}
          description={`${summary.vacant_slots} vacant slots`}
          Icon={UsersIcon}
          iconBg={palette.successBg}
          iconColor={palette.success}
          onPress={() => router.push('/tenants' as never)}
        />
      </View>
    </View>
  );
}
