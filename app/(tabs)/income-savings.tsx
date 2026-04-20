// app/(tabs)/income-savings.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AddEntryModal } from "@/components/income-savings/AddEntryModal";
import { EntryCard } from "@/components/income-savings/EntryCard";
import { SummaryCard } from "@/components/income-savings/SummaryCard";
import { AppDialogModal } from "@/components/ui/AppDialogModal";
import { FeedbackBottomSheet } from "@/components/ui/FeedbackBottomSheet";
import { Fonts } from "@/constants/theme";
import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import {
  createIncomeSourceAndFundWallet,
  deleteIncomeSource,
  type IncomeSource,
  type Regularity,
  type SourceType,
  subscribeIncomeSources,
} from "@/src/services/incomeSources.service";
import {
  subscribeUserWalletLinks,
  subscribeWalletsByIds,
  type UserWalletLink,
  type WalletRecord,
} from "@/src/services/wallets.service";
import { hapticError, hapticSelection, hapticSuccess, hapticTap, hapticWarning } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Animated,
  BackHandler,
  Easing,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function normalizeCurrencyCode(value: string | undefined | null): string {
  if (!value) return "";
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

function monthlyEquivalent(amount: number, regularity: Regularity): number {
  if (regularity === "daily") return amount * 30;
  if (regularity === "weekly") return amount * 4;
  if (regularity === "yearly") return amount / 12;
  return amount;
}

type IncomeSourceFormValues = {
  type: SourceType;
  regularity: Regularity;
  selectedWalletSlot: string | null;
  amount: string;
  currency: string;
  notes: string;
};

export default function IncomeSavingsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const [links, setLinks] = useState<Record<string, UserWalletLink>>({});
  const [wallets, setWallets] = useState<Record<string, WalletRecord>>({});
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [saving, setSaving] = useState(false);
  const [pendingDeleteSource, setPendingDeleteSource] = useState<IncomeSource | null>(null);
  const [successTitle, setSuccessTitle] = useState("");
  const [successDescription, setSuccessDescription] = useState("");
  const [successIcon, setSuccessIcon] = useState<keyof typeof MaterialIcons.glyphMap>("check-circle");
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const successSheetRef = useRef<BottomSheetModal>(null);
  const deleteSheetSnapPoints = useMemo(() => ["34%"], []);
  const pageTransition = useRef(new Animated.Value(0)).current;
  const isLeavingRef = useRef(false);
  const { watch, setValue, reset, handleSubmit } = useForm<IncomeSourceFormValues>({
    defaultValues: {
      type: "salary",
      regularity: "monthly",
      selectedWalletSlot: null,
      amount: "",
      currency: "usd",
      notes: "",
    },
  });

  const type = watch("type");
  const regularity = watch("regularity");
  const selectedWalletSlot = watch("selectedWalletSlot");
  const amount = watch("amount");
  const currency = watch("currency");
  const notes = watch("notes");

  useEffect(() => {
    if (!user) return;

    const unsub = subscribeUserWalletLinks(user.uid, (userWalletLinks) => {
      setLinks(userWalletLinks);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    const walletIds = Array.from(
      new Set(
        Object.values(links)
          .map((w) => Number(w?.walletid))
          .filter((id) => Number.isFinite(id) && id > 0) as number[],
      ),
    );

    const unsub = subscribeWalletsByIds(walletIds, (walletRecords) => {
      setWallets(walletRecords);
    });

    return () => unsub();
  }, [links]);

  useEffect(() => {
    if (!user) return;

    const unsub = subscribeIncomeSources(user.uid, (incomeSources) => {
      setSources(incomeSources);
    });

    return () => unsub();
  }, [user]);

  const walletOptions = useMemo(() => {
    return Object.entries(links)
      .map(([slotKey, link]) => {
        const walletid = Number(link?.walletid);
        if (!Number.isFinite(walletid) || walletid <= 0) return null;
        return {
          slotKey,
          walletid,
          walletKey: `wallet${walletid}`,
          name: link?.name?.trim() || `${t("incomeSavings.walletLabel")} ${walletid}`,
        };
      })
      .filter(Boolean) as {
      slotKey: string;
      walletid: number;
      walletKey: string;
      name: string;
    }[];
  }, [links, t]);

  const walletCurrenciesBySlot = useMemo(() => {
    const bySlot: Record<string, string[]> = {};
    for (const wallet of walletOptions) {
      const walletRecord = wallets[wallet.walletKey];
      const currencies = Array.from(
        new Set([
          ...Object.keys(walletRecord?.currancies ?? {}),
          ...Object.keys(walletRecord?.currencies ?? {}),
        ]),
      )
        .map((k) => normalizeCurrencyCode(k))
        .filter(Boolean);
      bySlot[wallet.slotKey] = currencies;
    }
    return bySlot;
  }, [walletOptions, wallets]);

  const selectedWalletCurrencies = useMemo(() => {
    if (!selectedWalletSlot) return [];
    return walletCurrenciesBySlot[selectedWalletSlot] ?? [];
  }, [selectedWalletSlot, walletCurrenciesBySlot]);

  const interpolate = React.useCallback((template: string, values: Record<string, string>) => {
    return Object.entries(values).reduce(
      (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
      template,
    );
  }, []);

  const getSourceTypeLabel = React.useCallback((sourceType: SourceType) => {
    switch (sourceType) {
      case "salary":
        return t("incomeSavings.categories.salary");
      case "loan":
        return t("incomeSavings.categories.loan");
      case "freelance":
        return t("incomeSavings.categories.freelance");
      case "investment":
        return t("incomeSavings.categories.investment");
      default:
        return t("incomeSavings.categories.other");
    }
  }, [t]);

  React.useEffect(() => {
    if (selectedWalletCurrencies.length === 0) return;
    if (!selectedWalletCurrencies.includes(normalizeCurrencyCode(currency))) {
      setValue("currency", selectedWalletCurrencies[0]);
    }
  }, [selectedWalletCurrencies, currency, setValue]);

  const estimatedMonthlyTotal = useMemo(() => {
    return sources.reduce(
      (sum, s) => sum + monthlyEquivalent(Number(s.amount || 0), s.regularity),
      0,
    );
  }, [sources]);

  const searchEnabled = sources.length > 3;
  const normalizedSearch = searchEnabled ? searchQuery.trim().toLowerCase() : "";
  const visibleSources = useMemo(() => {
    if (!normalizedSearch) return sources;
    return sources.filter((source) =>
      `${source.type} ${source.walletName} ${source.notes || ""}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [sources, normalizedSearch]);

  const resetForm = (walletSlot: string | null) => {
    const firstCurrency = walletSlot ? walletCurrenciesBySlot[walletSlot]?.[0] : undefined;
    reset({
      type: "salary",
      regularity: "monthly",
      selectedWalletSlot: walletSlot,
      amount: "",
      currency: firstCurrency || "usd",
      notes: "",
    });
  };

  const handleOpenCreate = () => {
    hapticTap();
    if (walletOptions.length === 0) {
      setErrorTitle(t("incomeSavings.noWalletsTitle"));
      setErrorDescription(t("incomeSavings.noWalletsDescription"));
      setErrorVisible(true);
      return;
    }

    resetForm(walletOptions[0].slotKey);
    setSourceModalVisible(true);
  };

  const handleSaveSource = handleSubmit(async (formValues) => {
    if (!user) return;
    const selectedWalletValue =
      walletOptions.find((w) => w.slotKey === formValues.selectedWalletSlot) ?? null;

    if (!selectedWalletValue) {
      hapticError();
      setErrorTitle(t("incomeSavings.selectWalletTitle"));
      setErrorDescription(t("incomeSavings.selectWalletDescription"));
      setErrorVisible(true);
      return;
    }

    const amountNum = Number(formValues.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      hapticError();
      setErrorTitle(t("incomeSavings.invalidAmountTitle"));
      setErrorDescription(t("incomeSavings.invalidAmountDescription"));
      setErrorVisible(true);
      return;
    }

    const currencyCode = normalizeCurrencyCode(formValues.currency) || "usd";
    setSaving(true);
    try {
      await createIncomeSourceAndFundWallet({
        userUid: user.uid,
        type: formValues.type,
        amount: amountNum,
        currency: currencyCode,
        walletid: selectedWalletValue.walletid,
        walletKey: selectedWalletValue.walletKey,
        walletName: selectedWalletValue.name,
        regularity: formValues.regularity,
        notes: formValues.notes,
      });

      setSourceModalVisible(false);
      resetForm(walletOptions[0]?.slotKey ?? null);
      hapticSuccess();
      setSuccessTitle(t("incomeSavings.addedTitle"));
      setSuccessDescription(t("incomeSavings.addedDescription"));
      setSuccessIcon("add-circle");
      requestAnimationFrame(() => successSheetRef.current?.present());
    } catch (error) {
      hapticError();
      setErrorTitle(t("error"));
      setErrorDescription(String(error));
      setErrorVisible(true);
    } finally {
      setSaving(false);
    }
  });

  const handleDeleteSource = (item: IncomeSource) => {
    hapticWarning();
    setPendingDeleteSource(item);
    deleteSheetRef.current?.present();
  };

  const handleCancelDelete = () => {
    hapticTap();
    deleteSheetRef.current?.dismiss();
  };

  const handleConfirmDelete = async () => {
    if (!user || !pendingDeleteSource) return;
    try {
      hapticWarning();
      await deleteIncomeSource(user.uid, pendingDeleteSource.id);
      deleteSheetRef.current?.dismiss();
      hapticSuccess();
    } catch (error) {
      hapticError();
      setErrorTitle(t("error"));
      setErrorDescription(String(error));
      setErrorVisible(true);
    }
  };

  const handleBack = React.useCallback(() => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    hapticTap();
    Animated.timing(pageTransition, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      router.replace("/(tabs)/" as any);
    });
  }, [pageTransition, router]);

  useFocusEffect(
    useCallback(() => {
      isLeavingRef.current = false;
      pageTransition.setValue(0);
      Animated.timing(pageTransition, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [pageTransition]),
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const hardwareSub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      const removeNavListener = navigation.addListener("beforeRemove", (event: any) => {
        const actionType = event?.data?.action?.type;
        if (actionType === "GO_BACK" || actionType === "POP" || actionType === "POP_TO_TOP") {
          event.preventDefault();
          onBackPress();
        }
      });

      return () => {
        hardwareSub.remove();
        removeNavListener();
      };
    }, [handleBack, navigation]),
  );

  const cardBg = isDark ? "rgba(124,58,237,0.16)" : "rgba(124,58,237,0.08)";
  const cardBorder = isDark ? "rgba(196,181,253,0.35)" : "rgba(124,58,237,0.25)";
  const regularityTextColor = isDark ? "#D1FAE5" : "#065F46";
  const headerSurface = isDark ? "rgba(124,58,237,0.10)" : "#EDE9FE";
  const headerBorder = isDark ? "rgba(196,181,253,0.22)" : "#C4B5FD";
  const sheetBg = isDark ? "#181124" : "#FFFFFF";
  const sheetHandle = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)";
  const sheetTitle = isDark ? "#F5F3FF" : "#1F2937";
  const sheetText = isDark ? "rgba(255,255,255,0.75)" : "#4B5563";
  const sheetBorder = isDark ? "rgba(196,181,253,0.3)" : "rgba(124,58,237,0.2)";
  const searchBg = isDark ? "rgba(124,58,237,0.10)" : "#FFFFFF";
  const searchBorder = isDark ? "rgba(196,181,253,0.25)" : "rgba(124,58,237,0.18)";
  const searchText = isDark ? "#F5F3FF" : "#1F2937";
  const searchPlaceholder = isDark ? "rgba(255,255,255,0.45)" : "#6B7280";
  const floatingButtonBottom =
    Platform.OS === "ios"
      ? Math.max(insets.bottom + 100, 86)
      : Math.max(insets.bottom + 88, 76);
  const scrollBottomSpacing = floatingButtonBottom + 86;
  const bottomSheetInset =
    Platform.OS === "ios"
      ? Math.max(insets.bottom + 74, 88)
      : Math.max(insets.bottom + 64, 76);

  const sourceTypes: SourceType[] = ["salary", "loan", "freelance", "investment", "other"];
  const regularityTypes: Regularity[] = ["daily", "weekly", "monthly", "yearly"];

  return (
    <BottomSheetModalProvider>
      <View
        style={[
          styles.safeArea,
          { paddingTop: insets.top, backgroundColor: headerSurface },
        ]}
      >
        <Animated.View
          style={[
            styles.animatedPage,
            {
              opacity: pageTransition,
              transform: [
                {
                  translateY: pageTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
                {
                  scale: pageTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.985, 1],
                  }),
                },
              ],
            },
          ]}
        >
        <ThemedView style={styles.container}>
        <View
          style={[
            styles.headerSection,
            { backgroundColor: headerSurface, borderBottomColor: headerBorder },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Pressable
                style={[
                  styles.backButton,
                  isDark ? styles.backButtonDark : styles.backButtonLight,
                ]}
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Back to home"
              >
                <MaterialIcons
                  name="arrow-back"
                  size={18}
                  color={isDark ? "#C4B5FD" : "#7C3AED"}
                />
              </Pressable>
              <ThemedText style={styles.pageTitle}>{t("incomeSavings.title")}</ThemedText>
            </View>
          </View>
        </View>

        <FlatList
          data={visibleSources}
          keyExtractor={(item) => item.id}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomSpacing }]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={8}
          windowSize={7}
          ListHeaderComponent={
            <View style={styles.listHeaderWrap}>
              <SummaryCard
                sourceCount={sources.length}
                estimatedMonthlyTotal={estimatedMonthlyTotal}
              />
              {searchEnabled ? (
                <View style={[styles.searchWrap, { backgroundColor: searchBg, borderColor: searchBorder }]}>
                  <MaterialIcons name="search" size={18} color={isDark ? "#C4B5FD" : "#7C3AED"} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={[styles.searchInput, { color: searchText }]}
                    placeholder={t("incomeSavings.searchPlaceholder")}
                    placeholderTextColor={searchPlaceholder}
                    onFocus={hapticSelection}
                  />
                  {searchQuery.length > 0 ? (
                    <Pressable
                      onPress={() => {
                        hapticTap();
                        setSearchQuery("");
                      }}
                      style={styles.searchClearBtn}
                    >
                      <MaterialIcons name="close" size={16} color={isDark ? "#E5E7EB" : "#6B7280"} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            sources.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="account-balance-wallet" size={52} color="rgba(124,58,237,0.25)" />
                <ThemedText style={styles.emptyTitle}>{t("incomeSavings.emptyTitle")}</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  {t("incomeSavings.emptySubtext")}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={46} color="rgba(124,58,237,0.28)" />
                <ThemedText style={styles.emptyTitle}>{t("incomeSavings.emptySearchTitle")}</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  {t("incomeSavings.emptySearchSubtext")}
                </ThemedText>
              </View>
            )
          }
          renderItem={({ item }) => (
            <EntryCard
              item={item}
              cardBg={cardBg}
              cardBorder={cardBorder}
              regularityTextColor={regularityTextColor}
              onDelete={handleDeleteSource}
            />
          )}
        />

        <Pressable
          style={[styles.fabAddButton, { bottom: floatingButtonBottom }]}
          onPress={handleOpenCreate}
          accessibilityRole="button"
          accessibilityLabel={t("common.add")}
        >
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </Pressable>

          <AddEntryModal
            visible={sourceModalVisible}
            isDark={isDark}
            saving={saving}
            type={type}
            regularity={regularity}
            selectedWalletSlot={selectedWalletSlot}
            amount={amount}
            currency={currency}
            notes={notes}
            sourceTypes={sourceTypes}
            regularityTypes={regularityTypes}
            walletOptions={walletOptions}
            selectedWalletCurrencies={selectedWalletCurrencies}
            onClose={() => setSourceModalVisible(false)}
            onSave={handleSaveSource}
            onTypeChange={(value) => setValue("type", value)}
            onRegularityChange={(value) => setValue("regularity", value)}
            onWalletSelect={(value) => setValue("selectedWalletSlot", value)}
            onAmountChange={(value) => setValue("amount", value)}
            onCurrencyChange={(value) => setValue("currency", value)}
            onNotesChange={(value) => setValue("notes", value)}
          />
        </ThemedView>
        </Animated.View>
      </View>

      <BottomSheetModal
        ref={deleteSheetRef}
        snapPoints={deleteSheetSnapPoints}
        index={0}
        bottomInset={bottomSheetInset}
        onDismiss={() => setPendingDeleteSource(null)}
        handleIndicatorStyle={[styles.sheetHandle, { backgroundColor: sheetHandle }]}
        backgroundStyle={[styles.sheetBackground, { backgroundColor: sheetBg }]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
      >
        <BottomSheetView style={styles.sheetContent}>
          <ThemedText style={[styles.sheetTitle, { color: sheetTitle }]}>
            {t("incomeSavings.deleteTitle")}
          </ThemedText>
          <ThemedText style={[styles.sheetDescription, { color: sheetText }]}>
            {pendingDeleteSource
              ? interpolate(t("incomeSavings.deletePrompt"), {
                type: getSourceTypeLabel(pendingDeleteSource.type),
                wallet: pendingDeleteSource.walletName,
              })
              : t("incomeSavings.deletePromptGeneric")}
          </ThemedText>
          <View style={styles.sheetActions}>
            <Pressable
              style={[styles.sheetButton, styles.sheetButtonSecondary, { borderColor: sheetBorder }]}
              onPress={handleCancelDelete}
            >
              <View style={styles.sheetBtnRow}>
                <MaterialIcons name="close" size={16} color={isDark ? "#E5E7EB" : "#374151"} />
                <ThemedText style={styles.sheetButtonSecondaryText}>{t("common.cancel")}</ThemedText>
              </View>
            </Pressable>
            <Pressable
              style={[styles.sheetButton, styles.sheetButtonDanger]}
              onPress={handleConfirmDelete}
            >
              <View style={styles.sheetBtnRow}>
                <MaterialIcons name="delete-forever" size={16} color="#FFFFFF" />
                <ThemedText style={styles.sheetButtonDangerText}>{t("common.delete")}</ThemedText>
              </View>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      <FeedbackBottomSheet
        modalRef={successSheetRef}
        isDark={isDark}
        title={successTitle}
        description={successDescription}
        actionLabel={t("common.confirm")}
        titleIcon={successIcon}
        actionIcon="check-circle"
        bottomInset={bottomSheetInset}
        onAction={() => successSheetRef.current?.dismiss()}
      />

      <AppDialogModal
        visible={errorVisible}
        isDark={isDark}
        title={errorTitle}
        description={errorDescription}
        actionLabel={t("common.confirm")}
        icon="error-outline"
        onClose={() => setErrorVisible(false)}
      />
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  animatedPage: { flex: 1 },
  container: { flex: 1 },
  headerSection: {
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageTitle: { fontSize: 26, fontWeight: "700", fontFamily: Fonts.sansBlack },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  backButtonLight: {
    backgroundColor: "rgba(124,58,237,0.07)",
    borderColor: "rgba(124,58,237,0.25)",
  },
  backButtonDark: {
    backgroundColor: "rgba(124,58,237,0.15)",
    borderColor: "rgba(196,181,253,0.3)",
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 120 },
  listHeaderWrap: {
    gap: 12,
  },
  searchWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 0,
  },
  searchClearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124,58,237,0.12)",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", opacity: 0.45 },
  emptySubtext: { fontSize: 14, opacity: 0.35, textAlign: "center" },

  fabAddButton: {
    position: "absolute",
    right: 20,
    zIndex: 1200,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    width: 44,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sheetDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  sheetButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  sheetButtonSecondary: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  sheetButtonSecondaryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sheetButtonDanger: {
    backgroundColor: "#EF4444",
  },
  sheetButtonDangerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sheetBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
