import {
  getProgressClass,
  getProgressBgClass,
  getProgressHex,
  getProgressBgHex,
} from '@/lib/utils/progress-colors';
import { THEME } from '@/lib/theme';

describe('getProgressClass — text class boundaries', () => {
  it('80 and above is success (boundary inclusive)', () => {
    expect(getProgressClass(80)).toBe('text-success');
    expect(getProgressClass(100)).toBe('text-success');
    expect(getProgressClass(99.9)).toBe('text-success');
    expect(getProgressClass(150)).toBe('text-success');
  });

  it('50..79.99 is warning', () => {
    expect(getProgressClass(50)).toBe('text-warning');
    expect(getProgressClass(79)).toBe('text-warning');
    expect(getProgressClass(79.99)).toBe('text-warning');
  });

  it('below 50 is destructive', () => {
    expect(getProgressClass(49)).toBe('text-destructive');
    expect(getProgressClass(0)).toBe('text-destructive');
    expect(getProgressClass(-5)).toBe('text-destructive');
  });

  it('exact threshold 50 is warning, not destructive', () => {
    expect(getProgressClass(50)).toBe('text-warning');
    expect(getProgressClass(49.999)).toBe('text-destructive');
  });

  it('exact threshold 80 is success, not warning', () => {
    expect(getProgressClass(80)).toBe('text-success');
    expect(getProgressClass(79.999)).toBe('text-warning');
  });
});

describe('getProgressBgClass mirrors getProgressClass tiers', () => {
  it('80 → success-bg', () => {
    expect(getProgressBgClass(80)).toBe('bg-success-bg');
  });
  it('50 → warning-bg', () => {
    expect(getProgressBgClass(50)).toBe('bg-warning-bg');
  });
  it('0 → destructive-bg', () => {
    expect(getProgressBgClass(0)).toBe('bg-destructive-bg');
  });
});

describe('getProgressHex — uses palette per scheme', () => {
  it('returns light scheme success at 80+', () => {
    expect(getProgressHex(85, 'light')).toBe(THEME.light.success);
    expect(getProgressHex(85, 'dark')).toBe(THEME.dark.success);
  });

  it('returns warning between 50–79', () => {
    expect(getProgressHex(60, 'light')).toBe(THEME.light.warning);
    expect(getProgressHex(60, 'dark')).toBe(THEME.dark.warning);
  });

  it('returns destructive below 50', () => {
    expect(getProgressHex(20, 'light')).toBe(THEME.light.destructive);
    expect(getProgressHex(20, 'dark')).toBe(THEME.dark.destructive);
  });
});

describe('getProgressBgHex — uses tinted palette per scheme', () => {
  it('returns successBg / warningBg / destructiveBg per band', () => {
    expect(getProgressBgHex(95, 'light')).toBe(THEME.light.successBg);
    expect(getProgressBgHex(60, 'dark')).toBe(THEME.dark.warningBg);
    expect(getProgressBgHex(10, 'light')).toBe(THEME.light.destructiveBg);
  });
});
