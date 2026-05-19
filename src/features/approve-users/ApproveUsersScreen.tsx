import { useState } from "react";

import { Alert, View } from "react-native";

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
  const { pendingUsers } = usePendingUsers();
  const [expandedPendingUserId, setExpandedPendingUserId] = useState<string | null>(null);
  const pendingCount = pendingUsers.length;

  const approveLabel = t("approveAction");
  const rejectLabel = t("rejectAction");

  const emailLabel = t("email");
  const phoneLabel = t("phone");
  const addressLabel = t("address");
  const identityNumberLabel = t("identityNumberLabel");
  const personalLabel = t("personal");
  const identityLabel = t("identity");

  function approvePendingUser(userId: string, userName?: string) {
    const title = t("approveUserTitle");
    const message = `${approveLabel} ${userName ?? userId}?`;

    Alert.alert(title, message, [
      { text: t("cancel"), style: "cancel" },
      {
        text: approveLabel,
        style: "default",
        onPress: () => void approveUser(userId),
      },
    ]);
  }

  function rejectPendingUser(userId: string, userName?: string) {
    const title = t("rejectUserTitle");
    const message = `${rejectLabel} ${userName ?? userId}?`;

    Alert.alert(title, message, [
      { text: t("cancel"), style: "cancel" },
      {
        text: rejectLabel,
        style: "destructive",
        onPress: () => void rejectUser(userId),
      },
    ]);
  }

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

      {pendingCount === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText type="subtitle">{t("noPendingUsers")}</ThemedText>
          <ThemedText style={styles.emptyText}>{t("usersWithType0")}</ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.list}>
          {pendingUsers.map((item) => {
            const isExpanded = expandedPendingUserId === item.id;

            return (
              <PendingUserCard
                key={item.id}
                item={item}
                expanded={isExpanded}
                approveLabel={approveLabel}
                rejectLabel={rejectLabel}
                emailLabel={emailLabel}
                phoneLabel={phoneLabel}
                addressLabel={addressLabel}
                identityNumberLabel={identityNumberLabel}
                personalLabel={personalLabel}
                identityLabel={identityLabel}
                onToggle={() =>
                  setExpandedPendingUserId((current) => (current === item.id ? null : item.id))
                }
                onApprove={() => approvePendingUser(item.id, item.data.name)}
                onReject={() => rejectPendingUser(item.id, item.data.name)}
              />
            );
          })}
        </View>
      )}
    </ParallaxScrollView>
  );
}
