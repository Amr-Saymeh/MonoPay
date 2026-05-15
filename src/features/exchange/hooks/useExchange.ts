import { useCallback, useEffect, useMemo, useState } from 'react';
import { exchangeWalletCurrencies } from '../services/currencyExchangeService';
import {
    SUPPORTED_CURRENCIES,
    getAvailableToCurrencies,
    normalizeCurrency
} from '../utils/currency';
import { useExchangeRatesQuery } from './useExchangeRatesQuery';
import { useWalletCurrencies } from './useWalletCurrencies';
import { useWallets } from './useWallets';

export function useExchange(userId?: string) {
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showFromCurrencyModal, setShowFromCurrencyModal] = useState(false);
  const [showToCurrencyModal, setShowToCurrencyModal] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  const { wallets, loading: walletsLoading } = useWallets(userId);
  const { currencies, getBalance } = useWalletCurrencies(selectedWalletId);
  const { getRate, loading: ratesLoading } = useExchangeRatesQuery(fromCurrency);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.walletid === selectedWalletId) ?? null,
    [wallets, selectedWalletId]
  );

  useEffect(() => {
    if (!selectedWalletId && wallets.length > 0) {
      setSelectedWalletId(wallets[0].walletid);
    }
  }, [wallets, selectedWalletId]);

  useEffect(() => {
    if (normalizeCurrency(fromCurrency) === normalizeCurrency(toCurrency)) {
      setToCurrency(getAvailableToCurrencies(fromCurrency)[0] ?? toCurrency);
    }
  }, [fromCurrency, toCurrency]);

  const parsedAmount = useMemo(() => {
    if (!amount) return null;
    const value = parseFloat(amount.replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  }, [amount]);

  const currentRate = useMemo(() => getRate(toCurrency), [getRate, toCurrency]);

  const convertedAmount = useMemo(() => {
    if (!currentRate || parsedAmount === null) return null;
    return (parsedAmount * currentRate).toFixed(2);
  }, [currentRate, parsedAmount]);

  const normalizedFromCurrency = useMemo(
    () => normalizeCurrency(fromCurrency),
    [fromCurrency]
  );

  const normalizedToCurrency = useMemo(
    () => normalizeCurrency(toCurrency),
    [toCurrency]
  );

  const fromBalance = useMemo(
    () => getBalance(fromCurrency),
    [getBalance, fromCurrency]
  );

  const toBalance = useMemo(
    () => getBalance(toCurrency),
    [getBalance, toCurrency]
  );

  const toCurrencies = useMemo(
    () => getAvailableToCurrencies(fromCurrency),
    [fromCurrency]
  );

  const isAmountValid = useMemo(
    () => parsedAmount !== null && parsedAmount > 0,
    [parsedAmount]
  );

  const isLoading = walletsLoading;
  const isRatesLoading = ratesLoading;

  const resetStatus = useCallback(() => {
    setExchangeError(null);
    setExchangeSuccess(false);
  }, []);

  const handleWalletSelect = useCallback((walletId: number) => {
    setSelectedWalletId(walletId);
    setShowWalletModal(false);
    resetStatus();
  }, [resetStatus]);

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(value);
      resetStatus();
    },
    [resetStatus]
  );

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount((prevAmount) => convertedAmount ?? prevAmount);
    resetStatus();
  }, [convertedAmount, fromCurrency, resetStatus, toCurrency]);

  const handleMax = useCallback(() => {
    const balance = getBalance(fromCurrency);
    setAmount(balance.toFixed(2));
    resetStatus();
  }, [fromCurrency, getBalance, resetStatus]);

  const handleExchange = useCallback(async () => {
    if (!userId || !selectedWalletId) {
      return;
    }

    if (parsedAmount === null) {
      setExchangeError('Enter a valid amount');
      return;
    }

    const result = await exchangeWalletCurrencies({
      selectedWalletId,
      fromCurrency,
      toCurrency,
      amount: parsedAmount,
      fromBalance,
      rate: currentRate,
    });

    if (!result.success) {
      setExchangeError(result.error ?? 'Failed to perform exchange');
      return;
    }

    setExchangeSuccess(true);
    setExchangeError(null);
    setAmount('');

    setTimeout(() => {
      setExchangeSuccess(false);
    }, 2000);
  }, [currentRate, fromBalance, fromCurrency, parsedAmount, selectedWalletId, toCurrency, userId]);

  const closeFromCurrencyModal = useCallback(() => {
    setShowFromCurrencyModal(false);
  }, []);

  const closeToCurrencyModal = useCallback(() => {
    setShowToCurrencyModal(false);
  }, []);

  const updateFromCurrency = useCallback(
    (currency: string) => {
      setFromCurrency(normalizeCurrency(currency));
      setShowFromCurrencyModal(false);
      resetStatus();
    },
    [resetStatus]
  );

  const updateToCurrency = useCallback(
    (currency: string) => {
      setToCurrency(normalizeCurrency(currency));
      setShowToCurrencyModal(false);
      resetStatus();
    },
    [resetStatus]
  );

  return {
    currencies,
    currentRate,
    convertedAmount,
    exchangeError,
    exchangeSuccess,
    fromBalance,
    fromCurrency,
    fromCurrencyNormalized: normalizedFromCurrency,
    isAmountValid,
    isLoading,
    selectedWallet,
    selectedWalletId,
    showFromCurrencyModal,
    showToCurrencyModal,
    showWalletModal,
    toBalance,
    toCurrencies,
    toCurrency,
    toCurrencyNormalized: normalizedToCurrency,
    wallets,
    amount,
    setShowWalletModal,
    handleAmountChange,
    handleExchange,
    handleMax,
    handleSwap,
    handleWalletSelect,
    closeFromCurrencyModal,
    closeToCurrencyModal,
    updateFromCurrency,
    updateToCurrency,
    setShowFromCurrencyModal,
    setShowToCurrencyModal,
    isRatesLoading,
    availableCurrencies: SUPPORTED_CURRENCIES,
  };
}
