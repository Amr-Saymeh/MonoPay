/**
 * formatters.ts
 *
 * Pure display-formatting helpers for the shared-wallet feature.
 * Single source of truth — never duplicated inside components or hooks.
 *
 * SRP: every function has exactly one reason to change (display format change).
 */

/** Normalises a currency code to uppercase for display. */
export function formatCurrency(code: string): string {
  return code.trim().toUpperCase();
}

/** Formats a numeric amount to two decimal places. */
export function formatAmount(value: number): string {
  return Number(value).toFixed(2);
}

/**
 * Returns a human-readable label for a user given their profile.
 * Falls back progressively: name → email → uid → fallback string.
 */
export function getUserLabel(
  profile: { name?: string; email?: string } | undefined,
  fallback: string,
): string {
  return profile?.name?.trim() || profile?.email?.trim() || fallback;
}
