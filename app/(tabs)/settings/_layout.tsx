import React from "react";

import { Stack } from "expo-router";

import { ThemeToggleHeaderButton } from "@/components/theme-toggle";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function SettingsLayout() {
  const { t } = useI18n();
  const headerBg = useThemeColor({}, "background");
  const headerTint = useThemeColor({}, "text");

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: headerBg,
        },
        headerTintColor: headerTint,
        headerRight: () => <ThemeToggleHeaderButton />,
        headerTitleStyle: {
          fontFamily: Fonts.sansBold,
        },
        headerBackTitleStyle: {
          fontFamily: Fonts.sans,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ title: t("editProfile") }} />
      <Stack.Screen
        name="change-password"
        options={{ title: t("changePassword") }}
      />
      <Stack.Screen
        name="avatar-camera"
        options={{ title: t("retakePhoto") }}
      />
    </Stack>
  );
}
