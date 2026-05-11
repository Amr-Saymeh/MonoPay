// app/(tabs)/income-savings.tsx
import { ThemedView } from "@/components/themed-view";
import { AppDialogModal } from "@/components/ui/AppDialogModal";
import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React, { useCallback, useState } from "react";
import { Animated, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getIncomeFloatingButtonBottom,
  getIncomeSourceTypeLabel,
  getIncomeSavingsTheme,
  interpolateTemplate,
  INCOME_WHITE_ICON,
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
import { styles } from "../stylesheet";
import { IncomeSavingsFeedbackSheets } from "./IncomeSavingsFeedbackSheets";
import { IncomeSavingsHeader } from "./IncomeSavingsHeader";
import { IncomeSourceFormModal } from "./IncomeSourceFormModal";
import { IncomeSourcesList } from "./IncomeSourcesList";

export function IncomeSavingsScreenContent() {
  const { t } = useI18n();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const [selectedSourceTypeFilter, setSelectedSourceTypeFilter] =
    useState<SourceTypeFilter>("all");

  const feedback = useIncomeSavingsFeedback();
  const incomeForm = useIncomeSourceForm({
    userUid: user?.uid,
    selectedSourceTypeFilter,
    t,
    showSuccess: feedback.showSuccess,
    showError: feedback.showError,
  });
  const deleteSource = useIncomeSourceDelete({
    user,
    deleteMutation: incomeForm.deleteMutation,
    t,
    showSuccess: feedback.showSuccess,
    showError: feedback.showError,
  });
  const { handleBack, pageTransition } = useIncomeSavingsNavigation();

  useIncomeSavingsSuccessPresentation({
    successSheetRef: feedback.successSheetRef,
    sourceModalVisible: incomeForm.sourceModalVisible,
    pendingDeleteSource: deleteSource.pendingDeleteSource,
    pendingSuccessSheet: feedback.pendingSuccessSheet,
    setPendingSuccessSheet: feedback.setPendingSuccessSheet,
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
              data={incomeForm.visibleSources}
              sourceCount={incomeForm.sources.length}
              estimatedMonthlyTotal={incomeForm.estimatedMonthlyTotal}
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
              onDelete={deleteSource.handleDeleteSource}
            />
            <Pressable
              style={[styles.fabAddButton, { bottom: floatingButtonBottom }]}
              onPress={incomeForm.handleOpenCreate}
              accessibilityRole="button"
              accessibilityLabel={t("common.add")}
            >
              <MaterialIcons name="add" size={28} color={INCOME_WHITE_ICON} />
            </Pressable>
            <IncomeSourceFormModal
              visible={incomeForm.sourceModalVisible}
              isDark={isDark}
              saving={incomeForm.createMutation.isPending}
              type={incomeForm.type}
              regularity={incomeForm.regularity}
              selectedWalletSlot={incomeForm.selectedWalletSlot}
              amount={incomeForm.amount}
              currency={incomeForm.currency}
              notes={incomeForm.notes}
              walletOptions={incomeForm.walletOptions}
              selectedWalletCurrencies={incomeForm.selectedWalletCurrencies}
              onClose={() => incomeForm.setSourceModalVisible(false)}
              onSave={incomeForm.handleSaveSource}
              onTypeChange={(value) => incomeForm.setValue("type", value)}
              onRegularityChange={(value) =>
                incomeForm.setValue("regularity", value)
              }
              onWalletSelect={(value) =>
                incomeForm.setValue("selectedWalletSlot", value)
              }
              onAmountChange={(value) => incomeForm.setValue("amount", value)}
              onCurrencyChange={(value) =>
                incomeForm.setValue("currency", value)
              }
              onNotesChange={(value) => incomeForm.setValue("notes", value)}
            />
          </ThemedView>
        </Animated.View>
      </View>
      <IncomeSavingsFeedbackSheets
        deleteSheetRef={deleteSource.deleteSheetRef}
        deleteSheetSnapPoints={deleteSource.deleteSheetSnapPoints}
        isDark={isDark}
        theme={theme}
        pendingDeleteSource={deleteSource.pendingDeleteSource}
        interpolate={interpolateTemplate}
        getSourceTypeLabel={getSourceTypeLabel}
        deleteTitle={t("incomeSavings.deleteTitle")}
        deletePrompt={t("incomeSavings.deletePrompt")}
        deletePromptGeneric={t("incomeSavings.deletePromptGeneric")}
        cancelLabel={t("common.cancel")}
        deleteLabel={t("common.delete")}
        confirmLabel={t("common.confirm")}
        onCancelDelete={deleteSource.handleCancelDelete}
        onConfirmDelete={deleteSource.handleConfirmDelete}
        onDismissDelete={deleteSource.clearPendingDeleteSource}
        successSheetRef={feedback.successSheetRef}
        successTitle={feedback.successTitle}
        successDescription={feedback.successDescription}
        successIcon={feedback.successIcon}
      />
      <AppDialogModal
        visible={feedback.errorVisible}
        isDark={isDark}
        title={feedback.errorTitle}
        description={feedback.errorDescription}
        actionLabel={t("common.confirm")}
        icon="error-outline"
        onClose={() => feedback.setErrorVisible(false)}
      />
    </BottomSheetModalProvider>
  );
}
