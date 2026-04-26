const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function formatCurrency(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return INR.format(isNaN(n) ? 0 : n);
}

export function formatFloorName(floorNumber: number): string {
  if (floorNumber === 0) return 'Ground Floor';
  if (floorNumber < 0) return floorNumber === -1 ? 'Basement' : `Basement ${Math.abs(floorNumber)}`;
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = floorNumber % 100;
  const suffix = suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0];
  return `${floorNumber}${suffix} Floor`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatMonthYear(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Returns a short human-readable tenure between joinDate and (exitDate || now) */
export function formatTenure(joinDate: string, exitDate?: string | null): string {
  const start = new Date(joinDate);
  const end   = exitDate ? new Date(exitDate) : new Date();
  if (isNaN(start.getTime())) return '—';
  const days   = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
  if (days < 30)   return `${days} ${days === 1 ? 'day' : 'days'}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'}`;
  const years  = Math.floor(months / 12);
  const rem    = months % 12;
  return rem === 0 ? `${years}y` : `${years}y ${rem}m`;
}

export function formatLongDate(s?: string | null): string {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const GENDER_LABELS: Record<string, string> = {
  MALE: 'Male', FEMALE: 'Female', OTHER: 'Other',
};
export const WORK_TYPE_LABELS: Record<string, string> = {
  STUDENT: 'Student', IT: 'IT', BUSINESS: 'Business',
  GOVERNMENT: 'Government', HEALTHCARE: 'Healthcare', OTHER: 'Other',
};
export const ID_PROOF_LABELS: Record<string, string> = {
  AADHAR: 'Aadhar', PAN: 'PAN', PASSPORT: 'Passport',
  DL: 'Driving Licence', VOTER: 'Voter ID', OTHER: 'Other',
};

export function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}
