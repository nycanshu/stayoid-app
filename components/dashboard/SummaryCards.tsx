import { View } from 'react-native';
import { router } from 'expo-router';
import {
  BuildingsIcon, TrendUpIcon, CurrencyInrIcon, UsersIcon,
} from 'phosphor-react-native';
import { StatCard } from './StatCard';
import { formatCurrency } from '../../lib/utils/formatters';
import { getProgressColor, getProgressBg } from '../../lib/utils/progress-colors';
import type { AppColors } from '../../lib/theme/colors';
import type { DashboardSummary, DashboardCurrentMonth } from '../../types/property';

interface SummaryCardsProps {
  summary: DashboardSummary;
  currentMonth: DashboardCurrentMonth;
  colors: AppColors;
}

/** 2×2 grid of headline stats: Properties, Occupancy, Revenue, Active Tenants.
 *  Each card is tappable and drills into the matching list view. */
export function SummaryCards({ summary, currentMonth, colors }: SummaryCardsProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      <View style={{ width: '48.5%' }}>
        <StatCard
          title="Properties"
          value={summary.total_properties}
          description={`${summary.total_slots} total slots`}
          Icon={BuildingsIcon}
          iconBg={colors.infoBg}
          iconColor={colors.info}
          onPress={() => router.push('/(tabs)/properties')}
          colors={colors}
        />
      </View>
      <View style={{ width: '48.5%' }}>
        <StatCard
          title="Occupancy"
          value={`${Math.round(summary.occupancy_rate)}%`}
          description={`${summary.occupied_slots} of ${summary.total_slots} slots`}
          Icon={TrendUpIcon}
          iconBg={getProgressBg(summary.occupancy_rate, colors)}
          iconColor={getProgressColor(summary.occupancy_rate, colors)}
          valueColor={getProgressColor(summary.occupancy_rate, colors)}
          onPress={() => router.push('/(tabs)/properties')}
          colors={colors}
        />
      </View>
      <View style={{ width: '48.5%' }}>
        <StatCard
          title="Revenue"
          value={formatCurrency(currentMonth.collected_rent)}
          description={`${Math.round(currentMonth.collection_rate)}% collected`}
          Icon={CurrencyInrIcon}
          iconBg={getProgressBg(currentMonth.collection_rate, colors)}
          iconColor={getProgressColor(currentMonth.collection_rate, colors)}
          valueColor={getProgressColor(currentMonth.collection_rate, colors)}
          onPress={() => router.push('/(tabs)/payments')}
          colors={colors}
        />
      </View>
      <View style={{ width: '48.5%' }}>
        <StatCard
          title="Active Tenants"
          value={summary.active_tenants}
          description={`${summary.vacant_slots} vacant slots`}
          Icon={UsersIcon}
          iconBg={colors.successBg}
          iconColor={colors.success}
          onPress={() => router.push('/(tabs)/tenants' as never)}
          colors={colors}
        />
      </View>
    </View>
  );
}
