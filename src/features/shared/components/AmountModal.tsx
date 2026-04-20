import { ThemedText } from "@/components/themed-text";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
    InputAccessoryView,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface AmountModalProps {
  visible: boolean;
  onClose: () => void;
  isAdd: boolean;
  amount: string;
  onAmountChange: (value: string) => void;
  amountCurrency: string | null;
  onCurrencyChange: (currency: string) => void;
  amountReason: string;
  onReasonChange: (value: string) => void;
  availableCurrencies: string[];
  saving: boolean;
  onConfirm: () => void;
  availableBalance?: number;
}

function formatCurrency(code: string) {
  return code.trim().toUpperCase();
}

function formatAmount(value: number) {
  return Number(value).toFixed(2);
}

export function AmountModal({
  visible,
  onClose,
  isAdd,
  amount,
  onAmountChange,
  amountCurrency,
  onCurrencyChange,
  amountReason,
  onReasonChange,
  availableCurrencies,
  saving,
  onConfirm,
  availableBalance,
}: AmountModalProps) {
  const { t } = useI18n();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const inputBackgroundColor = useThemeColor({}, 'inputBackground');
  const inputBorderColor = useThemeColor({}, 'inputBorder');

  const showBalanceInfo = !isAdd && amountCurrency && availableBalance !== undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalCard, { backgroundColor }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalHandle, { backgroundColor: borderColor }]} />

          <ThemedText type="subtitle" style={styles.modalTitle}>
            {isAdd ? t("addMoney") : t("spendMoney")}
          </ThemedText>

          {/* Balance info for remove */}
          {showBalanceInfo && (
            <View style={styles.balanceInfoContainer}>
              <ThemedText style={styles.balanceInfoLabel}>
                {t("availableBalance")}
              </ThemedText>
              <ThemedText style={styles.balanceInfoValue}>
                {formatAmount(availableBalance)} {formatCurrency(amountCurrency)}
              </ThemedText>
            </View>
          )}

          <ThemedText style={styles.sectionTitle}>{t("amount") ?? "Amount"}</ThemedText>
          <AuthInput
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="numeric"
            placeholder="0.00"
            inputAccessoryViewID="amount_input_accessory"
          />

          <ThemedText style={[styles.sectionTitle, { marginTop: 6 }]}>
            {t("currency")}
          </ThemedText>
          <View style={styles.currencyChipsRow}>
            {availableCurrencies.map((code) => {
              const isSelected = formatCurrency(amountCurrency ?? "") === formatCurrency(code);
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={code}
                  onPress={() => onCurrencyChange(code)}
                  style={[
                    styles.currencyChip,
                    { borderColor: borderColor, backgroundColor: surfaceColor },
                    isSelected && [styles.currencyChipSelected, { borderColor: tintColor, backgroundColor: `${tintColor}15` }],
                  ]}
                >
                  <ThemedText
                    style={[styles.currencyChipText, isSelected && [styles.currencyChipTextSelected, { color: tintColor }]]}
                  >
                    {formatCurrency(code)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <ThemedText style={[styles.sectionTitle, { marginTop: 6 }]}>
            {t("noteOptional") ?? "Note (optional)"}
          </ThemedText>
          <TextInput
            value={amountReason}
            onChangeText={onReasonChange}
            placeholder={t("reasonPlaceholder")}
            placeholderTextColor={useThemeColor({}, 'placeholder')}
            style={[styles.noteInput, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, color: textColor }]}
            multiline
            inputAccessoryViewID="note_input_accessory"
          />

          <GradientButton
            label={saving ? t("saving") : t("confirm")}
            onPress={onConfirm}
            disabled={saving}
            loading={saving}
            style={styles.modalPrimaryButton}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            disabled={saving}
            style={[styles.modalSecondaryButton, { backgroundColor, borderColor }, saving && styles.disabledButton]}
          >
            <ThemedText style={styles.modalSecondaryText}>{t("cancel") ?? "Cancel"}</ThemedText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>

      {Platform.OS === "ios" && (
  <>
    <InputAccessoryView nativeID="amount_input_accessory">
      <View style={[styles.inputAccessory, { backgroundColor: surfaceColor, borderTopColor: borderColor }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => Keyboard.dismiss()}>
          <MaterialIcons name="check-circle" size={28} color="#a855f7" />
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
    <InputAccessoryView nativeID="note_input_accessory">
      <View style={[styles.inputAccessory, { backgroundColor: surfaceColor, borderTopColor: borderColor }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => Keyboard.dismiss()}>
          <MaterialIcons name="check-circle" size={28} color="#a855f7" />
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  </>
)}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 10,
  },
  modalHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginVertical: 8,
  },
  modalTitle: { marginBottom: 8 },
  balanceInfoContainer: {
    backgroundColor: "rgba(124,58,237,0.08)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceInfoLabel: {
     fontSize: 13,
     opacity: 0.7
    },
  balanceInfoValue: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
    color: "#7c3aed"
  },
  sectionTitle: {
    opacity: 0.65,
    fontFamily: Fonts.sansBold
  },
  currencyChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6
  },
  currencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  currencyChipSelected: {
  },
  currencyChipText: {
    fontSize: 13,
  },
  currencyChipTextSelected: {
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalPrimaryButton: {
    marginTop: 16
  },
  modalSecondaryButton: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 10,
  },
  modalSecondaryText: {
    fontFamily: Fonts.sansBold
  },
  disabledButton: {
    opacity: 0.5
  },
  inputAccessory: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
});
