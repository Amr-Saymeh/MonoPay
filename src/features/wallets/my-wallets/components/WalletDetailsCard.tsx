
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";

import { useUserLabel } from "@/hooks/use-user-label";
import { styles } from "../styles";
import type { WalletCard } from "../types";

type WalletDetailsCardProps = {
  deleting: boolean;
  selected: WalletCard | null;
  selectedStatusLabel: string;
  selectedTypeLabel: string;
  onDelete: () => void;
  onManageShared: () => void;
};

export function WalletDetailsCard({
  deleting,
  selected,
  selectedStatusLabel,
  selectedTypeLabel,
  onDelete,
  onManageShared,
}: WalletDetailsCardProps) {
  const { t } = useI18n();
  const colorScheme = useColorScheme() ?? "light";
  const isSharedWallet = String(selected?.wallet?.type ?? "") === "shared";
  const ownerUid = isSharedWallet ? selected?.wallet?.ownerUid : null;
  const resolvedOwnerLabel = useUserLabel(ownerUid);

  const deleteButtonColor = colorScheme === "light" ? "#B91C1C" : "#DC2626";
  const deleteButtonDisabledColor =
    colorScheme === "light" ? "rgba(185,28,28,0.55)" : "rgba(220,38,38,0.55)";

  return (
    <ThemedView style={styles.detailsCard}>
      <ThemedText style={styles.sectionTitle}>{t("walletDetails")}</ThemedText>

      <View style={styles.detailRow}>
        <ThemedText style={styles.detailLabel}>{t("walletName")}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.detailValue}>
          {selected?.name ?? "—"}
        </ThemedText>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <ThemedText style={styles.detailLabel}>{t("walletType")}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.detailValue}>
          {selectedTypeLabel}
        </ThemedText>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <ThemedText style={styles.detailLabel}>{t("walletStatus")}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.detailValue}>
          {selectedStatusLabel}
        </ThemedText>
      </View>

      {String(selected?.wallet?.type ?? "") === "credit" ? (
        <>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>{t("walletExpiry")}</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>
              {selected?.wallet?.expiryDate ?? "—"}
            </ThemedText>
          </View>
        </>
      ) : null}

      {isSharedWallet ? <View style={styles.divider} /> : null}

      {isSharedWallet ? (
        <>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>{t("walletOwner")}</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>
              {resolvedOwnerLabel}
            </ThemedText>
          </View>

          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>{t("walletMembers")}</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>
              {Object.keys(selected?.wallet?.members ?? {}).length > 0
                ? Object.keys(selected?.wallet?.members ?? {}).length
                : "—"}
            </ThemedText>
          </View>

          <View style={styles.divider} />
          <Pressable
            onPress={onManageShared}
            style={({ pressed }) => [styles.sharedButton, pressed ? styles.pressed : null]}
          >
            <MaterialIcons name="groups" size={18} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.sharedButtonText}>
              Manage shared wallet
            </ThemedText>
          </Pressable>
        </>
      ) : null}

      <View style={styles.divider} />

      <Pressable
        disabled={!selected || deleting}
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          { backgroundColor: deleting ? deleteButtonDisabledColor : deleteButtonColor },
          pressed ? styles.pressed : null,
        ]}
      >
        <MaterialIcons name="delete" size={18} color="#db321c" />
        <ThemedText type="defaultSemiBold" style={styles.deleteButtonText}>
          {deleting ? t("deleting") : t("deleteWallet")}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}
