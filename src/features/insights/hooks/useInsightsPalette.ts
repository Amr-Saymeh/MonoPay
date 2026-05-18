import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useInsightsPalette() {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  return {
    bg: colors.background,
    blue: "#38BDF8",
    border: colors.border,
    card: scheme === "dark" ? "#12171E" : "#FFFFFF",
    colorsText: colors.text,
    green: "#22C55E",
    muted: scheme === "dark" ? "rgba(236,237,238,0.65)" : "rgba(17,24,28,0.55)",
    orange: "#F97316",
    purple: "#A855F7",
    scheme,
  } as const;
}