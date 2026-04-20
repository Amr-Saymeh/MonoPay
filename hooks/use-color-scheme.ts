import { useThemeMode } from "@/src/providers/ThemeModeProvider";

export function useColorScheme() {
  const { colorScheme } = useThemeMode();
  return colorScheme;
}
