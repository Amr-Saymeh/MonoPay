import type { MaterialIcons } from "@expo/vector-icons";

export type SortKey = "date" | "progress" | "targetAmount" | "amountSaved";
export type SortDir = "asc" | "desc";

export type SortOption = {
  key: SortKey;
  icon: keyof typeof MaterialIcons.glyphMap;
  defaultDir: SortDir;
};

export const SORT_OPTIONS: SortOption[] = [
  { key: "date", icon: "calendar-today", defaultDir: "asc" },
  { key: "progress", icon: "trending-up", defaultDir: "desc" },
  { key: "targetAmount", icon: "flag", defaultDir: "desc" },
  { key: "amountSaved", icon: "savings", defaultDir: "desc" },
];

export const GOAL_DELETE_SHEET_SNAP_POINTS = ["34%"];
export const GOALS_SUCCESS_BOTTOM_SHEET_INSET = 0;
export const GOALS_SUMMARY_GRADIENT = ["#B166F8", "#864CBD", "#435799"] as const;
export const GOALS_EMPTY_ICON_COLOR = "rgba(124,58,237,0.25)";
export const GOALS_EMPTY_SEARCH_ICON_COLOR = "rgba(124,58,237,0.28)";
export const GOALS_WHITE_ICON = "#FFFFFF";
export const GOALS_SOFT_WHITE_ICON = "rgba(255,255,255,0.82)";

export function getGoalsAccentColor(isDark: boolean): string {
  return isDark ? "#C4B5FD" : "#7C3AED";
}

export function getGoalsNeutralIconColor(isDark: boolean): string {
  return isDark ? "#E5E7EB" : "#374151";
}

export function getGoalsSearchClearIconColor(isDark: boolean): string {
  return isDark ? "#E5E7EB" : "#6B7280";
}

export function getGoalsTheme(isDark: boolean) {
  return {
    headerSurface: isDark ? "rgba(124,58,237,0.10)" : "#EDE9FE",
    headerBorder: isDark ? "rgba(196,181,253,0.22)" : "#C4B5FD",
    sheetBg: isDark ? "#181124" : "#FFFFFF",
    sheetHandle: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
    sheetTitle: isDark ? "#F5F3FF" : "#1F2937",
    sheetText: isDark ? "rgba(255,255,255,0.75)" : "#4B5563",
    sheetBorder: isDark ? "rgba(196,181,253,0.3)" : "rgba(124,58,237,0.2)",
    sortSurface: isDark ? "rgba(124,58,237,0.08)" : "#FFFFFF",
    sortBorder: isDark ? "rgba(196,181,253,0.25)" : "rgba(124,58,237,0.16)",
    sortText: isDark ? "#EDE9FE" : "#4C1D95",
    searchBg: isDark ? "rgba(124,58,237,0.10)" : "#FFFFFF",
    searchBorder: isDark ? "rgba(196,181,253,0.25)" : "rgba(124,58,237,0.18)",
    searchText: isDark ? "#F5F3FF" : "#1F2937",
    searchPlaceholder: isDark ? "rgba(255,255,255,0.45)" : "#6B7280",
  };
}

export function getGoalsFloatingButtonBottom(
  platform: string,
  bottomInset: number,
): number {
  return platform === "ios"
    ? Math.max(bottomInset + 100, 86)
    : Math.max(bottomInset + 88, 76);
}

export function sortGoals<T extends {
  goalTargetDate?: number;
  goalTargetAmount?: number;
  currentAmount?: number;
}>(goals: T[], key: SortKey, dir: SortDir): T[] {
  return [...goals].sort((a, b) => {
    let valA: number;
    let valB: number;

    switch (key) {
      case "date":
        valA = a.goalTargetDate ?? 0;
        valB = b.goalTargetDate ?? 0;
        break;
      case "progress":
        valA =
          (a.goalTargetAmount ?? 0) > 0
            ? (a.currentAmount ?? 0) / (a.goalTargetAmount ?? 1)
            : 0;
        valB =
          (b.goalTargetAmount ?? 0) > 0
            ? (b.currentAmount ?? 0) / (b.goalTargetAmount ?? 1)
            : 0;
        break;
      case "targetAmount":
        valA = a.goalTargetAmount ?? 0;
        valB = b.goalTargetAmount ?? 0;
        break;
      case "amountSaved":
        valA = a.currentAmount ?? 0;
        valB = b.currentAmount ?? 0;
        break;
      default:
        return 0;
    }

    return dir === "asc" ? valA - valB : valB - valA;
  });
}

export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(2);
}
