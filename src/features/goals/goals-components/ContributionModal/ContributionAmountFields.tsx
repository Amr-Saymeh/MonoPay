import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import React from "react";
import { Controller, type Control } from "react-hook-form";
import { TextInput } from "react-native";

import { styles } from "./stylesheet";
import type { ContributionFormValues } from "./types";

type ContributionAmountFieldsProps = {
  control: Control<ContributionFormValues>;
  currencyLabel: string;
  inputBg: string;
  inputBorder: string;
  inputColor: string;
  placeholderColor: string;
};

export function ContributionAmountFields({
  control,
  currencyLabel,
  inputBg,
  inputBorder,
  inputColor,
  placeholderColor,
}: ContributionAmountFieldsProps) {
  const { t } = useI18n();

  return (
    <>
      <ThemedText style={styles.label}>
        {t("goals.contributionAmount")} *
      </ThemedText>
      <Controller
        control={control}
        name="amount"
        rules={{
          required: true,
          validate: (value) => {
            const amount = Number(value);
            return Number.isFinite(amount) && amount > 0;
          },
        }}
        render={({ field: { value, onChange, onBlur }, fieldState: { invalid } }) => (
          <>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: invalid ? "#EF4444" : inputBorder,
                  color: inputColor,
                },
              ]}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={`0.00 ${currencyLabel}`}
              placeholderTextColor={placeholderColor}
              keyboardType="numeric"
              returnKeyType="next"
            />
            {invalid && (
              <ThemedText style={styles.fieldError}>
                {t("goals.invalidContributionAmount")}
              </ThemedText>
            )}
          </>
        )}
      />

      <ThemedText style={styles.label}>
        {t("goals.contributionReason")}
      </ThemedText>
      <Controller        control={control}
        name="reason"
        render={({ field: { value, onChange } }) => (
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: inputBg,
                borderColor: inputBorder,
                color: inputColor,
              },
            ]}
            value={value}
            onChangeText={onChange}
            placeholder={t("goals.contributionReason")}
            placeholderTextColor={placeholderColor}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        )}
      />
    </>
  );
}
