import React, { useMemo } from "react";

import { usePathname } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";

export function LanguageSwitch({ style }: { style?: any }) {
  const { language, setLanguage } = useI18n();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const background = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");

  const next = useMemo(() => (language === "en" ? "ar" : "en"), [language]);

  const shouldHide = useMemo(() => {
    if (!pathname) return false;
    // Hide floating language pill on Settings stack and camera auth flows to avoid overlapping titles/buttons
    return (
      pathname.startsWith("/(tabs)/settings") ||
      pathname.startsWith("/(auth)/id-scan") ||
      pathname.startsWith("/(auth)/selfie")
    );
  }, [pathname]);

  if (shouldHide) return null;

  return (
    <View style={[styles.container, { top: 12 + insets.top }, style]}>
      <Pressable
        onPress={() => setLanguage(next)}
        style={({ pressed }) => [
          styles.pill,
          { backgroundColor: background, borderColor: border },
          pressed ? styles.pressed : null,
        ]}
      >
        <ThemedText type="defaultSemiBold" style={styles.label}>
          {language === "en" ? "EN" : "AR"}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    zIndex: 20,
  },
  pill: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 13,
  },
});
