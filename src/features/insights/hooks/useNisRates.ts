import { useEffect, useMemo, useState } from "react";

import { getLatestRates } from "@/src/features/exchange/exchageServices/Currency";

import { Entry } from "../utils/insights";

const BASE_NIS_RATES: Record<string, number> = {
  NIS: 1,
  ILS: 1,
};

export function useNisRates(entries: Entry[]) {
  const [nisRates, setNisRates] = useState<Record<string, number>>(BASE_NIS_RATES);
  const [conversionLoaded, setConversionLoaded] = useState(true);

  const currencies = useMemo(
    () => [...new Set(entries.map((item) => item.currency))],
    [entries],
  );

  const convertibleCurrencies = useMemo(
    () => currencies.filter((item) => item !== "NIS" && item !== "ILS"),
    [currencies],
  );

  useEffect(() => {
    if (!convertibleCurrencies.length) {
      setNisRates(BASE_NIS_RATES);
      setConversionLoaded(true);
      return;
    }

    let cancelled = false;
    setConversionLoaded(false);

    void (async () => {
      const results = await Promise.allSettled(
        convertibleCurrencies.map(async (entryCurrency) => {
          const rates = await getLatestRates(entryCurrency);
          const rateToNis = Number(rates?.rates?.NIS);

          return {
            entryCurrency,
            rateToNis: Number.isFinite(rateToNis) && rateToNis > 0 ? rateToNis : null,
          };
        }),
      );

      if (cancelled) {
        return;
      }

      const nextRates = results.reduce<Record<string, number>>((acc, result) => {
        if (result.status === "fulfilled" && result.value.rateToNis) {
          acc[result.value.entryCurrency] = result.value.rateToNis;
        }
        return acc;
      }, { ...BASE_NIS_RATES });

      setNisRates(nextRates);
      setConversionLoaded(true);
    })().catch(() => {
      if (!cancelled) {
        setConversionLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [convertibleCurrencies]);

  return {
    conversionLoaded,
    currencies,
    nisRates,
  };
}