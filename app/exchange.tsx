import { SharedCard } from '@/src/features/card/SharedCard';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { get, ref, set } from 'firebase/database';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  CurrencySelectorModal,
  ExchangeCard,
  RateInfo,
  StatusMessage,
  WalletSelectorModal,
} from '../src/features/exchange/components';
import { useExchangeRatesQuery, useWalletCurrencies, useWallets } from '../src/features/exchange/hooks';
import {
  denormalizeCurrency,
  getAvailableToCurrencies,
  normalizeCurrency,
} from '../src/features/exchange/utils';
import { db } from '../src/firebaseConfig';
import { useAuth } from '../src/providers/AuthProvider';


const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'NIS', 'JOD', 'EGP'];

const Exchange: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showFromCurrencyModal, setShowFromCurrencyModal] = useState(false);
  const [showToCurrencyModal, setShowToCurrencyModal] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  const { wallets, loading: walletsLoading } = useWallets(user?.uid);
  const { currencies, getBalance } = useWalletCurrencies(selectedWalletId);
  const { getRate, loading: ratesLoading } = useExchangeRatesQuery(fromCurrency);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.walletid === selectedWalletId) ?? null,
    [wallets, selectedWalletId]
  );

  const parsedAmount = useMemo(() => {
    if (!amount) return null;
    const value = parseFloat(amount.replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  }, [amount]);

  const isAmountValid = useMemo(
    () => parsedAmount !== null && parsedAmount > 0,
    [parsedAmount]
  );

  const currentRate = useMemo(() => getRate(toCurrency), [getRate, toCurrency]);

  const convertedAmount = useMemo(() => {
    if (!currentRate || parsedAmount === null) return null;
    return (parsedAmount * currentRate).toFixed(2);
  }, [currentRate, parsedAmount]);

  const toCurrencies = useMemo(
    () => getAvailableToCurrencies(fromCurrency),
    [fromCurrency]
  );

  const isLoading = walletsLoading || ratesLoading;

  useEffect(() => {
    if (!selectedWalletId && wallets.length > 0) {
      setSelectedWalletId(wallets[0].walletid);
    }
  }, [wallets, selectedWalletId]);

  const handleWalletSelect = useCallback((walletId: number) => {
    setSelectedWalletId(walletId);
    setShowWalletModal(false);
  }, []);

  const handleAmountChange = useCallback((value: string) => {
    setAmount(value);
    setExchangeError(null);
    setExchangeSuccess(false);
  }, []);

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount('');
    setExchangeError(null);
    setExchangeSuccess(false);
  }, [fromCurrency, toCurrency]);

  const handleMax = useCallback(() => {
    const balance = getBalance(fromCurrency);
    setAmount(balance.toFixed(2));
    setExchangeError(null);
    setExchangeSuccess(false);
  }, [fromCurrency, getBalance]);

  const handleExchange = useCallback(async () => {
    if (!user || !selectedWalletId || !fromCurrency || !toCurrency) return;

    if (parsedAmount === null || parsedAmount <= 0) {
      setExchangeError('Enter a valid amount');
      return;
    }

    const fromBalance = getBalance(fromCurrency);
    if (parsedAmount > fromBalance) {
      setExchangeError('Insufficient balance');
      return;
    }

    const rate = currentRate || 0;
    const converted = parsedAmount * rate;

    const fromKey = denormalizeCurrency(fromCurrency.trim().toUpperCase());
    const toKey = denormalizeCurrency(toCurrency.trim().toUpperCase());

    try {
      const walletRef = ref(db, `wallets/wallet${selectedWalletId}/currancies`);
      const snapshot = await get(walletRef);
      const raw = (snapshot.val() ?? {}) as Record<string, number>;

      const merged: Record<string, number> = {};
      for (const [rawCode, rawAmount] of Object.entries(raw)) {
        const normalizedKey = denormalizeCurrency(rawCode.trim().toUpperCase());
        const value = Number(rawAmount);

        if (!Number.isFinite(value)) continue;

        const previousValue = Number(merged[normalizedKey] ?? 0);
        merged[normalizedKey] = (Number.isFinite(previousValue) ? previousValue : 0) + value;
      }

      const toBalance = Number(merged[toKey] ?? 0);
      if (!Number.isFinite(toBalance)) {
        setExchangeError('Target currency not available in wallet');
        return;
      }

      merged[fromKey] = Number((fromBalance - parsedAmount).toFixed(2));
      merged[toKey] = Number((toBalance + converted).toFixed(2));

      await set(walletRef, merged);

      setExchangeSuccess(true);
      setExchangeError(null);
      setAmount('');

      setTimeout(() => {
        setExchangeSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Exchange failed', error);
      setExchangeError(error instanceof Error ? error.message : 'Failed to perform exchange');
    }
  }, [
    currentRate,
    fromCurrency,
    getBalance,
    parsedAmount,
    selectedWalletId,
    toCurrency,
    user,
  ]);

  if (walletsLoading || !selectedWallet) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </ThemedView>
    );
  }




  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={[styles.homeButton, { backgroundColor: surfaceColor }]}>
            <FontAwesome name="arrow-left" size={20} color="#6366f1" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Exchange</ThemedText>
        </View>
        <TouchableOpacity onPress={() => setShowWalletModal(true)} style={[styles.walletButton, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.walletEmoji}>{selectedWallet.emoji || '💳'}</ThemedText>
          <ThemedText style={styles.walletName} numberOfLines={1}>
            {selectedWallet.name}
          </ThemedText>
          <FontAwesome name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 16 }}>
          <SharedCard
            name={selectedWallet.name}
            emoji={selectedWallet.emoji}
            currencies={currencies}
          />
        </View>

        <ExchangeCard
          fromCurrency={normalizeCurrency(fromCurrency)}
          toCurrency={normalizeCurrency(toCurrency)}
          amount={amount}
          convertedAmount={convertedAmount}
          fromBalance={getBalance(fromCurrency)}
          toBalance={getBalance(toCurrency)}
          onAmountChange={handleAmountChange}
          onFromCurrencyPress={() => setShowFromCurrencyModal(true)}
          onToCurrencyPress={() => setShowToCurrencyModal(true)}
          onSwap={handleSwap}
          onMax={handleMax}
        />

        <RateInfo
          fromCurrency={normalizeCurrency(fromCurrency)}
          toCurrency={normalizeCurrency(toCurrency)}
          rate={currentRate}
        />

        <StatusMessage error={exchangeError} success={exchangeSuccess} />

        <TouchableOpacity
          style={[styles.exchangeButton, (!isAmountValid || isLoading) && styles.exchangeButtonDisabled]}
          onPress={handleExchange}
          disabled={!isAmountValid || isLoading}
        >
          <ThemedText style={styles.exchangeButtonText}>Exchange</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <WalletSelectorModal
        visible={showWalletModal}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onSelect={handleWalletSelect}
        onClose={() => setShowWalletModal(false)}
      />

      <CurrencySelectorModal
        visible={showFromCurrencyModal}
        currencies={SUPPORTED_CURRENCIES}
        selectedCurrency={normalizeCurrency(fromCurrency)}
        title="Select Currency"
        onSelect={(currency) => {
          setFromCurrency(normalizeCurrency(currency));
          setShowFromCurrencyModal(false);
          setExchangeError(null);
        }}
        onClose={() => setShowFromCurrencyModal(false)}
      />

      <CurrencySelectorModal
        visible={showToCurrencyModal}
        currencies={toCurrencies}
        selectedCurrency={normalizeCurrency(toCurrency)}
        title="Select Currency"
        onSelect={(currency) => {
          setToCurrency(normalizeCurrency(currency));
          setShowToCurrencyModal(false);
          setExchangeError(null);
        }}
        onClose={() => setShowToCurrencyModal(false)}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  walletEmoji: {
    fontSize: 16,
  },
  walletName: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 100,
  },
  homeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  exchangeButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exchangeButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  exchangeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default Exchange;
