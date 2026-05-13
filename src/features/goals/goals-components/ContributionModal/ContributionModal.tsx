import { ThemedText } from "@/components/themed-text";
import { AppDialogModal } from "@/components/ui/AppDialogModal";
import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { hapticTap } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import * as NavigationBar from "expo-navigation-bar";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { Keyboard, Platform, Pressable, View } from "react-native";

import { ContributionAmountFields } from "./ContributionAmountFields";
import { ContributionModalFooter } from "./ContributionModalFooter";
import { ContributionWalletSelector } from "./ContributionWalletSelector";
import { normalizeCurrencyCode } from "./contributionModal.utils";
import { styles } from "./stylesheet";
import type { ContributionFormValues } from "./types";
import {
  useContributionError,
  useContributionModalTheme,
  useContributionSubmit,
  useContributionWallets,
} from "./hooks";

type ContributionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason?: string) => void | Promise<void>;
  currency: string;
  targetAmount?: number;
  currentAmount?: number;
};

export const ContributionModal = ({
  visible,
  onClose,
  onSubmit,
  currency,
  targetAmount,
  currentAmount = 0,
}: ContributionModalProps) => {
  const { t } = useI18n();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const theme = useContributionModalTheme(isDark);
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["88%"], []);
  const normalizedGoalCurrency = normalizeCurrencyCode(currency) || "usd";
  const currencyLabel = normalizedGoalCurrency.toUpperCase();

  const { control, watch, setValue, reset, handleSubmit } =
    useForm<ContributionFormValues>({
      mode: "all",
      defaultValues: {
        amount: "",
        reason: "",
        selectedWalletKey: null,
      },
    });

  const selectedWalletKey = watch("selectedWalletKey");
  const {
    errorTitle,
    errorDescription,
    errorVisible,
    showError,
    closeError,
  } = useContributionError();

  const { wallets, loadingWallets } = useContributionWallets({
    visible,
    userUid: user?.uid,
    normalizedGoalCurrency,
    selectedWalletKey,
    reset,
    setValue,
  });

  const { submitting, submitContribution } = useContributionSubmit({
    wallets,
    currencyLabel,
    targetAmount,
    currentAmount,
    onSubmit,
    showError,
  });

  const remaining =
    targetAmount !== undefined ? targetAmount - currentAmount : null;

  const handleDismiss = useCallback(() => {
    hapticTap();
    sheetRef.current?.dismiss();
  }, []);

  const handleContributePress = useCallback(() => {
    Keyboard.dismiss();
    handleSubmit(submitContribution)();
  }, [handleSubmit, submitContribution]);

  const renderFooter = useCallback(
    (props: any) => (
      <ContributionModalFooter
        bottomSheetProps={props}
        backgroundColor={theme.sheetBg}
        cancelBorder={theme.cancelBorder}
        cancelTextColor={theme.cancelTextColor}
        disabled={wallets.length === 0 || submitting}
        loading={submitting}
        onCancel={handleDismiss}
        onConfirm={handleContributePress}
      />
    ),
    [
      handleContributePress,
      handleDismiss,
      submitting,
      theme.cancelBorder,
      theme.cancelTextColor,
      theme.sheetBg,
      wallets.length,
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
    <>
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
          { backgroundColor: theme.sheetHandle },
        ]}
        backgroundStyle={[
          styles.sheetBackground,
          { backgroundColor: theme.sheetBg },
        ]}
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
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>
              {t("goals.addContribution")}
            </ThemedText>
            <Pressable onPress={handleDismiss} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={theme.iconColor} />
            </Pressable>
          </View>

          {remaining !== null && (
            <View style={styles.hintRow}>
              <MaterialIcons name="info-outline" size={14} color="#8B5CF6" />
              <ThemedText style={styles.hintText}>
                {remaining.toFixed(2)} {currencyLabel}{" "}
                {t("goals.remainingToReachGoal")}
              </ThemedText>
            </View>
          )}

          <ContributionWalletSelector
            wallets={wallets}
            selectedWalletKey={selectedWalletKey}
            loading={loadingWallets}
            currencyLabel={currencyLabel}
            isDark={isDark}
            cardBg={theme.cardBg}
            cardBorder={theme.cardBorder}
            iconColor={theme.iconColor}
            onSelect={(walletKey) => setValue("selectedWalletKey", walletKey)}
            showError={showError}
          />

          <ContributionAmountFields
            control={control}
            currencyLabel={currencyLabel}
            inputBg={theme.inputBg}
            inputBorder={theme.inputBorder}
            inputColor={theme.inputColor}
            placeholderColor={theme.placeholderColor}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
      <AppDialogModal
        visible={errorVisible}
        isDark={isDark}
        title={errorTitle}
        description={errorDescription}
        actionLabel={t("common.confirm")}
        icon="error-outline"
        onClose={closeError}
      />
    </>
  );
};

