import { useI18n } from "@/hooks/use-i18n";
import { useWalletCards } from '@/src/features/wallets/my-wallets/hooks/useWalletCards';
import { useAuth } from '@/src/providers/AuthProvider';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SharedCard } from '@/src/features/card/SharedCard';
import { useSpendingInsightsData } from '@/src/features/insights/hooks/useSpendingInsightsData';
import { homeStyles as styles } from '../styles';

export default function TotalBalance() {
  const { t, language } = useI18n();
  const { user, profile } = useAuth();
  const { cards } = useWalletCards({ userId: user?.uid });
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  const { incomeTotal, spendTotal, currencies } = useSpendingInsightsData({
    category: "ALL",
    currency: "ALL",
    flow: "all",
    language: language as any,
    selectedCategories: profile?.categories ?? [],
    sortMode: "recent",
    uid: user?.uid,
    window: "30D",
  });

  const totals = useMemo(() => {
    const map: Record<string, number> = {};
    
    cards.forEach(card => {
      const wallet = card.wallet;
      if (!wallet) return;

      const currencies = wallet.currencies || wallet.currancies || {};
      const hasCurrencies = Object.keys(currencies).length > 0;
      
      if (hasCurrencies) {
        Object.entries(currencies).forEach(([code, amount]) => {
          const key = code.toUpperCase();
          const value = typeof amount === 'number' ? amount : parseFloat(String(amount));
          if (!isNaN(value)) {
            map[key] = (map[key] || 0) + value;
          }
        });
      } else if (wallet.currentAmount !== undefined) {
        const currency = (wallet as any).goalTargetCurrency || 'NIS';
        const key = currency.toUpperCase();
        const value = typeof wallet.currentAmount === 'number' ? wallet.currentAmount : parseFloat(String(wallet.currentAmount));
        if (!isNaN(value)) {
          map[key] = (map[key] || 0) + value;
        }
      }
    });
    
    return map;
  }, [cards, user?.uid]);

  const currenciesArray = useMemo(() => {
    return Object.entries(totals).map(([code, balance]) => ({
      code,
      balance,
    }));
  }, [totals]);

  const primaryCurrency = currencies[0] || "NIS";

  return (
    <View style={styles.balanceContainer}>
      <SharedCard 
        name={t("totalBalance")}
        emoji="💰"
        currencies={currenciesArray}
      >
        <View style={localStyles.innerRow}>
          <View style={localStyles.innerColumn}>
            <Text style={localStyles.innerLabel}>{t("income")}</Text>
            <Text style={[localStyles.innerValue, { color: '#4ade80' }]}>
              +{incomeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {primaryCurrency.toUpperCase()}
            </Text>
          </View>

          <View style={localStyles.verticalDivider} />

          <View style={localStyles.innerColumn}>
            <Text style={localStyles.innerLabel}>{t("expenses")}</Text>
            <Text style={[localStyles.innerValue, { color: '#f87171' }]}>
              -{spendTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {primaryCurrency.toUpperCase()}
            </Text>
          </View>
        </View>
      </SharedCard>
    </View>
  );
}

const localStyles = StyleSheet.create({
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  innerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  innerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  innerValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  verticalDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
});
