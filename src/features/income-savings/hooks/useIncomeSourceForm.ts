import { hapticError, hapticSuccess, hapticTap } from "@/src/utils/haptics";
import type { useI18n } from "@/hooks/use-i18n";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  normalizeCurrencyCode,
  type IncomeSourceFormValues,
  type SourceTypeFilter,
} from "../constants";
import { useIncomeSavingsData } from "./useIncomeSavingsData";

type I18nT = ReturnType<typeof useI18n>["t"];

export function useIncomeSourceForm(params: {
  userUid?: string;
  selectedSourceTypeFilter: SourceTypeFilter;
  t: I18nT;
  showSuccess: (title: string, description: string, icon: "add-circle") => void;
  showError: (title: string, description: string) => void;
}) {
  const { userUid, selectedSourceTypeFilter, t, showSuccess, showError } =
    params;
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const { control, watch, setValue, reset, handleSubmit } =
    useForm<IncomeSourceFormValues>({
      mode: "all",
      defaultValues: {
        type: "salary",
        regularity: "monthly",
        selectedWalletSlot: null,
        amount: "",
        currency: "usd",
        notes: "",
      },
    });

  const type = watch("type");
  const regularity = watch("regularity");
  const selectedWalletSlot = watch("selectedWalletSlot");
  const amount = watch("amount");
  const currency = watch("currency");
  const notes = watch("notes");

  const data = useIncomeSavingsData({
    userUid,
    selectedWalletSlot,
    currency,
    selectedSourceTypeFilter,
    walletLabel: t("incomeSavings.walletLabel"),
    setValue,
  });

  const resetForm = (walletSlot: string | null) => {
    const firstCurrency = walletSlot
      ? data.walletCurrenciesBySlot[walletSlot]?.[0]
      : undefined;
    reset({
      type: "salary",
      regularity: "monthly",
      selectedWalletSlot: walletSlot,
      amount: "",
      currency: firstCurrency || "usd",
      notes: "",
    });
  };

  const handleOpenCreate = () => {
    hapticTap();
    if (data.walletOptions.length === 0) {
      showError(
        t("incomeSavings.noWalletsTitle"),
        t("incomeSavings.noWalletsDescription"),
      );
      return;
    }
    resetForm(data.walletOptions[0].slotKey);
    setSourceModalVisible(true);
  };

  const handleSaveSource = handleSubmit(async (formValues) => {
    if (!userUid) return;
    const selectedWalletValue =
      data.walletOptions.find(
        (wallet) => wallet.slotKey === formValues.selectedWalletSlot,
      ) ?? null;

    if (!selectedWalletValue) {
      hapticError();
      showError(
        t("incomeSavings.selectWalletTitle"),
        t("incomeSavings.selectWalletDescription"),
      );
      return;
    }

    const amountNum = Number(formValues.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      hapticError();
      showError(
        t("incomeSavings.invalidAmountTitle"),
        t("incomeSavings.invalidAmountDescription"),
      );
      return;
    }

    const currencyCode = normalizeCurrencyCode(formValues.currency) || "usd";
    try {
      await data.createMutation.mutateAsync({
        type: formValues.type,
        amount: amountNum,
        currency: currencyCode,
        walletid: selectedWalletValue.walletid,
        walletKey: selectedWalletValue.walletKey,
        walletName: selectedWalletValue.name,
        regularity: formValues.regularity,
        notes: formValues.notes,
      });
      setSourceModalVisible(false);
      resetForm(data.walletOptions[0]?.slotKey ?? null);
      hapticSuccess();
      showSuccess(
        t("incomeSavings.addedTitle"),
        t("incomeSavings.addedDescription"),
        "add-circle",
      );
    } catch (error) {
      hapticError();
      showError(t("error"), String(error));
    }
  });

  return {
    ...data,
    control,
    sourceModalVisible,
    setSourceModalVisible,
    type,
    regularity,
    selectedWalletSlot,
    amount,
    currency,
    notes,
    setValue,
    handleOpenCreate,
    handleSaveSource,
  };
}
