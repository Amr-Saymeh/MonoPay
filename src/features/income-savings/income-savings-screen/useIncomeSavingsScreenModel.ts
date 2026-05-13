import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getIncomeFloatingButtonBottom,
  getIncomeSourceTypeLabel,
  getIncomeSavingsTheme,
  interpolateTemplate,
  type SourceTypeFilter,
} from "../constants";
import {
  useIncomeSavingsFeedback,
  useIncomeSavingsSuccessPresentation,
} from "../hooks/useIncomeSavingsFeedback";
import { useIncomeSavingsNavigation } from "../hooks/useIncomeSavingsNavigation";
import { useIncomeSourceDelete } from "../hooks/useIncomeSourceDelete";
import { useIncomeSourceForm } from "../hooks/useIncomeSourceForm";
import type { SourceType } from "../services/incomeSavings.service";
import { buildIncomeSavingsLabels } from "./incomeSavingsScreenLabels";

export type IncomeSavingsScreenModel = ReturnType<
  typeof useIncomeSavingsScreenModel
>;

export function useIncomeSavingsScreenModel() {
  const { t } = useI18n();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const [selectedSourceTypeFilter, setSelectedSourceTypeFilter] =
    useState<SourceTypeFilter>("all");

  const feedbackState = useIncomeSavingsFeedback();
  const incomeForm = useIncomeSourceForm({
    userUid: user?.uid,
    selectedSourceTypeFilter,
    t,
    showSuccess: feedbackState.showSuccess,
    showError: feedbackState.showError,
  });
  const deleteSource = useIncomeSourceDelete({
    user,
    deleteMutation: incomeForm.deleteMutation,
    t,
    showSuccess: feedbackState.showSuccess,
    showError: feedbackState.showError,
  });
  const navigation = useIncomeSavingsNavigation();

  useIncomeSavingsSuccessPresentation({
    successSheetRef: feedbackState.successSheetRef,
    sourceModalVisible: incomeForm.sourceModalVisible,
    pendingDeleteSource: deleteSource.pendingDeleteSource,
    pendingSuccessSheet: feedbackState.pendingSuccessSheet,
    setPendingSuccessSheet: feedbackState.setPendingSuccessSheet,
  });

  const getSourceTypeLabel = useCallback(
    (sourceType: SourceType) => {
      return getIncomeSourceTypeLabel(sourceType, {
        salary: t("incomeSavings.categories.salary"),
        loan: t("incomeSavings.categories.loan"),
        freelance: t("incomeSavings.categories.freelance"),
        investment: t("incomeSavings.categories.investment"),
        other: t("incomeSavings.categories.other"),
      });
    },
    [t],
  );

  const theme = getIncomeSavingsTheme(isDark);
  const floatingButtonBottom = getIncomeFloatingButtonBottom(
    Platform.OS,
    insets.bottom,
  );
  const scrollBottomSpacing = floatingButtonBottom + 86;

  return {
    labels: buildIncomeSavingsLabels(t),
    view: {
      insets,
      theme,
      isDark,
      pageTransition: navigation.pageTransition,
      floatingButtonBottom,
      scrollBottomSpacing,
    },
    sources: {
      data: incomeForm.visibleSources,
      sourceCount: incomeForm.sources.length,
      estimatedMonthlyTotal: incomeForm.estimatedMonthlyTotal,
      selectedFilter: selectedSourceTypeFilter,
      onFilterChange: setSelectedSourceTypeFilter,
      onDelete: deleteSource.handleDeleteSource,
      getSourceTypeLabel,
    },
    form: {
      state: {
        visible: incomeForm.sourceModalVisible,
        isDark,
        saving: incomeForm.createMutation.isPending,
      },
      values: {
        type: incomeForm.type,
        regularity: incomeForm.regularity,
        selectedWalletSlot: incomeForm.selectedWalletSlot,
        amount: incomeForm.amount,
        currency: incomeForm.currency,
        notes: incomeForm.notes,
      },
      wallets: {
        options: incomeForm.walletOptions,
        selectedCurrencies: incomeForm.selectedWalletCurrencies,
      },
      actions: {
        onClose: () => incomeForm.setSourceModalVisible(false),
        onSave: incomeForm.handleSaveSource,
        onTypeChange: (value: any) => incomeForm.setValue("type", value),
        onRegularityChange: (value: any) =>
          incomeForm.setValue("regularity", value),
        onWalletSelect: (value: string | null) =>
          incomeForm.setValue("selectedWalletSlot", value),
        onAmountChange: (value: string) => incomeForm.setValue("amount", value),
        onCurrencyChange: (value: string) =>
          incomeForm.setValue("currency", value),
        onNotesChange: (value: string) => incomeForm.setValue("notes", value),
      },
    },
    deletion: {
      sheetRef: deleteSource.deleteSheetRef,
      snapPoints: deleteSource.deleteSheetSnapPoints,
      pendingSource: deleteSource.pendingDeleteSource,
      onCancel: deleteSource.handleCancelDelete,
      onConfirm: deleteSource.handleConfirmDelete,
      onDismiss: deleteSource.clearPendingDeleteSource,
    },
    feedback: {
      success: {
        sheetRef: feedbackState.successSheetRef,
        title: feedbackState.successTitle,
        description: feedbackState.successDescription,
        icon: feedbackState.successIcon,
      },
      error: {
        visible: feedbackState.errorVisible,
        title: feedbackState.errorTitle,
        description: feedbackState.errorDescription,
        onClose: () => feedbackState.setErrorVisible(false),
      },
    },
    helpers: {
      interpolate: interpolateTemplate,
      getSourceTypeLabel,
    },
    actions: {
      onBack: navigation.handleBack,
      onCreateSource: incomeForm.handleOpenCreate,
    },
  };
}
