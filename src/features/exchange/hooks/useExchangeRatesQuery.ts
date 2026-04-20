import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getLatestRates } from '../exchageServices/Currency';
import { normalizeCurrency } from '../utils/currency';

interface RatesData {
  rates: { [key: string]: number };
}

export function useExchangeRatesQuery(fromCurrency: string) {
  const normalizedCurrency = useMemo(
    () => normalizeCurrency(fromCurrency),
    [fromCurrency]
  );

  const {
    data: ratesData,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<RatesData | null>({
    queryKey: ['exchangeRates', normalizedCurrency],
    queryFn: async () => {
      if (!normalizedCurrency) return null;
      const result = await getLatestRates(normalizedCurrency);
      return result as RatesData | null;
    },
    enabled: !!normalizedCurrency,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
  });

  const getRate = useCallback(
    (toCurrency: string): number | null => {
      if (!ratesData?.rates || !toCurrency) return null;
      const normalizedTo = normalizeCurrency(toCurrency);
      return ratesData.rates[normalizedTo] || null;
    },
    [ratesData]
  );

  return { ratesData, loading, error, getRate, refetch };
}
