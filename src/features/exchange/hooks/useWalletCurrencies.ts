import { onValue, ref } from 'firebase/database';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../../../../src/firebaseConfig';
import { denormalizeCurrency, normalizeCurrency } from '../utils/currency';

export interface CurrencyEntry {
  code: string;
  balance: number;
}

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'NIS', 'JOD', 'EGP'];

export function useWalletCurrencies(
  selectedWalletId: number | null,
  onFirstCurrencyLoaded?: (currency: string) => void
) {
  const [currencies, setCurrencies] = useState<CurrencyEntry[]>([]);
  const [hasNotifiedFirstCurrency, setHasNotifiedFirstCurrency] = useState(false);

  useEffect(() => {
    setHasNotifiedFirstCurrency(false);
  }, [selectedWalletId]);

  useEffect(() => {
    if (!selectedWalletId) {
      setCurrencies([]);
      return;
    }

    const unsubscribe = onValue(
      ref(db, `wallets/wallet${selectedWalletId}/currancies`),
      (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const list: CurrencyEntry[] = Object.entries(data)
            .filter(([k, v]) => k && Number.isFinite(Number(v)))
            .map(([code, balance]: [string, any]) => ({
              code: denormalizeCurrency(code.trim().toUpperCase()),
              balance: Number(balance) || 0,
            }))
            .sort((a, b) => a.code.localeCompare(b.code));

          setCurrencies(list);

          if (onFirstCurrencyLoaded && !hasNotifiedFirstCurrency) {
            const supported = list.filter((c) =>
              SUPPORTED_CURRENCIES.includes(normalizeCurrency(c.code))
            );
            if (supported.length > 0) {
              setHasNotifiedFirstCurrency(true);
              onFirstCurrencyLoaded(supported[0].code);
            }
          }
        } else {
          setCurrencies([]);
        }
      },
      () => {
        setCurrencies([]);
      }
    );

    return () => unsubscribe();
  }, [selectedWalletId, onFirstCurrencyLoaded, hasNotifiedFirstCurrency]);

  const getBalance = useCallback(
    (code: string): number => {
      const entry = currencies.find(
        (c) => normalizeCurrency(c.code) === normalizeCurrency(code)
      );
      return entry?.balance || 0;
    },
    [currencies]
  );

  const nonZeroCurrencies = useMemo(
    () => currencies.filter((c) => c.balance > 0),
    [currencies]
  );

  return { currencies, nonZeroCurrencies, getBalance };
}
