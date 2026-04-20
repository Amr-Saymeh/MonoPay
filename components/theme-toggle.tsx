import React, { useMemo } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { usePathname } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColor } from "@/hooks/use-theme-color";
import { useThemeMode } from "@/src/providers/ThemeModeProvider";

export function ThemeToggleOverlay() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colorScheme, toggle } = useThemeMode();

  const background = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");
  const icon = useThemeColor({}, "text");

  const iconName = useMemo(
    () => (colorScheme === "dark" ? "light-mode" : "dark-mode"),
    [colorScheme],
  );

  const shouldHide = useMemo(() => {
    if (!pathname) return false;
    // Hide overlay on Settings stack and camera-like auth flows to avoid overlapping headers/content
    return (
      pathname.startsWith("/(tabs)/settings") ||
      pathname.startsWith("/(auth)/id-scan") ||
      pathname.startsWith("/(auth)/selfie")
    );
  }, [pathname]);

  if (shouldHide) return null;

  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [
        styles.overlay,
        {
          top: insets.top + 8,
          backgroundColor: background,
          borderColor: border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      hitSlop={10}
    >
      <MaterialIcons name={iconName} size={18} color={icon} />
    </Pressable>
  );
}

export function ThemeToggleHeaderButton() {
  const { colorScheme, toggle } = useThemeMode();
  const icon = useThemeColor({}, "text");

  const iconName = useMemo(
    () => (colorScheme === "dark" ? "light-mode" : "dark-mode"),
    [colorScheme],
  );

  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [
        styles.headerButton,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      hitSlop={10}
    >
      <MaterialIcons name={iconName} size={22} color={icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    zIndex: 1000,
    elevation: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
