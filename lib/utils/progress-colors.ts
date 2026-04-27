import { THEME } from '../theme';

/** Returns a Tailwind text class for a 0–100 percentage. */
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

/** Returns hex tone color from THEME palette. */
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
