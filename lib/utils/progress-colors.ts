import type { AppColors } from '../theme/colors';

/** Returns a tone color (success / warning / danger) based on a 0–100 percentage. */
export function getProgressColor(pct: number, colors: AppColors): string {
  if (pct >= 80) return colors.success;
  if (pct >= 50) return colors.warning;
  return colors.danger;
}

/** Returns the matching tinted background for a 0–100 percentage. */
export function getProgressBg(pct: number, colors: AppColors): string {
  if (pct >= 80) return colors.successBg;
  if (pct >= 50) return colors.warningBg;
  return colors.dangerBg;
}
