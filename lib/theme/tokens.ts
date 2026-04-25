export const colors = {
  background: { light: '#F8F9FB', dark: '#0F0F0F' },
  card:       { light: '#FFFFFF', dark: '#181818' },
  border:     { light: '#E5E7EB', dark: '#272727' },
  muted:      { light: '#F5F5F5', dark: '#272727' },
  mutedFg:    { light: '#737373', dark: '#A3A3A3' },
  foreground: { light: '#1E1E1E', dark: '#FAFAFA' },

  primary:    '#4F9D7E',
  primaryFg:  '#FFFFFF',
  secondary:  '#E8D4B8',
  accent:     '#9B9FCE',

  success:     '#22C55E',
  successBg:  { light: '#DCFCE7', dark: '#1E3C28' },
  warning:     '#F59E0B',
  warningBg:  { light: '#FEF3C7', dark: '#3C2D0F' },
  destructive: '#EF4444',
  info:        '#3B82F6',
  infoBg:     { light: '#DBEAFE', dark: '#192841' },
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, '2xl': 32,
} as const;

export const radius = {
  sm: 8, md: 10, lg: 12, xl: 16, full: 999,
} as const;
