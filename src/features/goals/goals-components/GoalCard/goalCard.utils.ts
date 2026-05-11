export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString();
}

export function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(
  amount: number,
  currency: string,
  compact = false,
) {
  const normalized = String(currency || "usd").toUpperCase();
  if (!compact) return `${amount.toFixed(2)} ${normalized}`;

  const absAmount = Math.abs(amount);
  if (absAmount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)}B ${normalized}`;
  }
  if (absAmount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M ${normalized}`;
  }
  if (absAmount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K ${normalized}`;
  }
  return `${amount.toFixed(2)} ${normalized}`;
}

