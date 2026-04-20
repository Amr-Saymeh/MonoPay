import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, onValue, DataSnapshot } from 'firebase/database';
import { db } from '@/src/firebaseConfig';
import { STORAGE, CURRENCIES, CURRENCY_SYMBOL } from '../constants';
import { Currency } from '../types';
import { useCurrencyRates } from './useCurrencyRates';

export function useDailyTotal() {
  const { rates, loading: ratesLoading, hasError: ratesError, toNIS, fromNIS, refresh } = useCurrencyRates();

  const [purchasesTotalNIS, setPurchasesTotalNIS] = useState(0);
  const [bundlesTotalNIS, setBundlesTotalNIS] = useState(0);
  const totalSpentNIS = purchasesTotalNIS + bundlesTotalNIS;
  const [dailyBudgetNIS, setDailyBudgetNIS] = useState(250);
  const [dataLoading, setDataLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('NIS');

  useEffect(() => {
    (async () => {
      const [budget, currency] = await Promise.all([
        AsyncStorage.getItem(STORAGE.budget),
        AsyncStorage.getItem(STORAGE.currency),
      ]);
      if (budget) setDailyBudgetNIS(parseFloat(budget));
      if (currency) setDisplayCurrency(currency as Currency);
    })();
  }, []);

  useEffect(() => {
    const purchasesRef = ref(db, 'purchases');
    const bundlesRef = ref(db, 'Bundles');

    const unsubPurchases = onValue(purchasesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setPurchasesTotalNIS(0);
        setDataLoading(false);
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      let totalNIS = 0;
      snapshot.forEach((child: DataSnapshot) => {
        const item = child.val();
        const itemDate = item.createdAt?.split('T')[0];
        if (itemDate === today) {
          const currency = (item.currency as Currency) ?? 'NIS';
          totalNIS += toNIS(item.amount ?? 0, currency);
        }
      });
      setPurchasesTotalNIS(totalNIS);
      setDataLoading(false);
    });

    const unsubBundles = onValue(bundlesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setBundlesTotalNIS(0);
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      let totalNIS = 0;
      snapshot.forEach((child: DataSnapshot) => {
        const bundle = child.val();
        const bundleDate = bundle.createdAt?.split('T')[0];
        if (bundleDate === today) {
          const currency = (bundle.currency as Currency) ?? 'NIS';
          totalNIS += toNIS(bundle.totalPrice ?? 0, currency);
        }
      });
      setBundlesTotalNIS(totalNIS);
    });

    return () => {
      unsubPurchases();
      unsubBundles();
    };
  }, [toNIS]);

  const saveBudget = async (amountNIS: number) => {
    await AsyncStorage.setItem(STORAGE.budget, amountNIS.toString());
    setDailyBudgetNIS(amountNIS);
  };

  const cycleCurrency = async () => {
    const nextIndex = (CURRENCIES.indexOf(displayCurrency) + 1) % CURRENCIES.length;
    const next = CURRENCIES[nextIndex];
    setDisplayCurrency(next);
    await AsyncStorage.setItem(STORAGE.currency, next);
  };

  return {
    totalSpentNIS,
    dailyBudgetNIS,
    displayCurrency,
    dataLoading,
    ratesLoading,
    ratesError,
    rates,
    fromNIS,
    toNIS,
    refreshRates: refresh,
    saveBudget,
    cycleCurrency,
    symbol: CURRENCY_SYMBOL[displayCurrency],
  };
}
