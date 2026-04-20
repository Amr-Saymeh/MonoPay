import { useCallback, useEffect, useState } from 'react';
import { getLatestRates } from '../exchageServices/Currency';
import { normalizeCurrency } from '../utils/currency';

interface RatesData {
  rates: { [key: string]: number };
}

export function useExchangeRates(fromCurrency: string) {
  const [ratesData, setRatesData] = useState<RatesData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRates = useCallback(async (currency: string) => {
    if (!currency) return;
    setLoading(true);
    try {
      const latest = await getLatestRates(normalizeCurrency(currency));
      setRatesData(latest);
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      setRatesData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fromCurrency) {
      fetchRates(fromCurrency);
    }
  }, [fromCurrency, fetchRates]);

  const getRate = useCallback(
    (toCurrency: string): number | null => {
      if (!ratesData?.rates || !toCurrency) return null;
      const normalizedTo = normalizeCurrency(toCurrency);
      return ratesData.rates[normalizedTo] || null;
    },
    [ratesData]
  );

  return { ratesData, loading, getRate };
}
