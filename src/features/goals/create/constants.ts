export const CURRENCIES = ["usd", "eur", "nis"] as const;
export const CREATE_GOAL_PREVIEW_GRADIENT = ["#A95EF1", "#7A48B7", "#3F568C"] as const;

export type Currency = (typeof CURRENCIES)[number];

export type FormValues = {
  title: string;
  targetAmount: string;
  currentAmount: string;
  currency: Currency;
  targetDate: number | null;
};

export function getCreateGoalTheme(isDark: boolean) {
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF";
  const inputBorder = isDark ? "rgba(255,255,255,0.18)" : "#94A3B8";
  const inputColor = isDark ? "#FFFFFF" : "#111827";

  return {
    inputBg,
    inputBorder,
    inputColor,
    inputStyle: {
      borderColor: inputBorder,
      color: inputColor,
      backgroundColor: inputBg,
    },
    placeholder: isDark ? "rgba(255,255,255,0.38)" : "#475569",
    pillBorder: isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1",
    pillTextColor: isDark ? "rgba(255,255,255,0.75)" : "#334155",
    pillBg: isDark ? "rgba(255,255,255,0.04)" : "#EEF2FF",
    headerSurface: isDark ? "rgba(124,58,237,0.10)" : "#EDE9FE",
    headerBorder: isDark ? "rgba(196,181,253,0.22)" : "#C4B5FD",
    datePickerCardBg: isDark
      ? "rgba(124,58,237,0.12)"
      : "rgba(255,255,255,0.96)",
    datePickerCardBorder: isDark
      ? "rgba(196,181,253,0.35)"
      : "rgba(124,58,237,0.18)",
  };
}

export function mapCurrency(value: string | undefined): Currency {
  const normalized = String(value || "usd").trim().toLowerCase();
  if (normalized.includes("eur")) return "eur";
  if (normalized.includes("nis")) return "nis";
  return "usd";
}
