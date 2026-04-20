export const CATEGORY_ICONS: Record<string, string> = {
    'transportation': '🚌',
    'sandwich': '🍔',
    'coffee': '☕️',
    'water': '💧',
    'protein': '⚡️',
    'gym': '🏋️‍♀️',
    'routine': '☀️',
    'default': '📦'
};

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

export const CURRENCIES = ['NIS', 'USD', 'JOD'] as const;

export const CURRENCY_SYMBOL: Record<string, string> = {
    NIS: '₪',
    USD: '$',
    JOD: 'JD',
};

export const THEME = {
    primary: '#4F00D0',
    background: '#F8F9FA',
    text: '#1A1A1A',
    secondaryText: '#6B7280',
    cardLight: '#FFFFFF',
    cardPurple: '#4F00D0',
    border: '#E8ECEF',
    delete: '#FF3B30'
};
