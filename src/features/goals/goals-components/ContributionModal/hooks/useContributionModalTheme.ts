import { useMemo } from "react";

import type { ContributionModalTheme } from "../types";

export function useContributionModalTheme(
  isDark: boolean,
): ContributionModalTheme {
  return useMemo(
    () => ({
      inputBg: isDark ? "rgba(255,255,255,0.06)" : "#F9FAFB",
      inputBorder: isDark ? "rgba(255,255,255,0.15)" : "#E5E7EB",
      inputColor: isDark ? "#FFFFFF" : "#111827",
      placeholderColor: isDark ? "rgba(255,255,255,0.3)" : "#9CA3AF",
      iconColor: isDark ? "#FFFFFF" : "#6B7280",
      cardBg: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
      cardBorder: isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB",
      sheetBg: isDark ? "#1F1B2E" : "#FFFFFF",
      sheetHandle: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
      cancelBorder: isDark ? "rgba(255,255,255,0.2)" : "#E5E7EB",
      cancelTextColor: isDark
        ? "rgba(255,255,255,0.78)"
        : "rgba(17,24,39,0.78)",
    }),
    [isDark],
  );
}

