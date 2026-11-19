// Currency Formatter for Indonesian Rupiah (IDR)
export const formatIDR = (amount: number, compact: boolean = false): string => {
  if (compact && Math.abs(amount) >= 1_000_000) {
    const fmt = (v: number) => v.toFixed(1).replace(/\.0$/, '').replace('.', ',');
    if (Math.abs(amount) >= 1_000_000_000) {
      return `Rp ${fmt(amount / 1_000_000_000)} M`;
    }
    return `Rp ${fmt(amount / 1_000_000)} jt`;
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Date Formatter
export const formatDateIndonesian = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const today = new Date();
  const todayStr = toDateKey(today);

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = toDateKey(yesterday);

  if (dateStr === todayStr) {
    return 'Hari ini';
  } else if (dateStr === yesterdayStr) {
    return 'Kemarin';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
};

export const formatFullDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const getMonthName = (monthStr: string): string => {
  // monthStr is "YYYY-MM"
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
};

export const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Local-time YYYY-MM-DD (never use toISOString — it shifts dates in UTC+7)
export const toDateKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateString = (): string => toDateKey(new Date());

export const getNowTimeString = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Shift a YYYY-MM month string by n months
export const shiftMonth = (monthStr: string, delta: number): string => {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getShortMonthName = (monthStr: string): string => {
  const [year, month] = monthStr.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(year, month - 1, 1));
};

// Parse "25.000" / "25000" / "25rb" style raw input into a number
export const parseAmountInput = (raw: string): number => {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
};

// Format a plain number with Indonesian thousand separators (25000 -> 25.000)
export const formatNumberID = (n: number): string =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n);
