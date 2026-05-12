export function normalizeCurrencyCode(value: string | undefined | null) {
  if (!value) return "";
  const token = value.trim().toLowerCase().split(/\s+/).pop() ?? "";
  return token.replace(/[^a-z]/g, "");
}

export function interpolate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  );
}

