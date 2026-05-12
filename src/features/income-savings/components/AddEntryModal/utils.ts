export function normalizeCurrencyCode(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}
