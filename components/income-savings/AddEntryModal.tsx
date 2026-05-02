import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";

import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import type {
  Regularity,
  SourceType,
} from "@/src/services/incomeSources.service";
import { hapticSelection, hapticTap } from "@/src/utils/haptics";

export type WalletOption = {
  slotKey: string;
  walletid: number;
  walletKey: string;
  name: string;
};

type AddEntryModalProps = {
  visible: boolean;
  isDark: boolean;
  saving: boolean;
  type: SourceType;
  regularity: Regularity;
  selectedWalletSlot: string | null;
  amount: string;
  currency: string;
  notes: string;
  sourceTypes: SourceType[];
  regularityTypes: Regularity[];
  walletOptions: WalletOption[];
  selectedWalletCurrencies: string[];
  onClose: () => void;
  onSave: () => void;
  onTypeChange: (value: SourceType) => void;
  onRegularityChange: (value: Regularity) => void;
  onWalletSelect: (slotKey: string) => void;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onNotesChange: (value: string) => void;
};

function normalizeCurrencyCode(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function AddEntryModal({
  visible,
  isDark,
  saving,
  type,
  regularity,
  selectedWalletSlot,
  amount,
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
  onAmountChange,
  onCurrencyChange,
  onNotesChange,
}: AddEntryModalProps) {
  const { t } = useI18n();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["88%"], []);

  const getSourceTypeLabel = (value: SourceType) => {
    switch (value) {
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
  };

  const getRegularityLabel = (value: Regularity) => {
    switch (value) {
      case "daily":
        return t("incomeSavings.daily");
      case "weekly":
        return t("incomeSavings.weekly");
      case "yearly":
        return t("incomeSavings.yearly");
      default:
        return t("incomeSavings.monthly");
    }
  };

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
  const currencyOptions = useMemo(() => {
    const rawCurrencies =
      selectedWalletCurrencies.length > 0
        ? selectedWalletCurrencies
        : ["usd", "eur", "nis"];

    return Array.from(
      new Set(
        rawCurrencies
          .map((item) => normalizeCurrencyCode(item))
          .filter(Boolean),
      ),
    );
  }, [selectedWalletCurrencies]);

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={[styles.modalButtons, { backgroundColor: sheetBg }]}>
          <Pressable
            style={[styles.cancelBtn, { borderColor: cancelBorder }]}
            onPress={() => {
              hapticTap();
              sheetRef.current?.dismiss();
            }}
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
          <Pressable
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            disabled={saving}
            onPress={() => {
              hapticTap();
              onSave();
            }}
          >
            <View style={styles.actionRow}>
              <MaterialIcons
                name={saving ? "hourglass-top" : "add-circle-outline"}
                size={16}
                color="#FFFFFF"
              />
              <ThemedText style={styles.saveText}>
                {saving
                  ? t("incomeSavings.modal.saving")
                  : t("incomeSavings.modal.saveAndAddBalance")}
              </ThemedText>
            </View>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [cancelBorder, cancelTextColor, onSave, saving, sheetBg, t],
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
        <View style={styles.pillsWrap}>
          {sourceTypes.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.pill,
                { borderColor: pillBorder },
                type === item && styles.pillSelected,
              ]}
              onPress={() => {
                hapticSelection();
                onTypeChange(item);
              }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: pillTextColor },
                  type === item && styles.pillTextSelected,
                ]}
              >
                {getSourceTypeLabel(item)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText style={styles.modalLabel}>
          {t("incomeSavings.modal.wallet")}
        </ThemedText>
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
          {walletOptions.map((wallet) => {
            const isSelected = selectedWalletSlot === wallet.slotKey;
            return (
              <Pressable
                key={wallet.slotKey}
                style={[
                  styles.walletOption,
                  { borderColor: pillBorder },
                  isSelected && styles.walletOptionSelected,
                ]}
                onPress={() => {
                  hapticSelection();
                  onWalletSelect(wallet.slotKey);
                }}
              >
                <ThemedText
                  numberOfLines={1}
                  style={[styles.walletOptionText, { color: walletTextColor }]}
                >
                  {wallet.name}
                </ThemedText>
                {isSelected ? (
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#7C3AED"
                    style={styles.walletCheckIcon}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </GestureScrollView>

        <ThemedText style={styles.modalLabel}>
          {t("incomeSavings.modal.regularity")}
        </ThemedText>
        <View style={styles.pillsWrap}>
          {regularityTypes.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.pill,
                { borderColor: pillBorder },
                regularity === item && styles.pillSelected,
              ]}
              onPress={() => {
                hapticSelection();
                onRegularityChange(item);
              }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: pillTextColor },
                  regularity === item && styles.pillTextSelected,
                ]}
              >
                {getRegularityLabel(item)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText style={styles.modalLabel}>
          {t("incomeSavings.modal.currency")}
        </ThemedText>
        <View style={styles.pillsWrap}>
          {currencyOptions.map((item) => {
            const normalized = normalizeCurrencyCode(currency);
            return (
              <Pressable
                key={item}
                style={[
                  styles.pill,
                  { borderColor: pillBorder },
                  normalized === item && styles.pillSelected,
                ]}
                onPress={() => {
                  hapticSelection();
                  onCurrencyChange(item);
                }}
              >
                <ThemedText
                  style={[
                    styles.pillText,
                    { color: pillTextColor },
                    normalized === item && styles.pillTextSelected,
                  ]}
                >
                  {item.toUpperCase()}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText style={styles.modalLabel}>
          {t("incomeSavings.modal.amount")}
        </ThemedText>
        <TextInput
          value={amount}
          onChangeText={onAmountChange}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#9CA3AF"}
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputColor,
            },
          ]}
        />

        <ThemedText style={styles.modalLabel}>
          {t("incomeSavings.modal.notesOptional")}
        </ThemedText>
        <TextInput
          value={notes}
          onChangeText={onNotesChange}
          placeholder={t("incomeSavings.modal.notesPlaceholder")}
          placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#9CA3AF"}
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputColor,
            },
          ]}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  sheetHandle: {
    width: 44,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 112,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 18,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 8,
    opacity: 0.75,
  },
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124,58,237,0.1)",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  pillTextSelected: {
    color: "#7C3AED",
  },
  walletList: {
    paddingRight: 20,
  },
  walletListScroll: {
    height: 50,
  },
  walletOption: {
    width: 112,
    height: 46,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginRight: 8,
    justifyContent: "center",
  },
  walletOptionSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  walletOptionText: {
    paddingRight: 16,
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
  walletCheckIcon: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  modalButtons: {
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.7,
  },
  saveBtn: {
    flex: 2,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7C3AED",
  },
  saveBtnDisabled: {
    opacity: 0.65,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
