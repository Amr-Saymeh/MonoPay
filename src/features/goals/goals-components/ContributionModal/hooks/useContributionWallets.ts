import { db } from "@/src/firebaseConfig";
import { get, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import type { UseFormReset, UseFormSetValue } from "react-hook-form";

import { normalizeCurrencyCode } from "../contributionModal.utils";
import type { ContributionFormValues, UserWalletRef } from "../types";

type UseContributionWalletsParams = {
  visible: boolean;
  userUid?: string;
  normalizedGoalCurrency: string;
  selectedWalletKey: string | null;
  reset: UseFormReset<ContributionFormValues>;
  setValue: UseFormSetValue<ContributionFormValues>;
};

export function useContributionWallets({
  visible,
  userUid,
  normalizedGoalCurrency,
  selectedWalletKey,
  reset,
  setValue,
}: UseContributionWalletsParams) {
  const [wallets, setWallets] = useState<UserWalletRef[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);

  useEffect(() => {
    if (!visible || !userUid) return;

    reset({
      amount: "",
      reason: "",
      selectedWalletKey: null,
    });
    setWallets([]);
    setLoadingWallets(true);

    const userWalletRef = ref(db, `users/${userUid}/userwallet`);
    const unsubscribe = onValue(userWalletRef, async (snapshot) => {
      const data = snapshot.val() as Record<
        string,
        { name?: string; walletid?: number | string; id?: number | string }
      > | null;

      if (!data) {
        setWallets([]);
        setLoadingWallets(false);
        return;
      }

      const resolved: UserWalletRef[] = [];

      await Promise.all(
        Object.entries(data).map(async ([slotKey, link]) => {
          try {
            const walletId =
              Number.isFinite(Number(link?.walletid)) &&
              Number(link?.walletid) > 0
                ? Number(link.walletid)
                : Number.isFinite(Number(link?.id)) && Number(link?.id) > 0
                  ? Number(link.id)
                  : null;

            const walletKey = walletId ? `wallet${walletId}` : slotKey;
            const snap = await get(ref(db, `wallets/${walletKey}`));
            const walletData = snap.val();
            if (!walletData || walletData.type === "goal") return;

            const currancies: Record<string, number> =
              walletData.currancies || {};
            const currencies: Record<string, number> =
              walletData.currencies || {};

            const exactCurranciesKey = Object.keys(currancies).find(
              (key) => normalizeCurrencyCode(key) === normalizedGoalCurrency,
            );
            const exactCurrenciesKey = Object.keys(currencies).find(
              (key) => normalizeCurrencyCode(key) === normalizedGoalCurrency,
            );

            if (exactCurranciesKey !== undefined) {
              resolved.push({
                walletKey,
                name: link?.name || walletKey,
                balance: currancies[exactCurranciesKey] || 0,
                currencyKey: exactCurranciesKey,
                currencyContainer: "currancies",
              });
            } else if (exactCurrenciesKey !== undefined) {
              resolved.push({
                walletKey,
                name: link?.name || walletKey,
                balance: currencies[exactCurrenciesKey] || 0,
                currencyKey: exactCurrenciesKey,
                currencyContainer: "currencies",
              });
            }
          } catch {
            // Skip unreachable wallets.
          }
        }),
      );

      resolved.sort((a, b) => b.balance - a.balance);
      setWallets(resolved);
      if (resolved.length > 0) {
        const nextSelected =
          selectedWalletKey &&
          resolved.some((wallet) => wallet.walletKey === selectedWalletKey)
            ? selectedWalletKey
            : resolved[0].walletKey;
        setValue("selectedWalletKey", nextSelected);
      }
      setLoadingWallets(false);
    });

    return () => unsubscribe();
  }, [
    visible,
    userUid,
    normalizedGoalCurrency,
    reset,
    selectedWalletKey,
    setValue,
  ]);

  return { wallets, loadingWallets };
}

