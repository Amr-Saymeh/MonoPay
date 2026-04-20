import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE, CACHE_TTL_MS, FALLBACK_RATES } from '../constants';
import { Currency, Rates } from '../types';

export function useCurrencyRates() {
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES as Rates);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchRates = useCallback(async (force = false) => {
    setLoading(true);
    setHasError(false);
    try {
      if (!force) {
        const ts = await AsyncStorage.getItem(STORAGE.ratesTs);
        const cache = await AsyncStorage.getItem(STORAGE.rates);
        if (ts && cache && Date.now() - parseInt(ts) < CACHE_TTL_MS) {
          setRates(JSON.parse(cache));
          setLoading(false);
          return;
        }
      }

      const res = await fetch('https://open.er-api.com/v6/latest/ILS');
      const json = await res.json();

      if (json.result !== 'success') throw new Error('API error');

      const newRates: Rates = {
        NIS: 1,
        USD: 1 / json.rates['USD'],
        JOD: 1 / json.rates['JOD'],
      };

      await AsyncStorage.setItem(STORAGE.rates, JSON.stringify(newRates));
      await AsyncStorage.setItem(STORAGE.ratesTs, Date.now().toString());
      setRates(newRates);
    } catch {
      const cache = await AsyncStorage.getItem(STORAGE.rates);
      if (cache) setRates(JSON.parse(cache));
      else setHasError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const toNIS = useCallback(
    (amount: number, currency: Currency) => amount * (rates[currency] || FALLBACK_RATES[currency]),
    [rates],
  );

  const fromNIS = useCallback(
    (amountNIS: number, currency: Currency) => {
      const rate = rates[currency] || FALLBACK_RATES[currency];
      return currency === 'NIS' ? amountNIS : amountNIS / rate;
    },
    [rates],
  );

  return { rates, loading, hasError, toNIS, fromNIS, refresh: () => fetchRates(true) };
}
