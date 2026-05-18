import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";

export function useCategorySuggestionsPalette() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    screenBg: useThemeColor({ light: "#F8F5FC", dark: "#0F0D13" }, "background"),
    text: useThemeColor({ light: "#1A1A2E", dark: "#F5F5F7" }, "text"),
    muted: useThemeColor({ light: "#6B7280", dark: "rgba(255,255,255,0.6)" }, "text"),
    inputBg: useThemeColor({ light: "#FFFFFF", dark: "rgba(255,255,255,0.08)" }, "inputBackground"),
    accent: useThemeColor({ light: "#6200EE", dark: "#A78BFA" }, "tint"),
    accentStrong: useThemeColor({ light: "#6200EE", dark: "#8B5CF6" }, "tint"),
    border: useThemeColor(
      { light: "rgba(98,0,238,0.15)", dark: "rgba(167,139,250,0.34)" },
      "border",
    ),
    surfaceSoft: useThemeColor(
      { light: "rgba(232,222,248,0.45)", dark: "rgba(167,139,250,0.16)" },
      "surface",
    ),
    closeBg: useThemeColor(
      { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.12)" },
      "surface",
    ),
    placeholder: useThemeColor(
      { light: "#9CA3AF", dark: "rgba(255,255,255,0.4)" },
      "placeholder",
    ),
  };

  return {
    activeBubbleBg: isDark ? "#8B5CF6" : "#6200EE",
    colors,
    ctaShadow: isDark ? "rgba(139,92,246,0.65)" : "#6200EE",
    idleBubbleBg: isDark ? "rgba(167,139,250,0.2)" : "rgba(232,222,248,0.6)",
    idleBubbleText: isDark ? "#E9D5FF" : "#6200EE",
    isDark,
  };
}