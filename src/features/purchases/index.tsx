import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';

// Hooks
import { useDailyTotal } from './hooks/useDailyTotal';
import { usePurchasesForm } from './hooks/usePurchasesForm';
import { usePurchasesList } from './hooks/usePurchasesList';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';
import { DarkThemeStyles } from './styles';

// Components
import DailyTotalCard, { RatesModal, BudgetModal } from './components/DailyTotalCard';
import BudgetWarningModal from './components/BudgetWarningModal';
import PurchaseForm from './components/PurchaseForm';
import PurchaseList from './components/PurchaseList';

export default function PurchasesFeature() {
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  const {
    totalSpentNIS,
    dailyBudgetNIS,
    displayCurrency,
    dataLoading,
    ratesLoading,
    ratesError,
    rates,
    symbol,
    fromNIS,
    toNIS,
    refreshRates,
    saveBudget,
    cycleCurrency,
  } = useDailyTotal();

  const {
    control,
    errors,
    setValue,
    selectedCurrency,
    loading: formLoading,
    visibleToast,
    suggestions,
    onSubmit,
    showBudgetAlert,
    setShowBudgetAlert,
    projectedTotal,
    confirmBudgetWarning,
  } = usePurchasesForm(dailyBudgetNIS, totalSpentNIS, toNIS);

  const {
    purchases,
    loading: listLoading,
    handleDelete,
  } = usePurchasesList();

  const displayTotal = fromNIS(totalSpentNIS, displayCurrency);
  const displayBudget = fromNIS(dailyBudgetNIS, displayCurrency);
  const budgetPercent = dailyBudgetNIS > 0
    ? Math.min(Math.round((totalSpentNIS / dailyBudgetNIS) * 100), 100)
    : 0;
  const isGlobalLoading = dataLoading || ratesLoading;

  return (
      <ScrollView style={[isDark && DarkThemeStyles.darkBackground]}>
        <DailyTotalCard
          totalSpentNIS={totalSpentNIS}
          dailyBudgetNIS={dailyBudgetNIS}
          displayCurrency={displayCurrency}
          ratesLoading={ratesLoading}
          ratesError={ratesError}
          isLoading={isGlobalLoading}
          symbol={symbol}
          displayTotal={displayTotal}
          displayBudget={displayBudget}
          budgetPercent={budgetPercent}
          onRefreshRates={refreshRates}
          onEditBudget={() => setShowBudgetModal(true)}
          onCycleCurrency={cycleCurrency}
          onBack={() => {
            if (router.canGoBack()) {
              router.back()
            }
          }}
          onShowRatesModal={() => setShowRatesModal(true)}
          onCreateBundle={() => router.push('/Bundles')}
        />

        <PurchaseForm
          onSubmit={onSubmit}
          loading={formLoading}
          visibleToast={visibleToast}
          suggestions={suggestions}
          control={control}
          errors={errors}
          setValue={setValue}
          selectedCurrency={selectedCurrency}
        />

        <PurchaseList
          purchases={purchases}
          loading={listLoading}
          onDelete={handleDelete}
        />

        <BudgetModal
          visible={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
          onSave={saveBudget}
          rates={rates}
        />

        <RatesModal
          visible={showRatesModal}
          onClose={() => setShowRatesModal(false)}
          rates={rates}
          loading={ratesLoading}
          hasError={ratesError}
          onRefresh={refreshRates}
        />

        <BudgetWarningModal
          visible={showBudgetAlert}
          onClose={() => setShowBudgetAlert(false)}
          onConfirm={confirmBudgetWarning}
          newTotal={fromNIS(projectedTotal, displayCurrency)}
          budget={displayBudget}
          currencySymbol={symbol}
        />
      </ScrollView>
  );
}

