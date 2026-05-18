import { useMemo } from "react";

import {
  buildBreakdown,
  buildTrend,
  buildWeekday,
  Entry,
  FlowFilter,
  getEntryAggregateAmount,
  getHealthScore,
  mapSelectedCategoryOptions,
  SortMode,
  startWindow,
  SupportedLanguage,
  TimeWindow,
} from "../utils/insights";

type UseInsightCalculationsParams = {
  entries: Entry[];
  nisRates: Record<string, number>;
  category: string;
  currency: string;
  flow: FlowFilter;
  language: SupportedLanguage;
  selectedCategories?: readonly string[];
  sortMode: SortMode;
  timeWindow: TimeWindow;
};

export function useInsightCalculations({
  entries,
  nisRates,
  category,
  currency,
  flow,
  language,
  selectedCategories,
  sortMode,
  timeWindow,
}: UseInsightCalculationsParams) {
  const selectedCategoryOptions = useMemo(
    () => mapSelectedCategoryOptions(selectedCategories ?? [], language),
    [language, selectedCategories],
  );

  const categories = useMemo(() => {
    const map = new Map<string, { key: string; label: string; color: string }>();

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

  const windowStart = useMemo(() => startWindow(timeWindow), [timeWindow]);

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

  const shouldNormalizeToNis = currency === "ALL";

  const aggregatedFiltered = useMemo(
    () =>
      filtered.map((item) => {
        if (!shouldNormalizeToNis) {
          return { ...item, aggregateAmount: item.amount };
        }

        const rate = nisRates[item.currency];
        const aggregateAmount = Number.isFinite(rate) && rate > 0 ? item.amount * rate : item.amount;

        return {
          ...item,
          aggregateAmount,
        } satisfies Entry;
      }),
    [filtered, nisRates, shouldNormalizeToNis],
  );

  const spend = useMemo(
    () => aggregatedFiltered.filter((item) => item.type === "send"),
    [aggregatedFiltered],
  );
  const income = useMemo(
    () => aggregatedFiltered.filter((item) => item.type === "receive"),
    [aggregatedFiltered],
  );

  const spendTotal = useMemo(
    () => spend.reduce((sum, item) => sum + getEntryAggregateAmount(item), 0),
    [spend],
  );
  const incomeTotal = useMemo(
    () => income.reduce((sum, item) => sum + getEntryAggregateAmount(item), 0),
    [income],
  );
  const net = incomeTotal - spendTotal;
  const avg = filtered.length
    ? aggregatedFiltered.reduce((sum, item) => sum + getEntryAggregateAmount(item), 0) / filtered.length
    : 0;

  const breakdown = useMemo(
    () => buildBreakdown(flow === "receive" ? income : spend),
    [flow, income, spend],
  );
  const top = breakdown[0];
  const categoryBaseTotal = flow === "receive" ? incomeTotal : spendTotal;

  const highlights = useMemo(
    () =>
      [...aggregatedFiltered]
        .sort((a, b) =>
          sortMode === "largest"
            ? getEntryAggregateAmount(b) - getEntryAggregateAmount(a)
            : b.timestamp - a.timestamp,
        )
        .slice(0, 6),
    [aggregatedFiltered, sortMode],
  );

  const largestEntry = useMemo(
    () =>
      [...aggregatedFiltered].sort(
        (a, b) => getEntryAggregateAmount(b) - getEntryAggregateAmount(a),
      )[0] ?? null,
    [aggregatedFiltered],
  );

  const weekday = useMemo(() => buildWeekday(aggregatedFiltered), [aggregatedFiltered]);
  const busiestDay = useMemo(
    () => [...weekday].sort((a, b) => b.count - a.count)[0] ?? weekday[0],
    [weekday],
  );
  const maxWeekdayValue = useMemo(
    () => Math.max(1, ...weekday.map((day) => Math.max(day.spend, day.income))),
    [weekday],
  );

  const trend = useMemo(
    () => buildTrend(aggregatedFiltered, timeWindow, language, windowStart),
    [aggregatedFiltered, language, timeWindow, windowStart],
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
    filtered,
    health,
    highlights,
    incomeTotal,
    largestEntry,
    maxTrend,
    maxWeekdayValue,
    net,
    spendTotal,
    top,
    trend,
    weekday,
  };
}