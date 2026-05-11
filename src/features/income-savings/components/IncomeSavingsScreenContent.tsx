// app/(tabs)/income-savings.tsx
import { ThemedView } from "@/components/themed-view";
import { AppDialogModal } from "@/components/ui/AppDialogModal";
import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import {
  type IncomeSource,
  type SourceType,
} from "../services/incomeSavings.service";
import { hapticError, hapticSuccess, hapticTap, hapticWarning } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Animated,
  BackHandler,
  Easing,
  Platform,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  normalizeCurrencyCode,
  getIncomeFloatingButtonBottom,
  getIncomeSourceTypeLabel,
  getIncomeSavingsTheme,
  interpolateTemplate,
  INCOME_DELETE_SHEET_SNAP_POINTS,
  INCOME_WHITE_ICON,
  type IncomeSourceFormValues,
  type SourceTypeFilter,
} from "../constants";
import { IncomeSavingsHeader } from "./IncomeSavingsHeader";
import { IncomeSourcesList } from "./IncomeSourcesList";
import { IncomeSourceFormModal } from "./IncomeSourceFormModal";
import { IncomeSavingsFeedbackSheets } from "./IncomeSavingsFeedbackSheets";
import {
  useIncomeSavingsData,
} from "../hooks/useIncomeSavingsData";
import { styles } from "../stylesheet";
export function IncomeSavingsScreenContent() {
  const { t } = useI18n();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const [pendingDeleteSource, setPendingDeleteSource] = useState<IncomeSource | null>(null);
  const [successTitle, setSuccessTitle] = useState("");
  const [successDescription, setSuccessDescription] = useState("");
  const [successIcon, setSuccessIcon] = useState<keyof typeof MaterialIcons.glyphMap>("check-circle");
  const [pendingSuccessSheet, setPendingSuccessSheet] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const [selectedSourceTypeFilter, setSelectedSourceTypeFilter] =
    useState<SourceTypeFilter>("all");
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const successSheetRef = useRef<BottomSheetModal>(null);
  const deleteSheetSnapPoints = useMemo(() => INCOME_DELETE_SHEET_SNAP_POINTS, []);
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
  const {
    sources,
    visibleSources,
    walletOptions,
    walletCurrenciesBySlot,
    selectedWalletCurrencies,
    estimatedMonthlyTotal,
    createMutation,
    deleteMutation,
  } = useIncomeSavingsData({
    userUid: user?.uid,
    selectedWalletSlot,
    currency,
    selectedSourceTypeFilter,
    walletLabel: t("incomeSavings.walletLabel"),
    setValue,
  });
  const getSourceTypeLabel = useCallback((sourceType: SourceType) => {
    return getIncomeSourceTypeLabel(sourceType, {
      salary: t("incomeSavings.categories.salary"),
      loan: t("incomeSavings.categories.loan"),
      freelance: t("incomeSavings.categories.freelance"),
      investment: t("incomeSavings.categories.investment"),
      other: t("incomeSavings.categories.other"),
    });
  }, [t]);
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
    try {
      await createMutation.mutateAsync({
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
      setPendingSuccessSheet(true);
    } catch (error) {
      hapticError();
      setErrorTitle(t("error"));
      setErrorDescription(String(error));
      setErrorVisible(true);
    }
  });
  useEffect(() => {
    if (sourceModalVisible || pendingDeleteSource || !pendingSuccessSheet) return;
    const timer = setTimeout(() => {
      successSheetRef.current?.present();
      setPendingSuccessSheet(false);
    }, 120);
    return () => clearTimeout(timer);
  }, [pendingDeleteSource, pendingSuccessSheet, sourceModalVisible]);
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
      await deleteMutation.mutateAsync(pendingDeleteSource.id);
      deleteSheetRef.current?.dismiss();
      hapticSuccess();
      setSuccessTitle(t("incomeSavings.deleteSuccess"));
      setSuccessDescription(t("incomeSavings.deletedDescription"));
      setSuccessIcon("delete-forever");
      setPendingSuccessSheet(true);
    } catch (error) {
      hapticError();
      setErrorTitle(t("error"));
      setErrorDescription(String(error));
      setErrorVisible(true);
    }
  };
  const handleBack = useCallback(() => {
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
  const theme = getIncomeSavingsTheme(isDark);
  const floatingButtonBottom = getIncomeFloatingButtonBottom(
    Platform.OS,
    insets.bottom,
  );
  const scrollBottomSpacing = floatingButtonBottom + 86;
  return (
    <BottomSheetModalProvider>
      <View
        style={[
          styles.safeArea,
          { paddingTop: insets.top, backgroundColor: theme.headerSurface },
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
        <IncomeSavingsHeader
          title={t("incomeSavings.title")}
          isDark={isDark}
          backgroundColor={theme.headerSurface}
          borderColor={theme.headerBorder}
          onBack={handleBack}
        />
        <IncomeSourcesList
          data={visibleSources}
          sourceCount={sources.length}
          estimatedMonthlyTotal={estimatedMonthlyTotal}
          selectedFilter={selectedSourceTypeFilter}
          isDark={isDark}
          scrollBottomSpacing={scrollBottomSpacing}
          theme={theme}
          labels={{
            source: t("incomeSavings.source"),
            all: t("common.all"),
            emptyTitle: t("incomeSavings.emptyTitle"),
            emptySubtext: t("incomeSavings.emptySubtext"),
            emptySearchTitle: t("incomeSavings.emptySearchTitle"),
            emptySearchSubtext: t("incomeSavings.emptySearchSubtext"),
          }}
          getSourceTypeLabel={getSourceTypeLabel}
          onFilterChange={setSelectedSourceTypeFilter}
          onDelete={handleDeleteSource}
        />
        <Pressable
          style={[styles.fabAddButton, { bottom: floatingButtonBottom }]}
          onPress={handleOpenCreate}
          accessibilityRole="button"
          accessibilityLabel={t("common.add")}
        >
          <MaterialIcons name="add" size={28} color={INCOME_WHITE_ICON} />
        </Pressable>
          <IncomeSourceFormModal
            visible={sourceModalVisible}
            isDark={isDark}
            saving={createMutation.isPending}
            type={type}
            regularity={regularity}
            selectedWalletSlot={selectedWalletSlot}
            amount={amount}
            currency={currency}
            notes={notes}
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
      <IncomeSavingsFeedbackSheets
        deleteSheetRef={deleteSheetRef}
        deleteSheetSnapPoints={deleteSheetSnapPoints}
        isDark={isDark}
        theme={theme}
        pendingDeleteSource={pendingDeleteSource}
        interpolate={interpolateTemplate}
        getSourceTypeLabel={getSourceTypeLabel}
        deleteTitle={t("incomeSavings.deleteTitle")}
        deletePrompt={t("incomeSavings.deletePrompt")}
        deletePromptGeneric={t("incomeSavings.deletePromptGeneric")}
        cancelLabel={t("common.cancel")}
        deleteLabel={t("common.delete")}
        confirmLabel={t("common.confirm")}
        onCancelDelete={handleCancelDelete}
        onConfirmDelete={handleConfirmDelete}
        onDismissDelete={() => setPendingDeleteSource(null)}
        successSheetRef={successSheetRef}
        successTitle={successTitle}
        successDescription={successDescription}
        successIcon={successIcon}
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
