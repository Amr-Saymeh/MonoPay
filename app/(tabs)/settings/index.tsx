import React, { useCallback } from "react";

import { useRouter } from "expo-router";
import { Alert, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/src/providers/AuthProvider";
import { useThemeMode } from "@/src/providers/ThemeModeProvider";

import { SettingsHeader } from "@/src/features/settings/components/SettingsHeader";
import { SettingsLogoutButton } from "@/src/features/settings/components/SettingsLogoutButton";
import { SettingsProfileCard } from "@/src/features/settings/components/SettingsProfileCard";
import { SettingsRow } from "@/src/features/settings/components/SettingsRow";
import { SettingsSection } from "@/src/features/settings/components/SettingsSection";
import { styles } from "@/src/features/settings/styles";

export default function SettingsScreen() {
  const { t, language, setLanguage, isRtl } = useI18n();
  const { user, profile, signOut, signingOut } = useAuth();
  const { colorScheme, setMode } = useThemeMode();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isDark = colorScheme === "dark";

  const colors = {
    screenBg: useThemeColor({ light: "#F5F0FA", dark: "#0E1118" }, "background"),
    text: useThemeColor({}, "text"),
    muted: useThemeColor({ light: "rgba(0,0,0,0.5)", dark: "rgba(255,255,255,0.5)" }, "text"),
    card: useThemeColor({ light: "#FFFFFF", dark: "#1C1F2A" }, "surface"),
    sectionLabel: useThemeColor({ light: "#1A1A2E", dark: "#E0E0E0" }, "text"),
    chevron: useThemeColor({ light: "#9B7DFF", dark: "#A78BFA" }, "tint"),
    logout: useThemeColor({ light: "#7C3AED", dark: "#A78BFA" }, "tint"),
    avatarPlaceholder: useThemeColor({ light: "#EDE9FE", dark: "#374151" }, "surface"),
    iconBg: useThemeColor({ light: "#EDE9FE", dark: "rgba(139,92,246,0.2)" }, "surface"),
    icon: useThemeColor({ light: "#7C3AED", dark: "#A78BFA" }, "tint"),
    switchTrackOn: useThemeColor({ light: "#7C3AED", dark: "#8B5CF6" }, "tint"),
    switchTrackOff: useThemeColor({ light: "#D1D5DB", dark: "#374151" }, "border"),
  };

  const avatarUri = profile?.personalImage;
  const userName = profile?.name ?? "User";
  const userEmail = user?.email ?? profile?.email ?? "";
  const bottomClearance = Math.max(160, insets.bottom + 64);
  const languageValue = language === "ar" ? "العربية" : "English (US)";

  const sharedRowProps = {
    cardBg: colors.card,
    chevronColor: colors.chevron,
    iconBg: colors.iconBg,
    iconColor: colors.icon,
    isRtl,
    labelColor: colors.text,
    switchThumbOff: "#FFFFFF",
    switchThumbOn: "#FFFFFF",
    switchTrackOff: colors.switchTrackOff,
    switchTrackOn: colors.switchTrackOn,
    valueColor: colors.muted,
  };

  const accountRows = [
    {
      icon: "credit-card" as const,
      label: t("paymentMethods"),
      onPress: () => router.push("/(tabs)/wallets" as any),
      value: language === "ar" ? "3 بطاقات محفوظة" : "3 cards saved",
    },
    {
      icon: "language" as const,
      label: language === "ar" ? "اللغة" : "Language",
      onPress: () => setLanguage(language === "ar" ? "en" : "ar"),
      value: languageValue,
    },
    {
      icon: "category" as const,
      label: language === "ar" ? "الفئات" : "Categories",
      onPress: () => router.push("/(tabs)/settings/category-suggestions" as any),
      value: language === "ar" ? "إدارة الفئات" : "Manage categories",
    },
  ];

  const preferenceRows = [
    {
      icon: "dark-mode" as const,
      label: t("darkMode"),
      onToggle: (value: boolean) => setMode(value ? "dark" : "light"),
      toggleValue: isDark,
      type: "toggle" as const,
    },
    {
      icon: "shield" as const,
      label: language === "ar" ? "الأمان والخصوصية" : "Security & Privacy",
      onPress: () => router.push("/(tabs)/settings/change-password" as any),
    },
  ];

  const onLogout = useCallback(() => {
    Alert.alert(t("logoutConfirmTitle"), t("logoutConfirmMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } finally {
            router.replace("/(auth)/login" as any);
          }
        },
      },
    ]);
  }, [router, signOut, t]);

  return (
    <ThemedView style={[styles.screen, { backgroundColor: colors.screenBg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: bottomClearance },
        ]}
      >
        <SettingsHeader
          avatarPlaceholderBg={colors.avatarPlaceholder}
          avatarUri={avatarUri}
          iconColor={colors.icon}
          iconPurpleBg={colors.iconBg}
          isRtl={isRtl}
          onBack={() => router.replace("/(tabs)" as any)}
          textColor={colors.text}
          title={language === "ar" ? "الإعدادات" : "Settings"}
        />

        <SettingsProfileCard
          avatarUri={avatarUri}
          email={userEmail}
          editLabel={language === "ar" ? "تعديل الملف" : "Edit Profile"}
          name={userName}
          onEditProfile={() => router.push("/(tabs)/settings/edit-profile" as any)}
        />

        <SettingsSection color={colors.sectionLabel} isRtl={isRtl} title={t("account")}>
          {accountRows.map((row) => (
            <SettingsRow key={row.label} {...sharedRowProps} {...row} />
          ))}
        </SettingsSection>

        <SettingsSection color={colors.sectionLabel} isRtl={isRtl} title={t("preferences")}>
          {preferenceRows.map((row) => (
            <SettingsRow key={row.label} {...sharedRowProps} {...row} />
          ))}
        </SettingsSection>

        <SettingsLogoutButton
          color={colors.logout}
          disabled={signingOut}
          isRtl={isRtl}
          label={language === "ar" ? "تسجيل الخروج" : "Log Out"}
          onPress={onLogout}
        />
      </ScrollView>
    </ThemedView>
  );
}
