import { AppDialogModal } from "@/components/ui/AppDialogModal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";
import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { db } from "@/src/firebaseConfig";
import { hapticSelection, hapticSuccess, hapticTap } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { get, onValue, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

interface UserWalletRef {
  walletKey: string;
  name: string;
  balance: number;
  currencyKey: string;
  currencyContainer: "currancies" | "currencies";
}

function normalizeCurrencyCode(value: string | undefined | null): string {
  if (!value) return "";
  const token = value.trim().toLowerCase().split(/\s+/).pop() ?? "";
  return token.replace(/[^a-z]/g, "");
}

interface ContributionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason?: string) => void;
  currency: string;
  targetAmount?: number;
  currentAmount?: number;
}

type ContributionFormValues = {
  amount: string;
  reason: string;
  selectedWalletKey: string | null;
};

export const ContributionModal = ({
  visible,
  onClose,
  onSubmit,
  currency,
  targetAmount,
  currentAmount = 0,
}: ContributionModalProps) => {
  const { t } = useI18n();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const normalizedGoalCurrency = normalizeCurrencyCode(currency) || "usd";
  const currencyLabel = normalizedGoalCurrency.toUpperCase();

  const [wallets, setWallets] = useState<UserWalletRef[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  const interpolate = React.useCallback((template: string, values: Record<string, string>) => {
    return Object.entries(values).reduce(
      (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
      template,
    );
  }, []);

  const showError = React.useCallback((title: string, description: string) => {
    setErrorTitle(title);
    setErrorDescription(description);
    setErrorVisible(true);
  }, []);

  const { control, watch, setValue, reset, handleSubmit } = useForm<ContributionFormValues>({
    defaultValues: {
      amount: "",
      reason: "",
      selectedWalletKey: null,
    },
  });

  const selectedWalletKey = watch("selectedWalletKey");

  useEffect(() => {
    if (!visible || !user) return;

    reset({
      amount: "",
      reason: "",
      selectedWalletKey: null,
    });
    setWallets([]);
    setLoadingWallets(true);

    const userWalletRef = ref(db, `users/${user.uid}/userwallet`);
    const unsubscribe = onValue(userWalletRef, async (snapshot) => {
      const data = snapshot.val() as
        | Record<string, { name?: string; walletid?: number | string; id?: number | string }>
        | null;

      if (!data) {
        setWallets([]);
        setLoadingWallets(false);
        return;
      }

      const resolved: UserWalletRef[] = [];

      await Promise.all(
        Object.entries(data).map(async ([slotKey, link]) => {
          try {
            const walletId =
              Number.isFinite(Number(link?.walletid)) && Number(link?.walletid) > 0
                ? Number(link.walletid)
                : Number.isFinite(Number(link?.id)) && Number(link?.id) > 0
                  ? Number(link.id)
                  : null;

            const walletKey = walletId ? `wallet${walletId}` : slotKey;
            const snap = await get(ref(db, `wallets/${walletKey}`));
            const walletData = snap.val();
            if (!walletData || walletData.type === "goal") return;

            const currancies: Record<string, number> = walletData.currancies || {};
            const currencies: Record<string, number> = walletData.currencies || {};

            const exactCurranciesKey = Object.keys(currancies).find(
              (k) => normalizeCurrencyCode(k) === normalizedGoalCurrency,
            );
            const exactCurrenciesKey = Object.keys(currencies).find(
              (k) => normalizeCurrencyCode(k) === normalizedGoalCurrency,
            );

            if (exactCurranciesKey !== undefined) {
              resolved.push({
                walletKey,
                name: link?.name || walletKey,
                balance: currancies[exactCurranciesKey] || 0,
                currencyKey: exactCurranciesKey,
                currencyContainer: "currancies",
              });
            } else if (exactCurrenciesKey !== undefined) {
              resolved.push({
                walletKey,
                name: link?.name || walletKey,
                balance: currencies[exactCurrenciesKey] || 0,
                currencyKey: exactCurrenciesKey,
                currencyContainer: "currencies",
              });
            }
          } catch {
            // Skip unreachable wallets.
          }
        }),
      );

      resolved.sort((a, b) => b.balance - a.balance);
      setWallets(resolved);
      if (resolved.length > 0) {
        const nextSelected =
          selectedWalletKey && resolved.some((w) => w.walletKey === selectedWalletKey)
            ? selectedWalletKey
            : resolved[0].walletKey;
        setValue("selectedWalletKey", nextSelected);
      }
      setLoadingWallets(false);
    });

    return () => unsubscribe();
  }, [visible, user, normalizedGoalCurrency, reset, selectedWalletKey, setValue]);

  const submitContribution = async (data: ContributionFormValues) => {
    const amountNum = parseFloat(data.amount);

    if (wallets.length === 0) {
      showError(
        t("goals.noWalletsAvailableTitle"),
        interpolate(t("goals.noWalletsAvailableDescription"), { currency: currencyLabel }),
      );
      return;
    }

    if (!data.amount || Number.isNaN(amountNum)) {
      showError(t("goals.invalidInputTitle"), t("goals.invalidContributionAmount"));
      return;
    }
    if (amountNum <= 0) {
      showError(t("goals.invalidInputTitle"), t("goals.amountMustBeGreaterThanZero"));
      return;
    }
    if (!data.selectedWalletKey) {
      showError(t("goals.noWalletSelectedTitle"), t("goals.selectWalletToContribute"));
      return;
    }

    const sourceWallet = wallets.find((w) => w.walletKey === data.selectedWalletKey);
    if (!sourceWallet) return;

    if (amountNum > sourceWallet.balance) {
      showError(
        t("goals.insufficientBalanceTitle"),
        interpolate(t("goals.insufficientBalanceDescription"), {
          wallet: sourceWallet.name,
          balance: sourceWallet.balance.toFixed(2),
          currency: currencyLabel,
        }),
      );
      return;
    }

    if (targetAmount !== undefined) {
      const remaining = targetAmount - currentAmount;
      if (amountNum > remaining) {
        showError(
          t("goals.exceedsGoalTitle"),
          interpolate(t("goals.exceedsGoalDescription"), {
            remaining: remaining.toFixed(2),
            currency: currencyLabel,
          }),
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const newBalance = sourceWallet.balance - amountNum;
      await update(ref(db, `wallets/${data.selectedWalletKey}`), {
        [`${sourceWallet.currencyContainer}/${sourceWallet.currencyKey}`]: newBalance,
      });

      hapticSuccess();
      onSubmit(amountNum, data.reason.trim() || undefined);
      onClose();
    } catch (error) {
      showError(t("error"), String(error));
    } finally {
      setSubmitting(false);
    }
  };

  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#F9FAFB";
  const inputBorder = isDark ? "rgba(255,255,255,0.15)" : "#E5E7EB";
  const inputColor = isDark ? "#FFFFFF" : "#111827";
  const placeholderColor = isDark ? "rgba(255,255,255,0.3)" : "#9CA3AF";
  const iconColor = isDark ? "#FFFFFF" : "#6B7280";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB";
  const cardBorder = isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB";

  const remaining = targetAmount !== undefined ? targetAmount - currentAmount : null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.overlay}>
            <View style={styles.backdrop} />
            <View style={styles.modalWrapper}>
              <ThemedView
                style={[
                  styles.modal,
                  { backgroundColor: isDark ? "#1F1B2E" : "#FFFFFF" },
                ]}
              >
              <View style={styles.header}>
                <ThemedText style={styles.title}>{t("goals.addContribution")}</ThemedText>
                <Pressable
                  onPress={() => {
                    hapticTap();
                    onClose();
                  }}
                  style={styles.closeBtn}
                >
                  <MaterialIcons name="close" size={20} color={iconColor} />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <ScrollView
                  style={styles.scroll}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  nestedScrollEnabled
                  bounces={false}
                  overScrollMode="never"
                  scrollEventThrottle={16}
                  contentContainerStyle={styles.scrollContent}
                >
                  {remaining !== null && (
                    <View style={styles.hintRow}>
                      <MaterialIcons name="info-outline" size={14} color="#8B5CF6" />
                      <ThemedText style={styles.hintText}>
                        {remaining.toFixed(2)} {currencyLabel} {t("goals.remainingToReachGoal")}
                      </ThemedText>
                    </View>
                  )}

                  <ThemedText style={styles.label}>{t("goals.selectWallet")} *</ThemedText>

                  {loadingWallets ? (
                    <View style={[styles.stateBox, { borderColor: cardBorder }]}>
                      <ThemedText style={{ opacity: 0.5 }}>{t("goals.loadingWallets")}</ThemedText>
                    </View>
                  ) : wallets.length === 0 ? (
                    <View style={[styles.stateBox, styles.errorBox]}>
                      <MaterialIcons name="account-balance-wallet" size={24} color="#EF4444" />
                      <ThemedText style={styles.errorBoxTitle}>
                        {interpolate(t("goals.noWalletsForCurrencyTitle"), { currency: currencyLabel })}
                      </ThemedText>
                      <ThemedText style={styles.errorBoxSub}>
                        {interpolate(t("goals.noWalletsForCurrencySubtext"), { currency: currencyLabel })}
                      </ThemedText>
                    </View>
                  ) : (
                    <View style={styles.walletList}>
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
                              setValue("selectedWalletKey", wallet.walletKey);
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
                            <View style={styles.walletCardLeft}>
                              <View
                                style={[
                                  styles.walletIcon,
                                  {
                                    backgroundColor: isSelected
                                      ? "rgba(139,92,246,0.2)"
                                      : isDark
                                        ? "rgba(255,255,255,0.08)"
                                        : "#EDEDF0",
                                  },
                                ]}
                              >
                                <MaterialIcons
                                  name="account-balance-wallet"
                                  size={18}
                                  color={isSelected ? "#8B5CF6" : iconColor}
                                />
                              </View>
                              <View>
                                <ThemedText style={styles.walletName}>{wallet.name}</ThemedText>
                                <ThemedText
                                  style={[
                                    styles.walletBalance,
                                    { color: hasBalance ? "#10B981" : "#EF4444" },
                                  ]}
                                >
                                  {wallet.balance.toFixed(2)} {currencyLabel}
                                </ThemedText>
                              </View>
                            </View>
                            {isSelected ? <MaterialIcons name="check-circle" size={20} color="#8B5CF6" /> : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  <ThemedText style={styles.label}>{t("goals.contributionAmount")} *</ThemedText>
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          { backgroundColor: inputBg, borderColor: inputBorder, color: inputColor },
                        ]}
                        value={value}
                        onChangeText={onChange}
                        placeholder={`0.00 ${currencyLabel}`}
                        placeholderTextColor={placeholderColor}
                        keyboardType="numeric"
                        returnKeyType="next"
                      />
                    )}
                  />

                  <ThemedText style={styles.label}>{t("goals.contributionReason")}</ThemedText>
                  <Controller
                    control={control}
                    name="reason"
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          styles.textArea,
                          { backgroundColor: inputBg, borderColor: inputBorder, color: inputColor },
                        ]}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t("goals.contributionReason")}
                        placeholderTextColor={placeholderColor}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    )}
                  />
                </ScrollView>
              </View>

              <View style={styles.buttons}>
                <Pressable
                  onPress={() => {
                    hapticTap();
                    onClose();
                  }}
                  style={[
                    styles.cancelBtn,
                    { borderColor: isDark ? "rgba(255,255,255,0.2)" : "#E5E7EB" },
                  ]}
                >
                  <View style={styles.actionRow}>
                    <MaterialIcons
                      name="close"
                      size={16}
                      color={isDark ? "rgba(255,255,255,0.78)" : "rgba(17,24,39,0.78)"}
                    />
                    <ThemedText style={styles.cancelText}>{t("common.cancel")}</ThemedText>
                  </View>
                </Pressable>
                <View style={styles.confirmBtn}>
                  <GradientButton
                    label={t("goals.contribute")}
                    iconName="add-circle-outline"
                    onPress={handleSubmit(submitContribution)}
                    loading={submitting}
                    disabled={wallets.length === 0 || submitting}
                  />
                </View>
              </View>
            </ThemedView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <AppDialogModal
        visible={errorVisible}
        isDark={isDark}
        title={errorTitle}
        description={errorDescription}
        actionLabel={t("common.confirm")}
        icon="error-outline"
        onClose={() => setErrorVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalWrapper: { width: "100%", maxWidth: 420, zIndex: 2, elevation: 11 },
  modal: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    maxHeight: "88%",
    minHeight: 520,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  modalBody: {
    flex: 1,
    minHeight: 260,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "700" },
  closeBtn: { padding: 4 },

  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(139,92,246,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 4,
  },
  hintText: { fontSize: 13, color: "#8B5CF6", fontWeight: "500" },

  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 14, opacity: 0.7 },

  walletList: { gap: 8 },
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
  },
  walletCardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  walletName: { fontSize: 15, fontWeight: "600" },
  walletBalance: { fontSize: 13, fontWeight: "500", marginTop: 1 },

  stateBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  errorBox: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239,68,68,0.06)",
  },
  errorBoxTitle: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  errorBoxSub: { fontSize: 12, opacity: 0.6, textAlign: "center" },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  textArea: { height: 90, paddingTop: 12 },

  buttons: { flexDirection: "row", gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "600", opacity: 0.7 },
  confirmBtn: { flex: 2 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
