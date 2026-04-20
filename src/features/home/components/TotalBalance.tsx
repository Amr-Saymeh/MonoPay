import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from "@/hooks/use-i18n";
import { homeStyles as styles } from '../styles';
import { useWalletCards } from '@/src/features/wallets/my-wallets/hooks/useWalletCards';
import { useAuth } from '@/src/providers/AuthProvider';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';

export default function TotalBalance() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { cards, loading } = useWalletCards({ userId: user?.uid });
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  const totals = useMemo(() => {
    const map: Record<string, number> = {};
    cards.forEach(card => {
      const currencies = card.wallet?.currancies || {};
      Object.entries(currencies).forEach(([code, amount]) => {
        const key = code.toUpperCase();
        map[key] = (map[key] || 0) + Number(amount);
      });
    });
    return map;
  }, [cards]);

  const displayBalance = useMemo(() => {
    if (Object.keys(totals).length === 0) return "0.00 NIS";
    const keys = Object.keys(totals);
    const primary = keys.includes("NIS") ? "NIS" : (keys.includes("USD") ? "USD" : keys[0]);
    return `${totals[primary].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${primary}`;
  }, [totals]);

  if (loading) {
    return (
      <View style={[styles.balanceContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#B166F8" />
      </View>
    );
  }

  return (
    <View style={styles.balanceContainer}>
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#B166F8', '#864CBD', '#435799']}
        start={{ x: 0.1, y: 0.3 }}
        end={{ x: 0.9, y: 0.8 }}
        style={[styles.balanceGradient, isDark && styles.darkCard]}
      >
        <View style={styles.balanceContentContainer}>
          <Text style={styles.balanceLabel}>{t("totalBalance")}</Text>

          <Text style={styles.balanceAmount}>{displayBalance}</Text>

          <View style={styles.changeRow}>
            <Ionicons name="trending-up" size={20} color="#00ff9d" />
            <Text style={styles.changeText}>{"+5.2%" + t("changePercent")}</Text>
          </View>

          <View style={styles.incomeExpensesRow}>
            <View style={styles.column}>
              <Text style={styles.sectionLabel}>{t("income")}</Text>
              <Text style={[styles.amount, styles.incomeAmount]}>+$8,240.00</Text>
            </View>

            <View style={styles.column}>
              <Text style={styles.sectionLabel}>{t("expenses")}</Text>
              <Text style={[styles.amount, styles.expensesAmount]}>-$3,128.50</Text>
            </View>
          </View>
        </View>

        <View style={styles.balanceBigCircleRight} />
        <View style={styles.balanceBigCircleLeft} />
      </LinearGradient>
    </View>
  );
}
