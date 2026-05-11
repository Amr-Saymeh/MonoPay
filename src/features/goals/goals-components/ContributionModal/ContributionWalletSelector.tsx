import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import { hapticSelection } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";

import { interpolate } from "./contributionModal.utils";
import { styles } from "./stylesheet";
import type { UserWalletRef } from "./types";

type ContributionWalletSelectorProps = {
  wallets: UserWalletRef[];
  selectedWalletKey: string | null;
  loading: boolean;
  currencyLabel: string;
  isDark: boolean;
  cardBg: string;
  cardBorder: string;
  iconColor: string;
  onSelect: (walletKey: string) => void;
  showError: (title: string, description: string) => void;
};

export function ContributionWalletSelector({
  wallets,
  selectedWalletKey,
  loading,
  currencyLabel,
  isDark,
  cardBg,
  cardBorder,
  iconColor,
  onSelect,
  showError,
}: ContributionWalletSelectorProps) {
  const { t } = useI18n();

  return (
    <>
      <ThemedText style={styles.label}>{t("goals.selectWallet")} *</ThemedText>

      {loading ? (
        <View style={[styles.stateBox, { borderColor: cardBorder }]}>
          <ThemedText style={styles.loadingText}>
            {t("goals.loadingWallets")}
          </ThemedText>
        </View>
      ) : wallets.length === 0 ? (
        <View style={[styles.stateBox, styles.errorBox]}>
          <MaterialIcons
            name="account-balance-wallet"
            size={24}
            color="#EF4444"
          />
          <ThemedText style={styles.errorBoxTitle}>
            {interpolate(t("goals.noWalletsForCurrencyTitle"), {
              currency: currencyLabel,
            })}
          </ThemedText>
          <ThemedText style={styles.errorBoxSub}>
            {interpolate(t("goals.noWalletsForCurrencySubtext"), {
              currency: currencyLabel,
            })}
          </ThemedText>
        </View>
      ) : (
        <GestureScrollView
          horizontal
          style={styles.walletListScroll}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          directionalLockEnabled
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.walletList}
        >
          {wallets.map((wallet) => {
            const isSelected = selectedWalletKey === wallet.walletKey;
            const hasBalance = wallet.balance > 0;

            return (
              <Pressable
                key={wallet.walletKey}
                onPress={() => {
                  if (!hasBalance) {
                    showError(
                      t("goals.emptyWalletTitle"),
                      interpolate(t("goals.emptyWalletDescription"), {
                        wallet: wallet.name,
                        currency: currencyLabel,
                      }),
                    );
                    return;
                  }
                  hapticSelection();
                  onSelect(wallet.walletKey);
                }}
                style={[
                  styles.walletCard,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? "rgba(139,92,246,0.18)"
                        : "rgba(139,92,246,0.07)"
                      : cardBg,
                    borderColor: isSelected ? "#8B5CF6" : cardBorder,
                    opacity: hasBalance ? 1 : 0.45,
                  },
                ]}
              >
                <View style={styles.walletCardTop}>
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={16}
                    color={isSelected ? "#8B5CF6" : iconColor}
                  />
                  {isSelected ? (
                    <MaterialIcons
                      name="check-circle"
                      size={16}
                      color="#8B5CF6"
                    />
                  ) : null}
                </View>
                <ThemedText numberOfLines={1} style={styles.walletName}>
                  {wallet.name}
                </ThemedText>
                <ThemedText
                  numberOfLines={1}
                  style={[
                    styles.walletBalance,
                    { color: hasBalance ? "#10B981" : "#EF4444" },
                  ]}
                >
                  {wallet.balance.toFixed(2)} {currencyLabel}
                </ThemedText>
              </Pressable>
            );
          })}
        </GestureScrollView>
      )}
    </>
  );
}

