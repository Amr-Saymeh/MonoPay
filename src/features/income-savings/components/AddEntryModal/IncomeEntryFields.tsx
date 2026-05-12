import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import { TextInput } from "react-native";

import { styles } from "./styles";

type IncomeEntryFieldsProps = {
  amount: string;
  notes: string;
  isDark: boolean;
  inputBg: string;
  inputBorder: string;
  inputColor: string;
  onAmountChange: (value: string) => void;
  onNotesChange: (value: string) => void;
};

export function IncomeEntryFields({
  amount,
  notes,
  isDark,
  inputBg,
  inputBorder,
  inputColor,
  onAmountChange,
  onNotesChange,
}: IncomeEntryFieldsProps) {
  const { t } = useI18n();
  const placeholderColor = isDark ? "rgba(255,255,255,0.3)" : "#9CA3AF";

  return (
    <>
      <ThemedText style={styles.modalLabel}>
        {t("incomeSavings.modal.amount")}
      </ThemedText>
      <TextInput
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="numeric"
        placeholder="0.00"
        placeholderTextColor={placeholderColor}
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
        placeholderTextColor={placeholderColor}
        style={[
          styles.input,
          {
            backgroundColor: inputBg,
            borderColor: inputBorder,
            color: inputColor,
          },
        ]}
      />
    </>
  );
}
