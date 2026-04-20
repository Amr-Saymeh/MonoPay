export const THEME = {
  primary:      '#7C4DFF',
  primaryLight: '#a77ffdff',
  success:      '#00C853',
  warning:      '#FFB300',
  danger:       '#FF5252',
};

export const STORAGE = {
  budget:   '@daily_budget_nis',
  currency: '@display_currency',
  rates:    '@cached_rates',
  ratesTs:  '@cached_rates_ts',
};

export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const CURRENCIES = ['NIS', 'USD', 'JOD'] as const;

export const CURRENCY_SYMBOL: Record<string, string> = {
  NIS: '₪',
  USD: '$',
  JOD: 'JD',
};

export const FALLBACK_RATES: Record<string, number> = { NIS: 1, USD: 3.7, JOD: 5.2 };

export const CATEGORIES = [
  { labelKey: 'foodDrinks', icon: '🍔' },
  { labelKey: 'groceries',  icon: '🛒' },
  { labelKey: 'transport',  icon: '🚗' },
  { labelKey: 'health',     icon: '💊' },
  { labelKey: 'shopping',   icon: '🛍️' },
  { labelKey: 'entertainment', icon: '🎮' },
  { labelKey: 'bills',      icon: '📄' },
  { labelKey: 'education',  icon: '📚' },
  { labelKey: 'personalCare', icon: '✨' },
];

export const CATEGORY_META: Record<string, { icon: string; bg: string }> = {
  'foodDrinks': { icon: '🍔', bg: '#FFF0EB' },
  'groceries': { icon: '🛒', bg: '#E8FFF5' },
  'transport': { icon: '🚗', bg: '#E8F4FF' },
  'health': { icon: '💊', bg: '#FFE8F4' },
  'shopping': { icon: '🛍️', bg: '#F3EEFF' },
  'entertainment': { icon: '🎮', bg: '#FFF3E0' },
  'bills': { icon: '📄', bg: '#ECEFF1' },
  'education': { icon: '📚', bg: '#E0F2F1' },
  'personalCare': { icon: '✨', bg: '#F3E5F5' },
};

export const DEFAULT_META = { icon: '📦', bg: '#F2F2F7' };

export const DELETE_BTN_WIDTH = 80;
export const SWIPE_THRESHOLD = 60;
