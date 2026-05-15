import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import { Controller, type Control } from "react-hook-form";
import { TextInput } from "react-native";

import type { IncomeSourceFormValues } from "../../constants";
import { styles } from "./styles";

type IncomeEntryFieldsProps = {
  control: Control<IncomeSourceFormValues>;
  notes: string;
  isDark: boolean;
  inputBg: string;
  inputBorder: string;
  inputColor: string;
  onNotesChange: (value: string) => void;
};

export function IncomeEntryFields({
  control,
  notes,
  isDark,
  inputBg,
  inputBorder,
  inputColor,
  onNotesChange,
}: IncomeEntryFieldsProps) {
  const { t } = useI18n();
  const placeholderColor = isDark ? "rgba(255,255,255,0.3)" : "#9CA3AF";

  return (
    <>
      <ThemedText style={styles.modalLabel}>
        {t("incomeSavings.modal.amount")}
      </ThemedText>
      <Controller
        control={control}
        name="amount"
        rules={{
          required: t("incomeSavings.invalidAmountDescription"),
          validate: (value) => {
            const amountNum = Number(value);
            return (
              (Number.isFinite(amountNum) && amountNum > 0) ||
              t("incomeSavings.invalidAmountDescription")
            );
          },
        }}
        render={({
          field: { value, onChange, onBlur },
          fieldState: { error, invalid },
        }) => (
          <>
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: invalid ? "#EF4444" : inputBorder,
                  color: inputColor,
                },
              ]}
            />
            {invalid && (
              <ThemedText style={styles.fieldError}>
                {error?.message}
              </ThemedText>
            )}
          </>
        )}
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
