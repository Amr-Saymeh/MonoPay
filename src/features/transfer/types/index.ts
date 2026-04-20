// ─── Currency ───────────────────────────────────────────────────────────────
export type Currency = "nis" | "usd" | "jod" | string;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  nis: "₪",
  usd: "$",
  jod: "JD",
};

export const CURRENCY_LABELS: Record<string, string> = {
  nis: "NIS – New Israeli Shekel",
  usd: "USD – US Dollar",
  jod: "JOD – Jordanian Dinar",
};

// ─── Transaction Mode ────────────────────────────────────────────────────────
export type TransactionMode = "send" | "receive";

// ─── User ────────────────────────────────────────────────────────────────────
export interface WalletSlot {
  name: string;
  walletid?: number;
  id?: number;
  color?: string;
  emoji?: string;
}

export interface AppUser {
  uid: string;
  name: string;
  email?: string;
  number?: string | number;
  address?: string;
  type: number;
  userwallet?: Record<string, WalletSlot>;
}

// ─── Wallet ──────────────────────────────────────────────────────────────────
export interface Wallet {
  id: number;
  state: "active" | "inactive";
  type: "real" | "credit";
  currancies?: Record<string, number>;
}

// ─── Categories ──────────────────────────────────────────────────────────────
export interface Category {
  key: string;
  label: string;
  labelAr: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { key: "food",      label: "Food & Drinks", labelAr: "طعام ومشروبات", emoji: "🍔" },
  { key: "shopping",  label: "Shopping",      labelAr: "تسوق",          emoji: "🛍️" },
  { key: "transport", label: "Transport",     labelAr: "مواصلات",       emoji: "🚗" },
  { key: "bills",     label: "Bills",         labelAr: "فواتير",        emoji: "💡" },
  { key: "health",    label: "Health",        labelAr: "صحة",           emoji: "🏥" },
  { key: "education", label: "Education",     labelAr: "تعليم",         emoji: "📚" },
  { key: "family",    label: "Family",        labelAr: "عائلة",         emoji: "👨‍👩‍👧" },
  { key: "salary",    label: "Salary",        labelAr: "راتب",          emoji: "💼" },
  { key: "savings",   label: "Savings",       labelAr: "مدخرات",        emoji: "🏦" },
  { key: "other",     label: "Other",         labelAr: "أخرى",          emoji: "📦" },
];

// ─── Service Params ──────────────────────────────────────────────────────────

// Send: المرسل يختار فقط — النظام يوصّل لـ main wallet للمستلم تلقائياً
export interface SendMoneyParams {
  senderUid: string;
  fromSlotKey: string;
  receiverUid: string;
  amount: number;
  currency: Currency;
  category: string;
  note: string;
}

// Request: الطالب يختار فقط — الدافع يقرر من أي محفظة لما يوافق
export interface RequestMoneyParams {
  requesterUid: string;
  payerUid: string;
  amount: number;
  currency: Currency;
  category: string;
  note: string;
}

// Approve: الدافع يوافق ويختار من أي محفظة يدفع (الافتراضي wallet1)
export interface ApproveRequestParams {
  requestId: string;
  payerUid: string;
  payerWalletSlotKey: string; // الافتراضي "wallet1"
  requesterUid: string;
  amount: number;
  currency: Currency;
  category: string;
  note: string;
}

// ─── Money Request (DB Record) ───────────────────────────────────────────────
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface MoneyRequest {
  fromUserId: string;  // الطالب
  toUserId: string;    // الدافع
  amount: number;
  currancy: Currency;  // ⚠️ typo intentional — matches DB schema
  note: string;
  category: string;
  status: RequestStatus;
  createdAt: number;
  decidedAt?: number;
}

// ─── Transaction History Record (DB Record) ──────────────────────────────────
export interface TransactionRecord {
  amount: number;
  currancy: Currency; // ⚠️ typo intentional — matches DB schema
  type: "send" | "receive";
  senderUid: string;
  receiverUid: string;
  fromWalletKey: string; // المحفظة اللي خرجت منها المصاري
  toWalletKey: string; // المحفظة اللي وصلت إليها
  category: string;
  notes: string;
  "transaction date": number; // ⚠️ space intentional — matches DB schema
}

// ─── Service Result ──────────────────────────────────────────────────────────
export type ServiceResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: TransferError };

export type TransferError =
  | "INSUFFICIENT_FUNDS"
  | "WALLET_INACTIVE"
  | "SENDER_IS_RECEIVER"
  | "MAIN_WALLET_NOT_FOUND"
  | "USER_NOT_FOUND"
  | "INVALID_AMOUNT"
  | "UNKNOWN";
