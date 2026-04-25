export const LIGHT = {
  background:  '#F8F9FB',
  card:        '#FFFFFF',
  border:      '#E5E7EB',
  foreground:  '#1E1E1E',
  mutedBg:     '#F5F5F5',
  mutedFg:     '#737373',

  primary:     '#4F9D7E',
  success:     '#22C55E',
  successBg:   '#DCFCE7',
  warning:     '#F59E0B',
  warningBg:   '#FEF3C7',
  danger:      '#EF4444',
  dangerBg:    '#FEE2E2',
  info:        '#3B82F6',
  infoBg:      '#DBEAFE',
} as const;

export const DARK = {
  background:  '#0F0F0F',
  card:        '#181818',
  border:      '#272727',
  foreground:  '#FAFAFA',
  mutedBg:     '#272727',
  mutedFg:     '#A3A3A3',

  primary:     '#4F9D7E',
  success:     '#22C55E',
  successBg:   '#1E3C28',
  warning:     '#F59E0B',
  warningBg:   '#3C2D0F',
  danger:      '#EF4444',
  dangerBg:    '#3C1010',
  info:        '#60A5FA',
  infoBg:      '#192841',
} as const;

export type AppColors = { readonly [K in keyof typeof LIGHT]: string };
