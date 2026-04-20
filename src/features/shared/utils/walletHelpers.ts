export function formatCurrency(code: string) {
  return code.trim().toUpperCase();
}

export function formatAmount(value: number) {
  return Number(value).toFixed(2);
}

export function getTotalBalance(currancies?: Record<string, number>) {
  return Object.values(currancies ?? {}).reduce((sum, value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);
}

export function getNextUserWalletKey(userWallets: Record<string, unknown>) {
  const maxIndex = Object.keys(userWallets).reduce((acc, key) => {
    const match = /^wallet(\d+)$/.exec(key);
    if (!match) return acc;
    const idx = Number(match[1]);
    return Number.isFinite(idx) ? Math.max(acc, idx) : acc;
  }, 0);
  return `wallet${Math.max(1, maxIndex + 1)}`;
}
