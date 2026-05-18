import { useEffect, useMemo, useState } from "react";

import { onValue, ref } from "firebase/database";

import { db } from "@/src/firebaseConfig";
import { subscribeIncomeSources } from "@/src/services/incomeSources.service";

import {
  belongsToUserPurchase,
  Entry,
  normalizeCategory,
  normalizeCurrency,
  parseTimestamp,
  SupportedLanguage,
} from "../utils/insights";

type LoadedSources = {
  tx: boolean;
  income: boolean;
  purchases: boolean;
};

const INITIAL_LOADED_SOURCES: LoadedSources = {
  tx: false,
  income: false,
  purchases: false,
};

function mapTransactionEntries(
  data: Record<string, any>,
  language: SupportedLanguage,
) {
  return Object.entries(data)
    .map(([id, raw]) => {
      const cat = normalizeCategory(raw?.category, language);
      return {
        id,
        source: "transaction" as const,
        amount: Number(raw?.amount ?? 0),
        currency: normalizeCurrency(raw?.currency ?? raw?.currancy),
        type: raw?.type === "receive" ? "receive" : "send",
        title: String(raw?.goalTitle ?? raw?.title ?? cat.label),
        note: String(raw?.notes ?? raw?.note ?? ""),
        categoryKey: cat.key,
        categoryLabel: cat.label,
        color: cat.color,
        icon: cat.icon,
        timestamp: parseTimestamp(raw),
      } satisfies Entry;
    })
    .filter((item) => item.amount > 0 && item.timestamp > 0);
}

function mapIncomeEntries(sources: any[], language: SupportedLanguage) {
  return sources
    .map((raw) => {
      const cat = normalizeCategory(raw?.type, language);
      return {
        id: raw.id,
        source: "income" as const,
        amount: Number(raw?.amount ?? 0),
        currency: normalizeCurrency(raw?.currency),
        type: "receive" as const,
        title: String(cat.label),
        note: String(raw?.notes ?? raw?.walletName ?? ""),
        categoryKey: cat.key,
        categoryLabel: cat.label,
        color: cat.color,
        icon: cat.icon,
        timestamp: parseTimestamp(raw),
      } satisfies Entry;
    })
    .filter((item) => item.amount > 0 && item.timestamp > 0);
}

function mapPurchaseEntries(
  data: Record<string, any>,
  uid: string,
  language: SupportedLanguage,
) {
  return Object.entries(data)
    .filter(([, raw]) => belongsToUserPurchase(raw, uid))
    .map(([id, raw]) => {
      const cat = normalizeCategory(raw?.category, language);
      return {
        id,
        source: "purchase" as const,
        amount: Number(raw?.amount ?? raw?.price ?? 0),
        currency: normalizeCurrency(raw?.currency ?? raw?.currancy),
        type: raw?.receiverUid === uid ? "receive" : "send",
        title: String(raw?.title ?? raw?.name ?? cat.label),
        note: String(raw?.notes ?? raw?.note ?? ""),
        categoryKey: cat.key,
        categoryLabel: cat.label,
        color: cat.color,
        icon: cat.icon,
        timestamp: parseTimestamp(raw),
      } satisfies Entry;
    })
    .filter((item) => item.amount > 0 && item.timestamp > 0);
}

export function useInsightEntries(uid: string | undefined, language: SupportedLanguage) {
  const [txEntries, setTxEntries] = useState<Entry[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<Entry[]>([]);
  const [purchaseEntries, setPurchaseEntries] = useState<Entry[]>([]);
  const [loadedSources, setLoadedSources] = useState<LoadedSources>(INITIAL_LOADED_SOURCES);

  useEffect(() => {
    if (!uid) {
      setTxEntries([]);
      setIncomeEntries([]);
      setPurchaseEntries([]);
      setLoadedSources({ tx: true, income: true, purchases: true });
      return;
    }

    setLoadedSources(INITIAL_LOADED_SOURCES);

    const txRef = ref(db, `users/${uid}/transaction history`);
    const purchasesRef = ref(db, "purchases");

    const offTx = onValue(
      txRef,
      (snapshot) => {
        const data = (snapshot.val() ?? {}) as Record<string, any>;
        setTxEntries(mapTransactionEntries(data, language));
        setLoadedSources((current) => ({ ...current, tx: true }));
      },
      () => {
        setTxEntries([]);
        setLoadedSources((current) => ({ ...current, tx: true }));
      },
    );

    const offIncome = subscribeIncomeSources(uid, (sources) => {
      setIncomeEntries(mapIncomeEntries(sources, language));
      setLoadedSources((current) => ({ ...current, income: true }));
    });

    const offPurchases = onValue(
      purchasesRef,
      (snapshot) => {
        const data = (snapshot.val() ?? {}) as Record<string, any>;
        setPurchaseEntries(mapPurchaseEntries(data, uid, language));
        setLoadedSources((current) => ({ ...current, purchases: true }));
      },
      () => {
        setPurchaseEntries([]);
        setLoadedSources((current) => ({ ...current, purchases: true }));
      },
    );

    return () => {
      offTx();
      offIncome();
      offPurchases();
    };
  }, [language, uid]);

  const entries = useMemo(
    () => [...txEntries, ...incomeEntries, ...purchaseEntries],
    [incomeEntries, purchaseEntries, txEntries],
  );

  const loaded = loadedSources.tx && loadedSources.income && loadedSources.purchases;

  return {
    entries,
    loaded,
  };
}