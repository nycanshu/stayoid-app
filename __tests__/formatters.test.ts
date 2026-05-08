import {
  formatCurrency,
  formatFloorName,
  getInitials,
  formatMonthYear,
  formatTenure,
  formatLongDate,
  hashColor,
} from '@/lib/utils/formatters';

describe('formatCurrency', () => {
  it('formats a plain number with ₹ + Indian grouping', () => {
    // 1,234,567 → 12,34,567 in en-IN
    expect(formatCurrency(1234567)).toBe('₹12,34,567');
  });

  it('formats a string number (the API returns strings like "18000.00")', () => {
    expect(formatCurrency('18000.00')).toBe('₹18,000');
  });

  it('rounds away the fractional part (maximumFractionDigits: 0)', () => {
    // Default rounding is half-expand, but 1500.49 → 1500 either way
    expect(formatCurrency(1500.49)).toBe('₹1,500');
  });

  it('returns ₹0 for zero', () => {
    expect(formatCurrency(0)).toBe('₹0');
    expect(formatCurrency('0')).toBe('₹0');
  });

  it('handles negatives without crashing', () => {
    expect(formatCurrency(-1500)).toMatch(/^-?₹|₹.*-/);
    expect(formatCurrency(-1500)).toContain('1,500');
  });

  it('falls back to ₹0 for unparseable strings (defensive)', () => {
    // The API has been known to return null/empty/garbage on legacy rows.
    expect(formatCurrency('')).toBe('₹0');
    expect(formatCurrency('abc')).toBe('₹0');
  });

  it('handles large amounts (lakhs/crores)', () => {
    expect(formatCurrency(10000000)).toBe('₹1,00,00,000'); // 1 crore
    expect(formatCurrency(100000)).toBe('₹1,00,000');      // 1 lakh
  });
});

describe('formatFloorName', () => {
  it('labels ground and basements correctly', () => {
    expect(formatFloorName(0)).toBe('Ground Floor');
    expect(formatFloorName(-1)).toBe('Basement');
    expect(formatFloorName(-2)).toBe('Basement 2');
    expect(formatFloorName(-3)).toBe('Basement 3');
  });

  it('uses st/nd/rd suffixes for 1–3', () => {
    expect(formatFloorName(1)).toBe('1st Floor');
    expect(formatFloorName(2)).toBe('2nd Floor');
    expect(formatFloorName(3)).toBe('3rd Floor');
  });

  it('uses th for 4–10', () => {
    [4, 5, 6, 7, 8, 9, 10].forEach((n) => {
      expect(formatFloorName(n)).toBe(`${n}th Floor`);
    });
  });

  it('handles the 11/12/13 teen exception (always th)', () => {
    expect(formatFloorName(11)).toBe('11th Floor');
    expect(formatFloorName(12)).toBe('12th Floor');
    expect(formatFloorName(13)).toBe('13th Floor');
  });

  it('handles 21/22/23 (st/nd/rd repeat after 20)', () => {
    expect(formatFloorName(21)).toBe('21st Floor');
    expect(formatFloorName(22)).toBe('22nd Floor');
    expect(formatFloorName(23)).toBe('23rd Floor');
  });

  it('handles 100s with last-2-digits rule', () => {
    expect(formatFloorName(101)).toBe('101st Floor');
    expect(formatFloorName(111)).toBe('111th Floor');
    expect(formatFloorName(112)).toBe('112th Floor');
    expect(formatFloorName(121)).toBe('121st Floor');
  });
});

describe('getInitials', () => {
  it('takes first letter of first two words', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Himanshu Kumar')).toBe('HK');
  });

  it('caps at two initials', () => {
    expect(getInitials('John Doe Smith')).toBe('JD');
    expect(getInitials('A B C D E')).toBe('AB');
  });

  it('uppercases lowercase input', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('returns single initial for one-word names', () => {
    expect(getInitials('Himanshu')).toBe('H');
  });

  it('returns empty string for empty input', () => {
    expect(getInitials('')).toBe('');
  });

  it('strips leading/trailing whitespace before splitting', () => {
    // Real bug surface: a backend row with " John Doe" would render as "J"
    // (leading empty token). Tenant onboarding form trims, but lists may not.
    expect(getInitials(' John Doe')).toBe('JD');
    expect(getInitials('John Doe ')).toBe('JD');
    expect(getInitials('  John  Doe  ')).toBe('JD');
  });
});

