import { useThemeColor } from "@/hooks/use-theme-color";

export function useSettingsPalette() {
  return {
    avatarPlaceholder: useThemeColor({ light: "#EDE9FE", dark: "#374151" }, "surface"),
    card: useThemeColor({ light: "#FFFFFF", dark: "#1C1F2A" }, "surface"),
    chevron: useThemeColor({ light: "#9B7DFF", dark: "#A78BFA" }, "tint"),
    icon: useThemeColor({ light: "#7C3AED", dark: "#A78BFA" }, "tint"),
    iconBg: useThemeColor({ light: "#EDE9FE", dark: "rgba(139,92,246,0.2)" }, "surface"),
    logout: useThemeColor({ light: "#7C3AED", dark: "#A78BFA" }, "tint"),
    muted: useThemeColor({ light: "rgba(0,0,0,0.5)", dark: "rgba(255,255,255,0.5)" }, "text"),
    screenBg: useThemeColor({ light: "#F5F0FA", dark: "#0E1118" }, "background"),
    sectionLabel: useThemeColor({ light: "#1A1A2E", dark: "#E0E0E0" }, "text"),
    switchTrackOff: useThemeColor({ light: "#D1D5DB", dark: "#374151" }, "border"),
    switchTrackOn: useThemeColor({ light: "#7C3AED", dark: "#8B5CF6" }, "tint"),
    text: useThemeColor({}, "text"),
  };
}