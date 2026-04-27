import type { AppColors } from '../theme/colors';
import { THEME } from '../theme';

/** Legacy: returns a hex tone color based on AppColors. Kept for screens still on useColors(). */
export function getProgressColor(pct: number, colors: AppColors): string {
  if (pct >= 80) return colors.success;
  if (pct >= 50) return colors.warning;
  return colors.danger;
}

/** Legacy: returns a hex tinted background. Kept for screens still on useColors(). */
export function getProgressBg(pct: number, colors: AppColors): string {
  if (pct >= 80) return colors.successBg;
  if (pct >= 50) return colors.warningBg;
  return colors.dangerBg;
}

/** Returns a Tailwind text/border class for a 0–100 percentage. */
export function getProgressClass(pct: number): 'text-success' | 'text-warning' | 'text-destructive' {
  if (pct >= 80) return 'text-success';
  if (pct >= 50) return 'text-warning';
  return 'text-destructive';
}

/** Returns a Tailwind bg class for a 0–100 percentage. */
export function getProgressBgClass(pct: number): 'bg-success-bg' | 'bg-warning-bg' | 'bg-destructive-bg' {
  if (pct >= 80) return 'bg-success-bg';
  if (pct >= 50) return 'bg-warning-bg';
  return 'bg-destructive-bg';
}

/** Returns hex tone color from THEME palette (className-era replacement). */
export function getProgressHex(pct: number, scheme: 'light' | 'dark'): string {
  const t = THEME[scheme];
  if (pct >= 80) return t.success;
  if (pct >= 50) return t.warning;
  return t.destructive;
}

/** Returns hex tinted background from THEME palette. */
export function getProgressBgHex(pct: number, scheme: 'light' | 'dark'): string {
  const t = THEME[scheme];
  if (pct >= 80) return t.successBg;
  if (pct >= 50) return t.warningBg;
  return t.destructiveBg;
}
