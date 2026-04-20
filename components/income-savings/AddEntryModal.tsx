import React from "react";
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
import { MaterialIcons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import type { Regularity, SourceType } from "@/src/services/incomeSources.service";
import { hapticSelection, hapticTap } from "@/src/utils/haptics";

export interface WalletOption {
  slotKey: string;
  walletid: number;
  walletKey: string;
  name: string;
}

interface AddEntryModalProps {
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
}

function normalizeCurrencyCode(value: string | undefined | null): string {
  if (!value) return "";
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
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
  const modalBg = isDark ? "#1F1B2E" : "#FFFFFF";
  const pillBorder = isDark ? "rgba(255,255,255,0.2)" : "#E5E7EB";
  const pillTextColor = isDark ? "rgba(255,255,255,0.75)" : "#6B7280";
  const walletTextColor = isDark ? "#F3F4F6" : "#111827";
  const cancelBorder = isDark ? "rgba(255,255,255,0.2)" : "#E5E7EB";
  const cancelTextColor = isDark ? "rgba(255,255,255,0.78)" : "rgba(17,24,39,0.78)";
  const currencyOptions = React.useMemo(() => {
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalKeyboard}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={onClose} />
          <View style={[styles.modalCard, { backgroundColor: modalBg }]}>
            <ThemedText style={styles.modalTitle}>{t("incomeSavings.modal.addRegularSource")}</ThemedText>
            <View style={styles.modalBody}>
              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                nestedScrollEnabled
                bounces={false}
                overScrollMode="never"
                scrollEventThrottle={16}
                contentContainerStyle={styles.modalScrollContent}
              >
                <ThemedText style={styles.modalLabel}>{t("incomeSavings.modal.sourceType")}</ThemedText>
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

                <ThemedText style={styles.modalLabel}>{t("incomeSavings.modal.wallet")}</ThemedText>
                <View style={styles.walletList}>
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
                        <ThemedText style={[styles.walletOptionText, { color: walletTextColor }]}>
                          {wallet.name}
                        </ThemedText>
                        {isSelected ? <MaterialIcons name="check-circle" size={18} color="#7C3AED" /> : null}
                      </Pressable>
                    );
                  })}
                </View>

                <ThemedText style={styles.modalLabel}>{t("incomeSavings.modal.regularity")}</ThemedText>
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

                <ThemedText style={styles.modalLabel}>{t("incomeSavings.modal.currency")}</ThemedText>
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

                <ThemedText style={styles.modalLabel}>{t("incomeSavings.modal.amount")}</ThemedText>
                <TextInput
                  value={amount}
                  onChangeText={onAmountChange}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#9CA3AF"}
                  style={[
                    styles.input,
                    { backgroundColor: inputBg, borderColor: inputBorder, color: inputColor },
                  ]}
                />

                <ThemedText style={styles.modalLabel}>{t("incomeSavings.modal.notesOptional")}</ThemedText>
                <TextInput
                  value={notes}
                  onChangeText={onNotesChange}
                  placeholder={t("incomeSavings.modal.notesPlaceholder")}
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#9CA3AF"}
                  style={[
                    styles.input,
                    { backgroundColor: inputBg, borderColor: inputBorder, color: inputColor },
                  ]}
                />
              </ScrollView>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.cancelBtn, { borderColor: cancelBorder }]}
                onPress={() => {
                  hapticTap();
                  onClose();
                }}
              >
                <View style={styles.actionRow}>
                  <MaterialIcons name="close" size={16} color={cancelTextColor} />
                  <ThemedText style={[styles.cancelText, { color: cancelTextColor }]}> 
                    {t("common.cancel")}
                  </ThemedText>
                </View>
              </Pressable>
              <Pressable
                style={styles.saveBtn}
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
                    {saving ? t("incomeSavings.modal.saving") : t("incomeSavings.modal.saveAndAddBalance")}
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalKeyboard: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 18,
    padding: 20,
    maxHeight: "92%",
    minHeight: 500,
    backgroundColor: "#FFFFFF",
  },
  modalBody: {
    flex: 1,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 12,
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
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
    gap: 8,
  },
  walletOption: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walletOptionSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  walletOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
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
    marginTop: 16,
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
