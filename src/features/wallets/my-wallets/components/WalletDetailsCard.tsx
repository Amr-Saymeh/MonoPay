import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useI18n } from "@/hooks/use-i18n";

import { styles } from "../styles";
import type { WalletCard } from "../types";
import { formatCurrency } from "../utils";

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

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <ThemedText style={styles.detailLabel}>{t("walletCurrencies")}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.detailValue}>
          {Object.keys(selected?.wallet?.currancies ?? {}).length > 0
            ? Object.entries(selected?.wallet?.currancies ?? {})
                .map(([code, amount]) => `${formatCurrency(code)}: ${amount}`)
                .join("  ")
            : "—"}
        </ThemedText>
      </View>

      {String(selected?.wallet?.type ?? "") === "shared" ? (
        <>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>{t("walletOwner")}</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>
              {selected?.wallet?.ownerUid ?? "—"}
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
          deleting ? styles.deleteButtonDisabled : null,
          pressed ? styles.pressed : null,
        ]}
      >
        <MaterialIcons name="delete" size={18} color="#fff" />
        <ThemedText type="defaultSemiBold" style={styles.deleteButtonText}>
          {deleting ? t("deleting") : t("deleteWallet")}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}
