import type { WalletRecord } from "./types";

export const CARD_WIDTH = 320;
export const CARD_SPACING = 12;
export const CARD_INTERVAL = CARD_WIDTH + CARD_SPACING;

export function getDefaultColor(type: string | undefined) {
  if (type === "credit") return "#F97316";
  if (type === "shared") return "#0EA5E9";
  return "#7C3AED";
}

export function formatCurrency(code: string) {
  return code.trim().toUpperCase();
}

export function getBalances(wallet?: WalletRecord) {
  const data = wallet?.currencies || wallet?.currancies || {};
  return Object.entries(data)
    .filter(([key, value]) => key && Number.isFinite(Number(value)))
    .sort(([a], [b]) => a.localeCompare(b));
}

export function buildWalletBalances(wallet?: WalletRecord) {
  return getBalances(wallet).map(([code, amount]) => ({
    code,
    balance: Number(amount),
  }));
}
