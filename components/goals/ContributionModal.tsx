import { AppDialogModal } from "@/components/ui/AppDialogModal";
import { ThemedText } from "@/components/themed-text";
import { GradientButton } from "@/components/ui/gradient-button";
import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { db } from "@/src/firebaseConfig";
import { hapticSelection, hapticSuccess, hapticTap } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import * as NavigationBar from "expo-navigation-bar";
import { get, onValue, ref, update } from "firebase/database";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

type UserWalletRef = {
  walletKey: string;
  name: string;
  balance: number;
  currencyKey: string;
  currencyContainer: "currancies" | "currencies";
};

function normalizeCurrencyCode(value: string | undefined | null): string {
  if (!value) return "";
  const token = value.trim().toLowerCase().split(/\s+/).pop() ?? "";
  return token.replace(/[^a-z]/g, "");
}

type ContributionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason?: string) => void | Promise<void>;
  currency: string;
  targetAmount?: number;
  currentAmount?: number;
};

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
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["88%"], []);
  const normalizedGoalCurrency = normalizeCurrencyCode(currency) || "usd";
  const currencyLabel = normalizedGoalCurrency.toUpperCase();

  const [wallets, setWallets] = useState<UserWalletRef[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  const interpolate = useCallback(
    (template: string, values: Record<string, string>) => {
      return Object.entries(values).reduce(
        (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
        template,
      );
    },
    [],
  );

  const showError = useCallback((title: string, description: string) => {
    setErrorTitle(title);
    setErrorDescription(description);
    setErrorVisible(true);
  }, []);

  const { control, watch, setValue, reset, handleSubmit } =
    useForm<ContributionFormValues>({
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
      const data = snapshot.val() as Record<
        string,
        { name?: string; walletid?: number | string; id?: number | string }
      > | null;

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
              Number.isFinite(Number(link?.walletid)) &&
              Number(link?.walletid) > 0
                ? Number(link.walletid)
                : Number.isFinite(Number(link?.id)) && Number(link?.id) > 0
                  ? Number(link.id)
                  : null;

            const walletKey = walletId ? `wallet${walletId}` : slotKey;
            const snap = await get(ref(db, `wallets/${walletKey}`));
            const walletData = snap.val();
            if (!walletData || walletData.type === "goal") return;

            const currancies: Record<string, number> =
              walletData.currancies || {};
            const currencies: Record<string, number> =
              walletData.currencies || {};

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
          selectedWalletKey &&
          resolved.some((w) => w.walletKey === selectedWalletKey)
            ? selectedWalletKey
            : resolved[0].walletKey;
        setValue("selectedWalletKey", nextSelected);
      }
      setLoadingWallets(false);
    });

    return () => unsubscribe();
  }, [
    visible,
    user,
    normalizedGoalCurrency,
    reset,
    selectedWalletKey,
    setValue,
  ]);

  const submitContribution = async (data: ContributionFormValues) => {
    const amountNum = parseFloat(data.amount);

    if (wallets.length === 0) {
      showError(
        t("goals.noWalletsAvailableTitle"),
        interpolate(t("goals.noWalletsAvailableDescription"), {
          currency: currencyLabel,
        }),
      );
      return;
    }

    if (!data.amount || Number.isNaN(amountNum)) {
      showError(
        t("goals.invalidInputTitle"),
        t("goals.invalidContributionAmount"),
      );
      return;
    }
    if (amountNum <= 0) {
      showError(
        t("goals.invalidInputTitle"),
        t("goals.amountMustBeGreaterThanZero"),
      );
      return;
    }
    if (!data.selectedWalletKey) {
      showError(
        t("goals.noWalletSelectedTitle"),
        t("goals.selectWalletToContribute"),
      );
      return;
    }

    const sourceWallet = wallets.find(
      (w) => w.walletKey === data.selectedWalletKey,
    );
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
        [`${sourceWallet.currencyContainer}/${sourceWallet.currencyKey}`]:
          newBalance,
      });

      hapticSuccess();
      await onSubmit(amountNum, data.reason.trim() || undefined);
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
  const sheetBg = isDark ? "#1F1B2E" : "#FFFFFF";
  const sheetHandle = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)";
  const cancelBorder = isDark ? "rgba(255,255,255,0.2)" : "#E5E7EB";
  const cancelTextColor = isDark
    ? "rgba(255,255,255,0.78)"
    : "rgba(17,24,39,0.78)";

  const remaining =
    targetAmount !== undefined ? targetAmount - currentAmount : null;
  const handleContributePress = useCallback(() => {
    Keyboard.dismiss();
    handleSubmit(submitContribution)();
  }, [handleSubmit, submitContribution]);

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={[styles.buttons, { backgroundColor: sheetBg }]}>
          <Pressable
            onPress={() => {
              hapticTap();
              sheetRef.current?.dismiss();
            }}
            style={[styles.cancelBtn, { borderColor: cancelBorder }]}
          >
            <View style={styles.actionRow}>
              <MaterialIcons name="close" size={16} color={cancelTextColor} />
              <ThemedText
                style={[styles.cancelText, { color: cancelTextColor }]}
              >
                {t("common.cancel")}
              </ThemedText>
            </View>
          </Pressable>
          <View style={styles.confirmBtn}>
            <GradientButton
              label={t("goals.contribute")}
              iconName="add-circle-outline"
              onPress={handleContributePress}
              loading={submitting}
              disabled={wallets.length === 0 || submitting}
            />
          </View>
        </View>
      </BottomSheetFooter>
    ),
    [
      cancelBorder,
      cancelTextColor,
      handleContributePress,
      sheetBg,
      submitting,
      t,
      wallets.length,
    ],
  );

  useEffect(() => {
    if (visible) {
      const frame = requestAnimationFrame(() => {
        sheetRef.current?.present();
        sheetRef.current?.snapToIndex(0);
      });

      return () => cancelAnimationFrame(frame);
    }

    sheetRef.current?.dismiss();
  }, [visible]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    if (!visible) {
      NavigationBar.setVisibilityAsync("visible").catch(() => {});
      return;
    }

    NavigationBar.setVisibilityAsync("hidden").catch(() => {});

    return () => {
      NavigationBar.setVisibilityAsync("visible").catch(() => {});
    };
  }, [visible]);

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        footerComponent={renderFooter}
        onDismiss={onClose}
        handleIndicatorStyle={[
          styles.sheetHandle,
          { backgroundColor: sheetHandle },
        ]}
        backgroundStyle={[styles.sheetBackground, { backgroundColor: sheetBg }]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>
              {t("goals.addContribution")}
            </ThemedText>
            <Pressable
              onPress={() => {
                hapticTap();
                sheetRef.current?.dismiss();
              }}
              style={styles.closeBtn}
            >
              <MaterialIcons name="close" size={20} color={iconColor} />
            </Pressable>
          </View>

          {remaining !== null && (
            <View style={styles.hintRow}>
              <MaterialIcons name="info-outline" size={14} color="#8B5CF6" />
              <ThemedText style={styles.hintText}>
                {remaining.toFixed(2)} {currencyLabel}{" "}
                {t("goals.remainingToReachGoal")}
              </ThemedText>
            </View>
          )}

          <ThemedText style={styles.label}>
            {t("goals.selectWallet")} *
          </ThemedText>

          {loadingWallets ? (
            <View style={[styles.stateBox, { borderColor: cardBorder }]}>
              <ThemedText style={{ opacity: 0.5 }}>
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

          <ThemedText style={styles.label}>
            {t("goals.contributionAmount")} *
          </ThemedText>
          <Controller
            control={control}
            name="amount"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: inputColor,
                  },
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

          <ThemedText style={styles.label}>
            {t("goals.contributionReason")}
          </ThemedText>
          <Controller
            control={control}
            name="reason"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: inputColor,
                  },
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
        </BottomSheetScrollView>
      </BottomSheetModal>
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
  sheetBackground: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  sheetHandle: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 112,
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

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 14,
    opacity: 0.7,
  },

  walletList: {
    paddingRight: 20,
  },
  walletListScroll: {
    height: 86,
  },
  walletCard: {
    width: 142,
    height: 82,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
    justifyContent: "space-between",
  },
  walletCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walletName: { fontSize: 13, fontWeight: "700" },
  walletBalance: { fontSize: 12, fontWeight: "600", marginTop: 1 },

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

  buttons: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(124,58,237,0.12)",
  },
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
