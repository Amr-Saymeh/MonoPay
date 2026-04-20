export type Currency = 'NIS' | 'USD' | 'JOD';

export type Rates = Record<Currency, number>;

export type FormValues = {
  name: string;
  cost: string;
  currency: Currency;
  category: string;
};

export type SuggestionItem = {
  name: string;
  cost?: string;
  currency?: Currency;
  category?: string;
  isBundle?: boolean;
};

export type PurchaseItem = {
  id: string;
  title: string;
  amount: number;
  currency?: string;
  time: string;
  category?: string;
  isBundle?: boolean;
  createdAt: string;
};

// ====================== Component Prop Interfaces ======================

export interface DailyTotalCardProps {
  totalSpentNIS: number;
  dailyBudgetNIS: number;
  displayCurrency: Currency;
  ratesLoading: boolean;
  ratesError: boolean;
  isLoading: boolean;
  symbol: string;
  displayTotal: number;
  displayBudget: number;
  budgetPercent: number;
  onRefreshRates: () => void;
  onEditBudget: () => void;
  onCycleCurrency: () => void;
  onBack: () => void;
  onShowRatesModal: () => void;
  onCreateBundle: () => void;
}

export interface RatesModalProps {
  visible: boolean;
  onClose: () => void;
  rates: Rates;
  loading: boolean;
  hasError: boolean;
  onRefresh: () => void;
}

export interface BudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (amountNIS: number) => void;
  rates: Rates;
}

export interface PurchaseCardProps {
  item: PurchaseItem;
  onPress?: (item: PurchaseItem) => void;
  onDelete: (item: PurchaseItem) => void;
}

export interface PurchaseListProps {
  purchases: PurchaseItem[];
  loading: boolean;
  onPressItem?: (item: PurchaseItem) => void;
  onDelete: (item: PurchaseItem) => void;
}

export interface PurchaseFormProps {
  onSubmit: (e?: any) => void;
  loading: boolean;
  visibleToast: boolean;
  suggestions: SuggestionItem[];
  control: any;
  errors: any;
  setValue: any;
  selectedCurrency: Currency;
}

export interface ToastProps {
  visible: boolean;
  message: string;
}

export interface BudgetWarningModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  newTotal: number;
  budget: number;
  currencySymbol: string;
}
