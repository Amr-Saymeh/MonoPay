import type { BalanceRow, WalletType } from "./types";

export const TYPE_OPTIONS: Array<{ key: WalletType; icon: any }> = [
  { key: "real", icon: "account-balance-wallet" },
  { key: "credit", icon: "credit-card" },
  { key: "shared", icon: "groups" },
];

export const EMOJI_OPTIONS = ["💳", "🧾", "🏦", "👛", "💰", "⭐", "🔥", "🫶"];

const CURRENCY_OPTIONS = ["nis", "usd", "jod", "eur", "gbp"];

export function nextCurrency(current: string) {
  const index = CURRENCY_OPTIONS.indexOf(current);
  if (index === -1) return CURRENCY_OPTIONS[0];
  return CURRENCY_OPTIONS[(index + 1) % CURRENCY_OPTIONS.length];
}

export function isValidExpiry(value: string) {
  const normalized = value.trim();
  if (normalized.length === 0) return true;
  return /^(0[1-9]|1[0-2])\/(\d{2})$/.test(normalized);
}

export function getNextUserWalletKey(userWallets: Record<string, unknown>) {
  const maxIndex = Object.keys(userWallets).reduce((accumulator, key) => {
    const match = /^wallet(\d+)$/.exec(key);
    if (!match) return accumulator;
    const index = Number(match[1]);
    return Number.isFinite(index) ? Math.max(accumulator, index) : accumulator;
  }, 0);

  return `wallet${Math.max(1, maxIndex + 1)}`;
}

export function parseAmount(input: string) {
  const amount = Number(input);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
}

export function getDefaultColor(type: WalletType) {
  if (type === "credit") return "#F97316";
  if (type === "shared") return "#0EA5E9";
  return "#7C3AED";
}

export function buildPreviewCurrencies(balances: BalanceRow[]) {
  return balances.reduce<Array<{ code: string; balance: number }>>((accumulator, row) => {
    const code = row.currency.trim().toLowerCase();
    const balance = Number(row.amount.trim() || 0);

    if (!code || accumulator.some((item) => item.code === code)) {
      return accumulator;
    }

    accumulator.push({
      code,
      balance: Number.isFinite(balance) ? balance : 0,
    });

    return accumulator;
  }, []);
}
