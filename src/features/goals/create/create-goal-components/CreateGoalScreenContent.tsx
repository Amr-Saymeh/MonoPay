import { ThemedView } from "@/components/themed-view";
import { AppDialogModal } from "@/components/ui/AppDialogModal";
import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Animated, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getCreateGoalTheme } from "../constants";
import {
  useCreateGoalDatePicker,
  useCreateGoalForm,
  useCreateGoalNavigation,
  useCreateGoalSubmit,
} from "../create-goal-hooks";
import { styles } from "../stylesheet";
import { CreateGoalFooter } from "./CreateGoalFooter";
import { CreateGoalFormFields } from "./CreateGoalFormFields";
import { CreateGoalHeader } from "./CreateGoalHeader";
import { GoalPreviewCard } from "./GoalPreviewCard";

export function CreateGoalScreenContent() {
  const { t, language } = useI18n();
  const params = useLocalSearchParams();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const theme = getCreateGoalTheme(isDark);

  const {
    control,
    errors,
    handleSubmit,
    watch,
    setValue,
    reset,
    watchedTitle,
    watchedTargetDate,
    previewAmount,
  } = useCreateGoalForm(params, isFocused);

  const { pageTransition, handleBack } = useCreateGoalNavigation(reset);
  const {
    isEditing,
    onSubmit,
    saving,
    successVisible,
    successTitle,
    successDescription,
    closeSuccess,
  } = useCreateGoalSubmit(user?.uid);

  const {
    showDatePicker,
    setShowDatePicker,
    pickerMonth,
    pickerYear,
    setPickerMonth,
    setPickerYear,
    todayStart,
    datePickerStyles,
    pickerPanHandlers,
  } = useCreateGoalDatePicker(watchedTargetDate, isDark);

  return (
    <>
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: theme.headerSurface,
          },
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
            <CreateGoalHeader
              title={isEditing ? t("goals.editTitle") : t("goals.createTitle")}
              isDark={isDark}
              backgroundColor={theme.headerSurface}
              borderColor={theme.headerBorder}
              onBack={handleBack}
            />

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <GoalPreviewCard
                title={watchedTitle}
                fallbackTitle={t("goals.goalName")}
                targetLabel={t("goals.targetAmount")}
                amount={previewAmount}
                targetDate={watchedTargetDate}
              />

              <CreateGoalFormFields
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                labels={{
                  goalName: t("goals.goalName"),
                  required: t("required"),
                  titlePlaceholder: t("goals.titlePlaceholder"),
                  targetAmount: t("goals.targetAmount"),
                  invalidAmount: t("invalidAmount"),
                  currentAmount: t("goals.currentAmount"),
                  invalidCurrentAmount: t("goals.invalidCurrentAmount"),
                  currentLessThanTarget: t("goals.currentLessThanTarget"),
                  targetDate: t("goals.targetDate"),
                  datePlaceholder: t("goals.datePlaceholder"),
                  currency: t("goals.currency"),
                }}
                theme={theme}
                isDark={isDark}
                language={language}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                watchedTargetDate={watchedTargetDate}
                pickerMonth={pickerMonth}
                pickerYear={pickerYear}
                setPickerMonth={setPickerMonth}
                setPickerYear={setPickerYear}
                todayStart={todayStart}
                datePickerStyles={datePickerStyles}
                pickerPanHandlers={pickerPanHandlers}
              />
            </ScrollView>

            <CreateGoalFooter
              label={isEditing ? t("common.save") : t("common.add")}
              isEditing={isEditing}
              onPress={handleSubmit(onSubmit)}
              loading={saving}
            />
          </ThemedView>
        </Animated.View>
      </View>
      <AppDialogModal
        visible={successVisible}
        isDark={isDark}
        title={successTitle}
        description={successDescription}
        actionLabel={t("common.confirm")}
        icon="check-circle"
        onClose={closeSuccess}
      />
    </>
  );
}