describe('formatMonthYear', () => {
  it('formats valid month numbers (1–12)', () => {
    expect(formatMonthYear(1, 2026)).toBe('January 2026');
    expect(formatMonthYear(5, 2026)).toBe('May 2026');
    expect(formatMonthYear(12, 2024)).toBe('December 2024');
  });
});

describe('formatTenure', () => {
  // Lock "now" to 2026-05-08 so days/months arithmetic is deterministic.
  const NOW = new Date('2026-05-08T12:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns em-dash for invalid joinDate', () => {
    expect(formatTenure('not-a-date')).toBe('—');
  });

  it('handles same-day join (0 days)', () => {
    expect(formatTenure('2026-05-08T00:00:00Z')).toBe('0 days');
  });

  it('singular vs plural day labels', () => {
    expect(formatTenure('2026-05-07T12:00:00Z')).toBe('1 day');
    expect(formatTenure('2026-05-03T12:00:00Z')).toBe('5 days');
    expect(formatTenure('2026-04-09T12:00:00Z')).toBe('29 days');
  });

  it('crosses to months at exactly 30 days', () => {
    // 2026-04-08 12:00Z → exactly 30 days = 1 month
    expect(formatTenure('2026-04-08T12:00:00Z')).toBe('1 month');
  });

  it('formats months', () => {
    // 60 days → 2 months
    expect(formatTenure('2026-03-09T12:00:00Z')).toBe('2 months');
  });

  it('formats year-only when remainder is zero', () => {
    // 360 days = 12 months → 1y (rem 0)
    expect(formatTenure('2025-05-13T12:00:00Z')).toBe('1y');
  });

  it('formats years + months when remainder', () => {
    // ~14 months ago
    expect(formatTenure('2025-03-08T12:00:00Z')).toBe('1y 2m');
  });

  it('clamps negative tenure to 0 days (future joinDate)', () => {
    expect(formatTenure('2027-01-01T00:00:00Z')).toBe('0 days');
  });

  it('uses exitDate when provided', () => {
    // Joined 2024-01-01, exited 2025-01-01 → 12 months → 1y
    expect(formatTenure('2024-01-01T00:00:00Z', '2025-01-01T00:00:00Z')).toBe('1y');
  });

  it('clamps when exitDate is before joinDate', () => {
    expect(formatTenure('2026-01-01T00:00:00Z', '2025-01-01T00:00:00Z')).toBe('0 days');
  });
});

describe('formatLongDate', () => {
  it('returns em-dash for null/undefined/empty/invalid', () => {
    expect(formatLongDate(null)).toBe('—');
    expect(formatLongDate(undefined)).toBe('—');
    expect(formatLongDate('')).toBe('—');
    expect(formatLongDate('not-a-date')).toBe('—');
  });

  it('formats a valid ISO date with day, short month, full year', () => {
    // "2026-05-08" → "8 May 2026" in en-IN; we assert components rather than
    // exact string to keep the test stable across Node ICU/CLDR variations.
    const out = formatLongDate('2026-05-08T12:00:00Z');
    expect(out).toMatch(/\b(May|Mar|Apr|Jun)\b/); // "May" expected on UTC; allow neighbors for TZ skew
    expect(out).toContain('2026');
    expect(out).toMatch(/\b\d{1,2}\b/);
  });
});

describe('hashColor', () => {
  it('returns a valid HSL string', () => {
    expect(hashColor('Himanshu')).toMatch(/^hsl\(\d+, 55%, 45%\)$/);
  });

  it('is deterministic for the same input', () => {
    expect(hashColor('Himanshu')).toBe(hashColor('Himanshu'));
  });

  it('differs across distinct inputs (high probability)', () => {
    expect(hashColor('Alice')).not.toBe(hashColor('Bob'));
  });

  it('does not crash on empty string', () => {
    expect(hashColor('')).toMatch(/^hsl\(\d+, 55%, 45%\)$/);
  });
});
