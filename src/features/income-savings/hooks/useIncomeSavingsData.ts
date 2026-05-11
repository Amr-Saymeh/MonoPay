import { useEffect, useMemo } from "react";
import type { UseFormSetValue } from "react-hook-form";

import {
  monthlyEquivalent,
  normalizeCurrencyCode,
  type IncomeSourceFormValues,
  type SourceTypeFilter,
} from "../constants";
import {
  useCreateIncomeSourceMutation,
  useDeleteIncomeSourceMutation,
  useIncomeSourcesQuery,
  useUserWalletLinksQuery,
  useWalletsByIdsQuery,
} from "./useIncomeSavingsQueries";

export function useIncomeSavingsData(params: {
  userUid?: string;
  selectedWalletSlot: string | null;
  currency: string;
  selectedSourceTypeFilter: SourceTypeFilter;
  walletLabel: string;
  setValue: UseFormSetValue<IncomeSourceFormValues>;
}) {
  const {
    userUid,
    selectedWalletSlot,
    currency,
    selectedSourceTypeFilter,
    walletLabel,
    setValue,
  } = params;

  const links = useUserWalletLinksQuery(userUid).data;
  const sources = useIncomeSourcesQuery(userUid).data;
  const createMutation = useCreateIncomeSourceMutation(userUid);
  const deleteMutation = useDeleteIncomeSourceMutation(userUid);

  const walletIds = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(links)
            .map((wallet) => Number(wallet?.walletid))
            .filter((id) => Number.isFinite(id) && id > 0) as number[],
        ),
      ),
    [links],
  );
  const wallets = useWalletsByIdsQuery(walletIds).data;

  const walletOptions = useMemo(() => {
    return Object.entries(links)
      .map(([slotKey, link]) => {
        const walletid = Number(link?.walletid);
        if (!Number.isFinite(walletid) || walletid <= 0) return null;
        return {
          slotKey,
          walletid,
          walletKey: `wallet${walletid}`,
          name: link?.name?.trim() || `${walletLabel} ${walletid}`,
        };
      })
      .filter(Boolean) as {
      slotKey: string;
      walletid: number;
      walletKey: string;
      name: string;
    }[];
  }, [links, walletLabel]);

  const walletCurrenciesBySlot = useMemo(() => {
    const bySlot: Record<string, string[]> = {};
    for (const wallet of walletOptions) {
      const walletRecord = wallets[wallet.walletKey];
      const currencies = Array.from(
        new Set([
          ...Object.keys(walletRecord?.currancies ?? {}),
          ...Object.keys(walletRecord?.currencies ?? {}),
        ]),
      )
        .map((key) => normalizeCurrencyCode(key))
        .filter(Boolean);
      bySlot[wallet.slotKey] = currencies;
    }
    return bySlot;
  }, [walletOptions, wallets]);

  const selectedWalletCurrencies = useMemo(() => {
    if (!selectedWalletSlot) return [];
    return walletCurrenciesBySlot[selectedWalletSlot] ?? [];
  }, [selectedWalletSlot, walletCurrenciesBySlot]);

  useEffect(() => {
    if (selectedWalletCurrencies.length === 0) return;
    if (!selectedWalletCurrencies.includes(normalizeCurrencyCode(currency))) {
      setValue("currency", selectedWalletCurrencies[0]);
    }
  }, [selectedWalletCurrencies, currency, setValue]);

  const estimatedMonthlyTotal = useMemo(() => {
    return sources.reduce(
      (sum, source) =>
        sum + monthlyEquivalent(Number(source.amount || 0), source.regularity),
      0,
    );
  }, [sources]);

  const visibleSources = useMemo(() => {
    if (selectedSourceTypeFilter === "all") return sources;
    return sources.filter((source) => source.type === selectedSourceTypeFilter);
  }, [selectedSourceTypeFilter, sources]);

  return {
    sources,
    visibleSources,
    walletOptions,
    walletCurrenciesBySlot,
    selectedWalletCurrencies,
    estimatedMonthlyTotal,
    createMutation,
    deleteMutation,
  };
}
