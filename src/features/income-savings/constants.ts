import type {
  Regularity,
  SourceType,
} from "@/src/services/incomeSources.service";

export type IncomeSourceFormValues = {
  type: SourceType;
  regularity: Regularity;
  selectedWalletSlot: string | null;
  amount: string;
  currency: string;
  notes: string;
};

export type SourceTypeFilter = SourceType | "all";

export const SOURCE_TYPE_FILTERS: SourceTypeFilter[] = [
  "all",
  "salary",
  "loan",
  "freelance",
  "investment",
  "other",
];

export const SOURCE_TYPES: SourceType[] = [
  "salary",
  "loan",
  "freelance",
  "investment",
  "other",
];

export const REGULARITY_TYPES: Regularity[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

export const INCOME_DELETE_SHEET_SNAP_POINTS = ["34%"];
export const INCOME_BOTTOM_SHEET_INSET = 0;
export const INCOME_SUCCESS_BOTTOM_SHEET_INSET = 0;
export const INCOME_EMPTY_ICON_COLOR = "rgba(124,58,237,0.25)";
export const INCOME_EMPTY_SEARCH_ICON_COLOR = "rgba(124,58,237,0.28)";
export const INCOME_WHITE_ICON = "#FFFFFF";

export function getIncomeAccentColor(isDark: boolean): string {
  return isDark ? "#C4B5FD" : "#7C3AED";
}

export function getIncomeNeutralIconColor(isDark: boolean): string {
  return isDark ? "#E5E7EB" : "#374151";
}

export function getIncomeSavingsTheme(isDark: boolean) {
  return {
    cardBg: isDark ? "rgba(124,58,237,0.16)" : "rgba(124,58,237,0.08)",
    cardBorder: isDark ? "rgba(196,181,253,0.35)" : "rgba(124,58,237,0.25)",
    regularityTextColor: isDark ? "#D1FAE5" : "#065F46",
    headerSurface: isDark ? "rgba(124,58,237,0.10)" : "#EDE9FE",
    headerBorder: isDark ? "rgba(196,181,253,0.22)" : "#C4B5FD",
    sheetBg: isDark ? "#181124" : "#FFFFFF",
    sheetHandle: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
    sheetTitle: isDark ? "#F5F3FF" : "#1F2937",
    sheetText: isDark ? "rgba(255,255,255,0.75)" : "#4B5563",
    sheetBorder: isDark ? "rgba(196,181,253,0.3)" : "rgba(124,58,237,0.2)",
    searchBg: isDark ? "rgba(124,58,237,0.10)" : "#FFFFFF",
    searchBorder: isDark ? "rgba(196,181,253,0.25)" : "rgba(124,58,237,0.18)",
    filterText: isDark ? "#EDE9FE" : "#4C1D95",
  };
}

export function getIncomeFloatingButtonBottom(
  platform: string,
  bottomInset: number,
): number {
  return platform === "ios"
    ? Math.max(bottomInset + 100, 86)
    : Math.max(bottomInset + 88, 76);
}

export function normalizeCurrencyCode(value: string | undefined | null): string {
  if (!value) return "";
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

export function monthlyEquivalent(amount: number, regularity: Regularity): number {
  if (regularity === "daily") return amount * 30;
  if (regularity === "weekly") return amount * 4;
  if (regularity === "yearly") return amount / 12;
  return amount;
}

export function interpolateTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  );
}

export function getIncomeSourceTypeLabel(
  sourceType: SourceType,
  labels: Record<SourceType, string>,
): string {
  return labels[sourceType] ?? labels.other;
}
