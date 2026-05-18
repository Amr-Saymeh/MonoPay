import { useI18n } from "@/hooks/use-i18n";
import { db } from "@/src/firebaseConfig";
import { hapticSuccess } from "@/src/utils/haptics";
import { ref, update } from "firebase/database";
import { useCallback, useState } from "react";

import { interpolate } from "../contributionModal.utils";
import type { ContributionFormValues, UserWalletRef } from "../types";

type UseContributionSubmitParams = {
  wallets: UserWalletRef[];
  currencyLabel: string;
  targetAmount?: number;
  currentAmount: number;
  onSubmit: (amount: number, reason?: string) => void | Promise<void>;
  showError: (title: string, description: string) => void;
};

export function useContributionSubmit({
  wallets,
  currencyLabel,
  targetAmount,
  currentAmount,
  onSubmit,
  showError,
}: UseContributionSubmitParams) {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);

  const submitContribution = useCallback(
    async (data: ContributionFormValues) => {
      const amountNum = parseFloat(data.amount);

      if (wallets.length === 0) {
        showError(
          t("goals.noWalletsAvailableTitle"),
          interpolate(t("goals.noWalletsAvailableDescription"), {
            currency: currencyLabel,
          }),
        );
        return;
      }

      if (!data.amount || Number.isNaN(amountNum)) {
        showError(
          t("goals.invalidInputTitle"),
          t("goals.invalidContributionAmount"),
        );
        return;
      }
      if (amountNum <= 0) {
        showError(
          t("goals.invalidInputTitle"),
          t("goals.amountMustBeGreaterThanZero"),
        );
        return;
      }
      if (!data.selectedWalletKey) {
        showError(
          t("goals.noWalletSelectedTitle"),
          t("goals.selectWalletToContribute"),
        );
        return;
      }

      const sourceWallet = wallets.find(
        (wallet) => wallet.walletKey === data.selectedWalletKey,
      );
      if (!sourceWallet) return;

      if (amountNum > sourceWallet.balance) {
        showError(
          t("goals.insufficientBalanceTitle"),
          interpolate(t("goals.insufficientBalanceDescription"), {
            wallet: sourceWallet.name,
            balance: sourceWallet.balance.toFixed(2),
            currency: currencyLabel,
          }),
        );
        return;
      }

      if (targetAmount !== undefined) {
        const remaining = targetAmount - currentAmount;
        if (amountNum > remaining) {
          showError(
            t("goals.exceedsGoalTitle"),
            interpolate(t("goals.exceedsGoalDescription"), {
              remaining: remaining.toFixed(2),
              currency: currencyLabel,
            }),
          );
          return;
        }
      }

      setSubmitting(true);
      try {
        const newBalance = sourceWallet.balance - amountNum;
        await onSubmit(amountNum, data.reason.trim() || undefined);
        update(ref(db, `wallets/${data.selectedWalletKey}`), {
          [`${sourceWallet.currencyContainer}/${sourceWallet.currencyKey}`]:
            newBalance,
        }).catch((error) => {
          console.warn(
            "Contribution saved locally, but source wallet sync failed",
            error,
          );
        });

        hapticSuccess();
      } catch (error) {
        showError(t("error"), String(error));
      } finally {
        setSubmitting(false);
      }
    },
    [
      currencyLabel,
      currentAmount,
      onSubmit,
      showError,
      t,
      targetAmount,
      wallets,
    ],
  );

  return { submitting, submitContribution };
}

