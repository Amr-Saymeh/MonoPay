import { useCallback, useMemo } from "react";

import { useRouter } from "expo-router";
import { Alert, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { useI18n } from "@/hooks/use-i18n";
import { useWalletCards } from "@/src/features/wallets/my-wallets/hooks/useWalletCards";
import { useAuth } from "@/src/providers/AuthProvider";
import { useThemeMode } from "@/src/providers/ThemeModeProvider";

import { SettingsHeader } from "@/src/features/settings/components/SettingsHeader";
import { SettingsLogoutButton } from "@/src/features/settings/components/SettingsLogoutButton";
import { SettingsProfileCard } from "@/src/features/settings/components/SettingsProfileCard";
import { SettingsRow } from "@/src/features/settings/components/SettingsRow";
import { SettingsSection } from "@/src/features/settings/components/SettingsSection";
import { useSettingsPalette } from "@/src/features/settings/hooks/useSettingsPalette";
import { styles } from "@/src/features/settings/styles";

const MIN_BOTTOM_CLEARANCE = 160;
const BOTTOM_INSET_OFFSET = 64;
const HEADER_TOP_PADDING = 8;
const LIGHT_MODE = "light";
const DARK_MODE = "dark";
const LOGIN_ROUTE = "/(auth)/login";
const HOME_ROUTE = "/(tabs)";
const WALLETS_ROUTE = "/(tabs)/wallets";
const CATEGORIES_ROUTE = "/(tabs)/settings/category-suggestions";
const CHANGE_PASSWORD_ROUTE = "/(tabs)/settings/change-password";
const EDIT_PROFILE_ROUTE = "/(tabs)/settings/edit-profile";

export default function SettingsScreen() {
  const { t, language, setLanguage, isRtl } = useI18n();
  const { user, profile, signOut, signingOut } = useAuth();
  const { colorScheme, setMode } = useThemeMode();
  const { cards } = useWalletCards({ userId: user?.uid });
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = useSettingsPalette();

  const isDark = colorScheme === DARK_MODE;

  const avatarUri = profile?.personalImage;
  const userName = profile?.name ?? "User";
  const userEmail = user?.email ?? profile?.email ?? "";
  const bottomClearance = Math.max(MIN_BOTTOM_CLEARANCE, insets.bottom + BOTTOM_INSET_OFFSET);

  const languageValue = useMemo(
    () => (language === "ar" ? t("languageArabic") : t("languageEnglishUs")),
    [language, t],
  );

  const paymentMethodsValue = useMemo(
    () => t("paymentMethodsSavedCount").replace("{count}", String(cards.length)),
    [cards.length, t],
  );

  const sharedRowProps = useMemo(
    () => ({
      cardBg: palette.card,
      chevronColor: palette.chevron,
      iconBg: palette.iconBg,
      iconColor: palette.icon,
      isRtl,
      labelColor: palette.text,
      switchThumbOff: "#FFFFFF",
      switchThumbOn: "#FFFFFF",
      switchTrackOff: palette.switchTrackOff,
      switchTrackOn: palette.switchTrackOn,
      valueColor: palette.muted,
    }),
    [isRtl, palette.card, palette.chevron, palette.icon, palette.iconBg, palette.muted, palette.switchTrackOff, palette.switchTrackOn, palette.text],
  );

  const accountRows = useMemo(
    () => [
      {
        icon: "credit-card" as const,
        label: t("paymentMethods"),
        onPress: () => router.push(WALLETS_ROUTE as any),
        value: paymentMethodsValue,
      },
      {
        icon: "language" as const,
        label: t("changeLanguage"),
        onPress: () => setLanguage(language === "ar" ? "en" : "ar"),
        value: languageValue,
      },
      {
        icon: "category" as const,
        label: t("categories"),
        onPress: () => router.push(CATEGORIES_ROUTE as any),
        value: t("manageCategories"),
      },
    ],
    [language, languageValue, paymentMethodsValue, router, setLanguage, t],
  );

  const preferenceRows = useMemo(
    () => [
      {
        icon: "dark-mode" as const,
        label: t("darkMode"),
        onToggle: (value: boolean) => setMode(value ? DARK_MODE : LIGHT_MODE),
        toggleValue: isDark,
        type: "toggle" as const,
      },
      {
        icon: "shield" as const,
        label: t("securityPrivacy"),
        onPress: () => router.push(CHANGE_PASSWORD_ROUTE as any),
      },
    ],
    [isDark, router, setMode, t],
  );

  const onLogout = useCallback(() => {
    Alert.alert(t("logoutConfirmTitle"), t("logoutConfirmMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace(LOGIN_ROUTE as any);
          } catch {
            Alert.alert(t("error"), t("failedToSignOut"));
          }
        },
      },
    ]);
  }, [router, signOut, t]);

  return (
    <ThemedView style={[styles.screen, { backgroundColor: palette.screenBg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + HEADER_TOP_PADDING, paddingBottom: bottomClearance },
        ]}
      >
        <SettingsHeader
          avatarPlaceholderBg={palette.avatarPlaceholder}
          avatarUri={avatarUri}
          iconColor={palette.icon}
          iconPurpleBg={palette.iconBg}
          isRtl={isRtl}
          onBack={() => router.replace(HOME_ROUTE as any)}
          textColor={palette.text}
          title={t("settings")}
        />

        <SettingsProfileCard
          avatarUri={avatarUri}
          email={userEmail}
          editLabel={t("editProfile")}
          name={userName}
          onEditProfile={() => router.push(EDIT_PROFILE_ROUTE as any)}
        />

        <SettingsSection color={palette.sectionLabel} isRtl={isRtl} title={t("account")}>
          {accountRows.map((row) => (
            <SettingsRow key={row.label} {...sharedRowProps} {...row} />
          ))}
        </SettingsSection>

        <SettingsSection color={palette.sectionLabel} isRtl={isRtl} title={t("preferences")}>
          {preferenceRows.map((row) => (
            <SettingsRow key={row.label} {...sharedRowProps} {...row} />
          ))}
        </SettingsSection>

        <SettingsLogoutButton
          color={palette.logout}
          disabled={signingOut}
          isRtl={isRtl}
          label={t("logout")}
          onPress={onLogout}
        />
      </ScrollView>
    </ThemedView>
  );
}
