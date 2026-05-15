import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import { hapticTap } from "@/src/utils/haptics";

import { AddEntryModalFooter } from "./AddEntryModalFooter";
import { IncomeCurrencySelector } from "./IncomeCurrencySelector";
import { IncomeEntryFields } from "./IncomeEntryFields";
import { IncomeRegularitySelector } from "./IncomeRegularitySelector";
import { IncomeSourceTypeSelector } from "./IncomeSourceTypeSelector";
import { IncomeWalletSelector } from "./IncomeWalletSelector";
import { styles } from "./styles";
import type { AddEntryModalProps, WalletOption } from "./types";

export type { WalletOption };

export function AddEntryModal({
  visible,
  isDark,
  saving,
  control,
  type,
  regularity,
  selectedWalletSlot,
  currency,
  notes,
  sourceTypes,
  regularityTypes,
  walletOptions,
  selectedWalletCurrencies,
  onClose,
  onSave,
  onTypeChange,
  onRegularityChange,
  onWalletSelect,
  onCurrencyChange,
  onNotesChange,
}: AddEntryModalProps) {
  const { t } = useI18n();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["88%"], []);

  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#F9FAFB";
  const inputBorder = isDark ? "rgba(255,255,255,0.15)" : "#E5E7EB";
  const inputColor = isDark ? "#FFFFFF" : "#111827";
  const sheetBg = isDark ? "#1F1B2E" : "#FFFFFF";
  const sheetHandle = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)";
  const pillBorder = isDark ? "rgba(255,255,255,0.2)" : "#E5E7EB";
  const pillTextColor = isDark ? "rgba(255,255,255,0.75)" : "#6B7280";
  const walletTextColor = isDark ? "#F3F4F6" : "#111827";
  const cancelBorder = isDark ? "rgba(255,255,255,0.2)" : "#E5E7EB";
  const cancelTextColor = isDark
    ? "rgba(255,255,255,0.78)"
    : "rgba(17,24,39,0.78)";

  const handleCancel = useCallback(() => {
    hapticTap();
    sheetRef.current?.dismiss();
  }, []);

  const handleSave = useCallback(() => {
    hapticTap();
    onSave();
  }, [onSave]);

  const renderFooter = useCallback(
    (props: any) => (
      <AddEntryModalFooter
        bottomSheetProps={props}
        saving={saving}
        sheetBg={sheetBg}
        cancelBorder={cancelBorder}
        cancelTextColor={cancelTextColor}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    ),
    [
      cancelBorder,
      cancelTextColor,
      handleCancel,
      handleSave,
      saving,
      sheetBg,
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
        style={styles.modalScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        contentContainerStyle={styles.modalScrollContent}
      >
        <ThemedText style={styles.modalTitle}>
          {t("incomeSavings.modal.addRegularSource")}
        </ThemedText>

        <ThemedText style={styles.modalLabel}>
          {t("incomeSavings.modal.sourceType")}
        </ThemedText>
        <IncomeSourceTypeSelector
          type={type}
          sourceTypes={sourceTypes}
          pillBorder={pillBorder}
          pillTextColor={pillTextColor}
          onTypeChange={onTypeChange}
        />

        <ThemedText style={styles.modalLabel}>
          {t("incomeSavings.modal.wallet")}
        </ThemedText>
        <IncomeWalletSelector
          walletOptions={walletOptions}
          selectedWalletSlot={selectedWalletSlot}
          pillBorder={pillBorder}
          walletTextColor={walletTextColor}
          onWalletSelect={onWalletSelect}
        />

        <ThemedText style={styles.modalLabel}>
          {t("incomeSavings.modal.regularity")}
        </ThemedText>
        <IncomeRegularitySelector
          regularity={regularity}
          regularityTypes={regularityTypes}
          pillBorder={pillBorder}
          pillTextColor={pillTextColor}
          onRegularityChange={onRegularityChange}
        />

        <ThemedText style={styles.modalLabel}>
          {t("incomeSavings.modal.currency")}
        </ThemedText>
        <IncomeCurrencySelector
          currency={currency}
          selectedWalletCurrencies={selectedWalletCurrencies}
          pillBorder={pillBorder}
          pillTextColor={pillTextColor}
          onCurrencyChange={onCurrencyChange}
        />

        <IncomeEntryFields
          control={control}
          notes={notes}
          isDark={isDark}
          inputBg={inputBg}
          inputBorder={inputBorder}
          inputColor={inputColor}
          onNotesChange={onNotesChange}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
