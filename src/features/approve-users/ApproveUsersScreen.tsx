import React, { useState } from "react";

import { ActivityIndicator, Alert, Platform, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";

import { PendingUserCard } from "./components/PendingUserCard";
import { usePendingUsers } from "./hooks/usePendingUsers";
import { styles } from "./styles";
import { approveUser, rejectUser } from "./utils";

export default function ApproveUsersScreen() {
  const { t } = useI18n();
  const { loading, pendingUsers } = usePendingUsers();
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const pendingCount = pendingUsers.length;
  const labels = {
    address: t("address"),
    approve: t("approveAction"),
    email: t("email"),
    identity: t("identity"),
    identityNumber: t("identityNumberLabel"),
    personal: t("personal"),
    phone: t("phone"),
    reject: t("rejectAction"),
  };

  const confirmWeb = (title: string, message: string) => {
    const confirmFn = (globalThis as any).confirm;
    if (typeof confirmFn === "function") return Boolean(confirmFn(`${title}\n\n${message}`));
    return true;
  };

  const handleApprove = (userId: string, userName?: string) => {
    const title = t("approveUserTitle");
    const message = `${labels.approve} ${userName ?? userId}?`;

    const run = async () => {
      await approveUser(userId);
    };

    if (Platform.OS === "web") {
      if (!confirmWeb(title, message)) return;
      void run();
      return;
    }

    Alert.alert(title, message, [
      { text: t("cancel"), style: "cancel" },
      {
        text: labels.approve,
        style: "default",
        onPress: () => void run(),
      },
    ]);
  };

  const handleReject = (userId: string, userName?: string) => {
    const title = t("rejectUserTitle");
    const message = `${labels.reject} ${userName ?? userId}?`;
    const run = async () => {
      await rejectUser(userId);
    };
    if (Platform.OS === "web") {
      if (!confirmWeb(title, message)) return;
      void run();
      return;
    }
    Alert.alert(title, message, [
      { text: t("cancel"), style: "cancel" },
      {
        text: labels.reject,
        style: "destructive",
        onPress: () => void run(),
      },
    ]);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E9F7FF", dark: "#11222A" }}
      headerImage={
        <IconSymbol
          size={260}
          color="#0a7ea4"
          name="person.crop.circle"
          style={styles.headerIcon}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          {t("approveUsers")}
        </ThemedText>
        <View style={styles.countPill}>
          <ThemedText type="defaultSemiBold" style={styles.countPillText}>
            {pendingCount}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedText style={styles.subtitle}>{t("pendingVerification")}</ThemedText>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : pendingUsers.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText type="subtitle">{t("noPendingUsers")}</ThemedText>
          <ThemedText style={styles.emptyText}>{t("usersWithType0")}</ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.list}>
          {pendingUsers.map((item) => {
            const isExpanded = expandedUserId === item.id;

            return (
              <PendingUserCard
                key={item.id}
                item={item}
                expanded={isExpanded}
                approveLabel={labels.approve}
                rejectLabel={labels.reject}
                emailLabel={labels.email}
                phoneLabel={labels.phone}
                addressLabel={labels.address}
                identityNumberLabel={labels.identityNumber}
                personalLabel={labels.personal}
                identityLabel={labels.identity}
                onToggle={() => setExpandedUserId((current) => (current === item.id ? null : item.id))}
                onApprove={() => handleApprove(item.id, item.data.name)}
                onReject={() => handleReject(item.id, item.data.name)}
              />
            );
          })}
        </View>
      )}
    </ParallaxScrollView>
  );
}
