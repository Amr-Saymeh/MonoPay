import React, { useCallback, useState } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/src/providers/AuthProvider";
import { useThemeMode } from "@/src/providers/ThemeModeProvider";
import { SettingsRow } from "./_components/SettingsRow";
import { styles } from "./_styles";

export default function SettingsScreen() {
  const { t, language, setLanguage, isRtl } = useI18n();
  const { user, profile, signOut, signingOut } = useAuth();
  const { colorScheme, setMode } = useThemeMode();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const isDark = colorScheme === "dark";

  const screenBg = useThemeColor(
    { light: "#F5F0FA", dark: "#0E1118" },
    "background",
  );
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor(
    { light: "rgba(0,0,0,0.5)", dark: "rgba(255,255,255,0.5)" },
    "text",
  );
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#1C1F2A" },
    "surface",
  );
  const sectionLabelColor = useThemeColor(
    { light: "#1A1A2E", dark: "#E0E0E0" },
    "text",
  );
  const chevronColor = useThemeColor(
    { light: "#9B7DFF", dark: "#A78BFA" },
    "tint",
  );
  const logoutColor = useThemeColor(
    { light: "#7C3AED", dark: "#A78BFA" },
    "tint",
  );
  const avatarPlaceholderBg = useThemeColor(
    { light: "#EDE9FE", dark: "#374151" },
    "surface",
  );

  const iconPurpleBg = useThemeColor(
    { light: "#EDE9FE", dark: "rgba(139,92,246,0.2)" },
    "surface",
  );
  const iconPurple = useThemeColor(
    { light: "#7C3AED", dark: "#A78BFA" },
    "tint",
  );

  const switchTrackOn = useThemeColor(
    { light: "#7C3AED", dark: "#8B5CF6" },
    "tint",
  );
  const switchTrackOff = useThemeColor(
    { light: "#D1D5DB", dark: "#374151" },
    "border",
  );
  const switchThumbOn = "#FFFFFF";
  const switchThumbOff = "#FFFFFF";

  const avatarUri = profile?.personalImage;
  const userName = profile?.name ?? "User";
  const userEmail = user?.email ?? profile?.email ?? "";
  const bottomClearance = Math.max(160, insets.bottom + 64);

  const languageValue = language === "ar" ? "العربية" : "English (US)";

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
    <ThemedView style={[styles.screen, { backgroundColor: screenBg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: bottomClearance },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, isRtl ? styles.headerRtl : null]}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: iconPurpleBg },
              pressed ? styles.backBtnPressed : null,
            ]}
            onPress={() => router.replace("/(tabs)" as any)}
            accessibilityRole="button"
            accessibilityLabel={language === "ar" ? "العودة للرئيسية" : "Back to Home"}
          >
            <MaterialIcons
              name={isRtl ? "arrow-forward" : "arrow-back"}
              size={20}
              color={iconPurple}
            />
          </Pressable>

          <ThemedText style={[styles.headerTitle, { color: textColor }]}>
            {language === "ar" ? "الإعدادات" : "Settings"}
          </ThemedText>

          <View
            style={[
              styles.headerAvatar,
              { backgroundColor: avatarPlaceholderBg },
            ]}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.headerAvatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <MaterialIcons name="person" size={20} color={iconPurple} />
              </View>
            )}
          </View>
        </View>

        {/* Profile Card */}
        <LinearGradient
          colors={["#9B7DFF", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileAvatar}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.profileAvatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <MaterialIcons name="person" size={32} color="#FFFFFF" />
              </View>
            )}
          </View>
          <ThemedText style={styles.profileName}>{userName}</ThemedText>
          <ThemedText style={styles.profileEmail}>{userEmail}</ThemedText>
          <Pressable
            style={styles.editProfileBtn}
            onPress={() => router.push("/(tabs)/settings/edit-profile" as any)}
          >
            <ThemedText style={styles.editProfileText}>
              {language === "ar" ? "تعديل الملف" : "Edit Profile"}
            </ThemedText>
          </Pressable>
        </LinearGradient>

        {/* Account Section */}
        <ThemedText
          style={[
            styles.sectionLabel,
            { color: sectionLabelColor },
            isRtl ? styles.sectionLabelRtl : null,
          ]}
        >
          {t("account")}
        </ThemedText>

        <SettingsRow
          icon="credit-card"
          iconBg={iconPurpleBg}
          iconColor={iconPurple}
          label={t("paymentMethods")}
          value={language === "ar" ? "3 بطاقات محفوظة" : "3 cards saved"}
          isRtl={isRtl}
          labelColor={textColor}
          valueColor={mutedColor}
          cardBg={cardBg}
          chevronColor={chevronColor}
          onPress={() => router.push("/(tabs)/wallets" as any)}
          switchTrackOn={switchTrackOn}
          switchTrackOff={switchTrackOff}
          switchThumbOn={switchThumbOn}
          switchThumbOff={switchThumbOff}
        />

        <SettingsRow
          icon="language"
          iconBg={iconPurpleBg}
          iconColor={iconPurple}
          label={language === "ar" ? "اللغة" : "Language"}
          value={languageValue}
          isRtl={isRtl}
          labelColor={textColor}
          valueColor={mutedColor}
          cardBg={cardBg}
          chevronColor={chevronColor}
          onPress={() => setLanguage(language === "ar" ? "en" : "ar")}
          switchTrackOn={switchTrackOn}
          switchTrackOff={switchTrackOff}
          switchThumbOn={switchThumbOn}
          switchThumbOff={switchThumbOff}
        />
        <SettingsRow
          icon="category"
          iconBg={iconPurpleBg}
          iconColor={iconPurple}
          label={language === "ar" ? "الفئات" : "Categories"}
          value={language === "ar" ? "إدارة الفئات" : "Manage categories"}
          isRtl={isRtl}
          labelColor={textColor}
          valueColor={mutedColor}
          cardBg={cardBg}
          chevronColor={chevronColor}
          onPress={() => router.push("/category-suggestions" as any)}
          switchTrackOn={switchTrackOn}
          switchTrackOff={switchTrackOff}
          switchThumbOn={switchThumbOn}
          switchThumbOff={switchThumbOff}
        />

        {/* Preferences Section */}
        <ThemedText
          style={[
            styles.sectionLabel,
            { color: sectionLabelColor },
            isRtl ? styles.sectionLabelRtl : null,
          ]}
        >
          {t("preferences")}
        </ThemedText>

        <SettingsRow
          icon="notifications-none"
          iconBg={iconPurpleBg}
          iconColor={iconPurple}
          label={language === "ar" ? "الإشعارات" : "Notifications"}
          isRtl={isRtl}
          labelColor={textColor}
          valueColor={mutedColor}
          cardBg={cardBg}
          chevronColor={chevronColor}
          type="toggle"
          toggleValue={notificationsEnabled}
          onToggle={setNotificationsEnabled}
          switchTrackOn={switchTrackOn}
          switchTrackOff={switchTrackOff}
          switchThumbOn={switchThumbOn}
          switchThumbOff={switchThumbOff}
        />

        <SettingsRow
          icon="dark-mode"
          iconBg={iconPurpleBg}
          iconColor={iconPurple}
          label={t("darkMode")}
          isRtl={isRtl}
          labelColor={textColor}
          valueColor={mutedColor}
          cardBg={cardBg}
          chevronColor={chevronColor}
          type="toggle"
          toggleValue={isDark}
          onToggle={(val) => setMode(val ? "dark" : "light")}
          switchTrackOn={switchTrackOn}
          switchTrackOff={switchTrackOff}
          switchThumbOn={switchThumbOn}
          switchThumbOff={switchThumbOff}
        />

        <SettingsRow
          icon="shield"
          iconBg={iconPurpleBg}
          iconColor={iconPurple}
          label={language === "ar" ? "الأمان والخصوصية" : "Security & Privacy"}
          isRtl={isRtl}
          labelColor={textColor}
          valueColor={mutedColor}
          cardBg={cardBg}
          chevronColor={chevronColor}
          onPress={() => router.push("/(tabs)/settings/change-password" as any)}
          switchTrackOn={switchTrackOn}
          switchTrackOff={switchTrackOff}
          switchThumbOn={switchThumbOn}
          switchThumbOff={switchThumbOff}
        />

        {/* Log Out */}
        <Pressable
          style={[
            styles.logoutBtn,
            isRtl ? styles.logoutBtnRtl : null,
            {
              borderWidth: 1.5,
              borderColor: logoutColor,
              borderRadius: 16,
              marginHorizontal: 4,
            },
          ]}
          onPress={onLogout}
          disabled={signingOut}
        >
          <MaterialIcons name="logout" size={20} color={logoutColor} />
          <ThemedText style={[styles.logoutText, { color: logoutColor }]}>
            {language === "ar" ? "تسجيل الخروج" : "Log Out"}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
