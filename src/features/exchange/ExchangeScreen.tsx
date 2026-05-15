import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SharedCard } from '@/src/features/card/SharedCard';
import { useAuth } from '@/src/providers/AuthProvider';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
    CurrencySelectorModal,
    ExchangeCard,
    RateInfo,
    StatusMessage,
    WalletSelectorModal,
} from './components';
import { useExchange } from './hooks/useExchange';

const ExchangeScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  const {
    amount,
    convertedAmount,
    currencies,
    currentRate,
    exchangeError,
    exchangeSuccess,
    fromBalance,
    fromCurrencyNormalized,
    fromCurrency,
    handleAmountChange,
    handleExchange,
    handleMax,
    handleSwap,
    handleWalletSelect,
    isAmountValid,
    isLoading,
    isRatesLoading,
    selectedWallet,
    showFromCurrencyModal,
    showToCurrencyModal,
    showWalletModal,
    toBalance,
    toCurrencies,
    toCurrencyNormalized,
    toCurrency,
    updateFromCurrency,
    updateToCurrency,
    setShowWalletModal,
    setShowFromCurrencyModal,
    setShowToCurrencyModal,
    closeFromCurrencyModal,
    closeToCurrencyModal,
    wallets,
    availableCurrencies,
  } = useExchange(user?.uid);

  if (isLoading || !selectedWallet) {
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
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={[styles.homeButton, { backgroundColor: surfaceColor }]}
          >
            <FontAwesome name="arrow-left" size={20} color="#6366f1" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Exchange</ThemedText>
        </View>

        <TouchableOpacity
          onPress={() => setShowWalletModal(true)}
          style={[styles.walletButton, { backgroundColor: surfaceColor }]}
        >
          <ThemedText style={styles.walletEmoji}>{selectedWallet.emoji || '💳'}</ThemedText>
          <ThemedText style={styles.walletName} numberOfLines={1}>
            {selectedWallet.name}
          </ThemedText>
          <FontAwesome name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 16 }}>
          <SharedCard name={selectedWallet.name} emoji={selectedWallet.emoji} currencies={currencies} />
        </View>

        <ExchangeCard
          fromCurrency={fromCurrencyNormalized}
          toCurrency={toCurrencyNormalized}
          amount={amount}
          convertedAmount={convertedAmount}
          fromBalance={fromBalance}
          toBalance={toBalance}
          onAmountChange={handleAmountChange}
          onFromCurrencyPress={() => setShowFromCurrencyModal(true)}
          onToCurrencyPress={() => setShowToCurrencyModal(true)}
          onSwap={handleSwap}
          onMax={handleMax}
        />

        <RateInfo fromCurrency={fromCurrencyNormalized} toCurrency={toCurrencyNormalized} rate={currentRate} loading={isRatesLoading} />

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
        selectedWalletId={selectedWallet?.walletid ?? null}
        onSelect={handleWalletSelect}
        onClose={() => setShowWalletModal(false)}
      />

      <CurrencySelectorModal
        visible={showFromCurrencyModal}
        currencies={availableCurrencies}
        selectedCurrency={fromCurrencyNormalized}
        title="Select Currency"
        onSelect={updateFromCurrency}
        onClose={closeFromCurrencyModal}
      />

      <CurrencySelectorModal
        visible={showToCurrencyModal}
        currencies={toCurrencies}
        selectedCurrency={toCurrencyNormalized}
        title="Select Currency"
        onSelect={updateToCurrency}
        onClose={closeToCurrencyModal}
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

export default ExchangeScreen;
