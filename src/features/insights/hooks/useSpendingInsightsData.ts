import { useEffect, useMemo, useState } from "react";

import { onValue, ref } from "firebase/database";

import { db } from "@/src/firebaseConfig";

import {
    belongsToUserPurchase,
    buildBreakdown,
    buildTrend,
    buildWeekday,
    Entry,
    FlowFilter,
    getHealthScore,
    mapSelectedCategoryOptions,
    normalizeCategory,
    normalizeCurrency,
    parseTimestamp,
    SortMode,
    startWindow,
    SupportedLanguage,
    TimeWindow,
} from "../utils/insights";

type Params = {
  category: string;
  currency: string;
  flow: FlowFilter;
  language: SupportedLanguage;
  selectedCategories?: readonly string[];
  sortMode: SortMode;
  uid?: string;
  window: TimeWindow;
};

export function useSpendingInsightsData({
  category,
  currency,
  flow,
  language,
  selectedCategories,
  sortMode,
  uid,
  window,
}: Params) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!uid) {
      setEntries([]);
      setLoaded(true);
      return;
    }

    const txRef = ref(db, `users/${uid}/transaction history`);
    const purchasesRef = ref(db, "purchases");

    const offTx = onValue(
      txRef,
      (snapshot) => {
        const data = (snapshot.val() ?? {}) as Record<string, any>;
        const txEntries = Object.entries(data)
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

        setEntries((prev) => [
          ...prev.filter((item) => item.source === "purchase"),
          ...txEntries,
        ]);
        setLoaded(true);
      },
      () => setLoaded(true),
    );

    const offPurchases = onValue(
      purchasesRef,
      (snapshot) => {
        const data = (snapshot.val() ?? {}) as Record<string, any>;
        const purchaseEntries = Object.entries(data)
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

        setEntries((prev) => [
          ...prev.filter((item) => item.source === "transaction"),
          ...purchaseEntries,
        ]);
        setLoaded(true);
      },
      () => setLoaded(true),
    );

    return () => {
      offTx();
      offPurchases();
    };
  }, [language, uid]);

  const currencies = useMemo(
    () => [...new Set(entries.map((item) => item.currency))],
    [entries],
  );

  const selectedCategoryOptions = useMemo(
    () => mapSelectedCategoryOptions(selectedCategories ?? [], language),
    [language, selectedCategories],
  );

  const categories = useMemo(() => {
    const map = new Map<
      string,
      { key: string; label: string; color: string }
    >();

    selectedCategoryOptions.forEach((item) => {
      map.set(item.key, item);
    });

    entries.forEach((item) => {
      if (!map.has(item.categoryKey)) {
        map.set(item.categoryKey, {
          key: item.categoryKey,
          label: item.categoryLabel,
          color: item.color,
        });
      }
    });

    return [...map.values()];
  }, [entries, selectedCategoryOptions]);

  const windowStart = useMemo(() => startWindow(window), [window]);

  const filtered = useMemo(
    () =>
      entries
        .filter(
          (item) =>
            (!windowStart || item.timestamp >= windowStart) &&
            (flow === "all" || item.type === flow) &&
            (currency === "ALL" || item.currency === currency) &&
            (category === "ALL" || item.categoryKey === category),
        )
        .sort((a, b) => b.timestamp - a.timestamp),
    [category, currency, entries, flow, windowStart],
  );

  const spend = useMemo(
    () => filtered.filter((item) => item.type === "send"),
    [filtered],
  );
  const income = useMemo(
    () => filtered.filter((item) => item.type === "receive"),
    [filtered],
  );

  const spendTotal = useMemo(
    () => spend.reduce((sum, item) => sum + item.amount, 0),
    [spend],
  );
  const incomeTotal = useMemo(
    () => income.reduce((sum, item) => sum + item.amount, 0),
    [income],
  );
  const net = incomeTotal - spendTotal;
  const avg = filtered.length
    ? filtered.reduce((sum, item) => sum + item.amount, 0) / filtered.length
    : 0;

  const breakdown = useMemo(
    () => buildBreakdown(flow === "receive" ? income : spend),
    [flow, income, spend],
  );
  const top = breakdown[0];
  const categoryBaseTotal = flow === "receive" ? incomeTotal : spendTotal;

  const highlights = useMemo(
    () =>
      [...filtered]
        .sort((a, b) =>
          sortMode === "largest"
            ? b.amount - a.amount
            : b.timestamp - a.timestamp,
        )
        .slice(0, 6),
    [filtered, sortMode],
  );

  const largestEntry = useMemo(
    () => [...filtered].sort((a, b) => b.amount - a.amount)[0] ?? null,
    [filtered],
  );

  const weekday = useMemo(() => buildWeekday(filtered), [filtered]);
  const busiestDay = useMemo(
    () => [...weekday].sort((a, b) => b.count - a.count)[0] ?? weekday[0],
    [weekday],
  );
  const maxWeekdayValue = useMemo(
    () => Math.max(1, ...weekday.map((day) => Math.max(day.spend, day.income))),
    [weekday],
  );

  const trend = useMemo(
    () => buildTrend(filtered, window, language, windowStart),
    [filtered, language, window, windowStart],
  );
  const maxTrend = useMemo(
    () => Math.max(1, ...trend.flatMap((item) => [item.spend, item.income])),
    [trend],
  );

  const health = useMemo(
    () =>
      getHealthScore({
        incomeTotal,
        net,
        topCategoryAmount: top?.amount ?? 0,
        spendTotal,
        activityCount: filtered.length,
      }),
    [filtered.length, incomeTotal, net, spendTotal, top?.amount],
  );

  return {
    avg,
    breakdown,
    busiestDay,
    categories,
    categoryBaseTotal,
    currencies,
    entries,
    filtered,
    health,
    highlights,
    incomeTotal,
    largestEntry,
    loaded,
    maxTrend,
    maxWeekdayValue,
    net,
    spendTotal,
    top,
    trend,
    weekday,
  };
}
