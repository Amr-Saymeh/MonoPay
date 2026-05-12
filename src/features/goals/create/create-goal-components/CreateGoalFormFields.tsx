import { ThemedText } from "@/components/themed-text";
import { hapticSelection } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import type React from "react";
import DateTimePicker from "react-native-ui-datepicker";
import { Controller, type Control, type FieldErrors, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import { Pressable, TextInput, View } from "react-native";

import type { FormValues } from "../constants";
import { CurrencySelector } from "./CurrencySelector";
import { styles } from "../stylesheet";

type CreateGoalFormFieldsProps = {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  labels: Record<string, string>;
  theme: any;
  isDark: boolean;
  language: string;
  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  watchedTargetDate: number | null;
  pickerMonth: number;
  pickerYear: number;
  setPickerMonth: (value: number) => void;
  setPickerYear: (value: number) => void;
  todayStart: Date;
  datePickerStyles: any;
  pickerPanHandlers: any;
};

export function CreateGoalFormFields({
  control,
  errors,
  watch,
  setValue,
  labels,
  theme,
  isDark,
  language,
  showDatePicker,
  setShowDatePicker,
  watchedTargetDate,
  pickerMonth,
  pickerYear,
  setPickerMonth,
  setPickerYear,
  todayStart,
  datePickerStyles,
  pickerPanHandlers,
}: CreateGoalFormFieldsProps) {
  return (
    <>
      {/* Goal Name */}
              <ThemedText style={styles.label}>
                {labels.goalName} *
              </ThemedText>
              <Controller
                control={control}
                name="title"
                rules={{ required: labels.required }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      theme.inputStyle,
                      errors.title && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    placeholder={labels.titlePlaceholder}
                    placeholderTextColor={theme.placeholder}
                  />
                )}
              />
              {errors.title && (
                <ThemedText style={styles.errorText}>
                  {errors.title.message}
                </ThemedText>
              )}

              {/* Target Amount */}
              <ThemedText style={styles.label}>
                {labels.targetAmount} *
              </ThemedText>
              <Controller
                control={control}
                name="targetAmount"
                rules={{
                  required: labels.required,
                  validate: (v) => parseFloat(v) > 0 || labels.invalidAmount,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      theme.inputStyle,
                      errors.targetAmount && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="0.00"
                    placeholderTextColor={theme.placeholder}
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.targetAmount && (
                <ThemedText style={styles.errorText}>
                  {errors.targetAmount.message}
                </ThemedText>
              )}

              {/* Current Amount */}
              <ThemedText style={styles.label}>
                {labels.currentAmount}
              </ThemedText>
              <Controller
                control={control}
                name="currentAmount"
                rules={{
                  validate: (v) => {
                    if (!v || v.trim() === "") return true;
                    const currentNum = parseFloat(v);
                    if (Number.isNaN(currentNum))
                      return labels.invalidCurrentAmount;
                    if (currentNum < 0) return labels.invalidCurrentAmount;

                    const targetNum = parseFloat(watch("targetAmount"));
                    if (!Number.isNaN(targetNum) && currentNum >= targetNum) {
                      return labels.currentLessThanTarget;
                    }
                    return true;
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      theme.inputStyle,
                      errors.currentAmount && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="0.00"
                    placeholderTextColor={theme.placeholder}
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.currentAmount && (
                <ThemedText style={styles.errorText}>
                  {errors.currentAmount.message}
                </ThemedText>
              )}

              {/* Target Date */}
              <ThemedText style={styles.label}>
                {labels.targetDate} *
              </ThemedText>
              <Controller
                control={control}
                name="targetDate"
                rules={{ required: labels.required }}
                render={({ field: { value } }) => (
                  <Pressable
                    onPress={() => {
                      hapticSelection();
                      setShowDatePicker((prev) => !prev);
                    }}
                    style={[
                      styles.input,
                      styles.dateRow,
                      theme.inputStyle,
                      errors.targetDate && styles.inputError,
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: value ? theme.inputColor : theme.placeholder,
                        fontSize: 16,
                      }}
                    >
                      {value
                        ? new Date(value).toLocaleDateString()
                        : labels.datePlaceholder}
                    </ThemedText>
                    <MaterialIcons
                      name={showDatePicker ? "expand-less" : "calendar-today"}
                      size={18}
                      color={theme.placeholder}
                    />
                  </Pressable>
                )}
              />
              {showDatePicker ? (
                <View
                  style={[
                    styles.datePickerCard,
                    {
                      backgroundColor: theme.datePickerCardBg,
                      borderColor: theme.datePickerCardBorder,
                    },
                  ]}
                >
                  <DateTimePicker
                    mode="single"
                    locale={language}
                    date={
                      watchedTargetDate
                        ? new Date(watchedTargetDate)
                        : new Date()
                    }
                    month={pickerMonth}
                    year={pickerYear}
                    minDate={todayStart}
                    onMonthChange={(month) => setPickerMonth(month)}
                    onYearChange={(year) => setPickerYear(year)}
                    onChange={({ date }) => {
                      if (!date) return;
                      hapticSelection();
                      const nextValue =
                        date instanceof Date
                          ? date.getTime()
                          : new Date(date as string | number).getTime();
                      setValue("targetDate", nextValue, {
                        shouldValidate: true,
                      });
                      setShowDatePicker(false);
                    }}
                    styles={datePickerStyles}
                    style={styles.datePicker}
                    {...pickerPanHandlers}
                  />
                </View>
              ) : null}
              {errors.targetDate && (
                <ThemedText style={styles.errorText}>
                  {errors.targetDate.message}
                </ThemedText>
              )}

              {/* Currency */}
              <ThemedText style={styles.label}>
                {labels.currency}
              </ThemedText>
              <Controller
                control={control}
                name="currency"
                render={({ field: { value, onChange } }) => (
                  <CurrencySelector
                    value={value}
                    borderColor={theme.pillBorder}
                    backgroundColor={theme.pillBg}
                    textColor={theme.pillTextColor}
                    onChange={onChange}
                  />
                )}
              />
    </>
  );
}

