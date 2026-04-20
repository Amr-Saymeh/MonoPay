import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { DailyTotalCardProps, RatesModalProps, BudgetModalProps, Currency } from '../types';
import { DailyTotalCardStyles as styles, RatesModalStyles as ratesStyles, BudgetModalStyles as budgetStyles, DarkThemeStyles } from '../styles';
import { CURRENCIES, CURRENCY_SYMBOL, THEME, FALLBACK_RATES } from '../constants';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';

export function RatesModal({ visible, onClose, rates, loading, hasError, onRefresh }: RatesModalProps) {
  const { t } = useI18n() as any;
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={ratesStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[ratesStyles.sheet, isDark && { backgroundColor: '#1c1c1e' }]}>
          <View style={ratesStyles.handle} />
          <Text style={[ratesStyles.title, isDark && { color: '#fff' }]}>📊 {t('exchangeRates')}</Text>
          <Text style={ratesStyles.sub}> {t('updatedEveryHour')}</Text>

          {loading ? (
            <ActivityIndicator color={THEME.primary} style={{ marginVertical: 24 }} />
          ) : hasError ? (
            <View style={ratesStyles.errorBox}>
              <Text style={ratesStyles.errorText}>⚠️ {t('errorFetchingRates')}</Text>
            </View>
          ) : (
            <View style={ratesStyles.grid}>
              <View style={[ratesStyles.card, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Text style={ratesStyles.flag}>🇺🇸</Text>
                <Text style={[ratesStyles.pair, isDark && { color: 'rgba(255,255,255,0.7)' }]}>1 USD</Text>
                <Text style={[ratesStyles.value, isDark && { color: '#a78bfa' }]}>= ₪{rates.USD?.toFixed(3) || '0.000'}</Text>
              </View>
              <View style={[ratesStyles.card, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Text style={ratesStyles.flag}>🇯🇴</Text>
                <Text style={[ratesStyles.pair, isDark && { color: 'rgba(255,255,255,0.7)' }]}>1 JOD</Text>
                <Text style={[ratesStyles.value, isDark && { color: '#a78bfa' }]}>= ₪{rates.JOD?.toFixed(3) || '0.000'}</Text>
              </View>
              <View style={[ratesStyles.card, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Text style={ratesStyles.flag}>🇵🇸</Text>
                <Text style={[ratesStyles.pair, isDark && { color: 'rgba(255,255,255,0.7)' }]}>1 NIS</Text>
                <Text style={[ratesStyles.value, isDark && { color: '#a78bfa' }]}>= ${rates.USD ? (1 / rates.USD).toFixed(4) : '0.0000'}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={[ratesStyles.refreshBtn, isDark && { backgroundColor: 'rgba(255,255,255,0.08)' }]} onPress={onRefresh}>
            <Text style={[ratesStyles.refreshText, isDark && { color: '#a78bfa' }]}>🔄 {t('refreshNow')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ratesStyles.closeBtn} onPress={onClose}>
            <Text style={ratesStyles.closeText}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function BudgetModal({ visible, onClose, onSave, rates }: BudgetModalProps) {
  const { t } = useI18n() as any;
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';
  const [amount, setAmount] = useState('');
  const [inputCurrency, setInputCurrency] = useState<Currency>('NIS');

  const previewNIS = (() => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return null;
    const rate = rates[inputCurrency] || FALLBACK_RATES[inputCurrency];
    return n * rate;
  })();

  const handleSave = () => {
    if (!previewNIS) {
      Alert.alert(t('error'), t('enterValidAmount'));
      return;
    }
    onSave(previewNIS);
    setAmount('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={budgetStyles.overlay}>
        <View style={[budgetStyles.card, isDark && { backgroundColor: '#1c1c1e' }]}>
          <Text style={[budgetStyles.title, isDark && { color: '#fff' }]}>💰 {t('dailyBudget')}</Text>
          <Text style={budgetStyles.sub}>{t('enterAmountInAnyCurrency')}</Text>

          <View style={budgetStyles.currencyRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[budgetStyles.curBtn, inputCurrency === c && budgetStyles.curBtnActive, isDark && inputCurrency !== c && { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                onPress={() => setInputCurrency(c)}
              >
                <Text style={[budgetStyles.curLabel, inputCurrency === c && budgetStyles.curLabelActive, isDark && inputCurrency !== c && { color: 'rgba(255,255,255,0.7)' }]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[budgetStyles.inputRow, isDark && { borderColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[budgetStyles.symbol, isDark && { color: '#a78bfa' }]}>{CURRENCY_SYMBOL[inputCurrency]}</Text>
            <TextInput
              style={[budgetStyles.input, isDark && { color: '#fff' }]}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoFocus
            />
          </View>

          {inputCurrency !== 'NIS' && previewNIS !== null && (
            <View style={[budgetStyles.preview, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
              <Text style={[budgetStyles.previewText, isDark && { color: '#a78bfa' }]}>
                ≈ ₪{previewNIS.toFixed(2)} {t('willBeSavedInNis')}
              </Text>
            </View>
          )}

          <View style={budgetStyles.btnRow}>
            <TouchableOpacity style={[budgetStyles.cancelBtn, isDark && { backgroundColor: 'rgba(255,255,255,0.08)' }]} onPress={onClose}>
              <Text style={[budgetStyles.cancelLabel, isDark && { color: '#fff' }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={budgetStyles.saveBtn} onPress={handleSave}>
              <Text style={budgetStyles.saveLabel}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function DailyTotalCard({
  displayCurrency,
  ratesLoading,
  ratesError,
  isLoading,
  symbol,
  displayTotal,
  displayBudget,
  budgetPercent,
  onCycleCurrency,
  onBack,
  totalSpentNIS,
  dailyBudgetNIS,
  onShowRatesModal,
  onEditBudget,
  onCreateBundle,
}: DailyTotalCardProps) {
  const { t } = useI18n() as any;
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  const isOverBudget = totalSpentNIS > dailyBudgetNIS && dailyBudgetNIS > 0;
  const isNearLimit = budgetPercent >= 80 && !isOverBudget;

  const badgeColor = isOverBudget ? THEME.danger : isNearLimit ? THEME.warning : THEME.success;
  const badgeIcon = isOverBudget ? '🚨' : isNearLimit ? '⚠️' : '✅';

  return (
    <View style={styles.container}>
      <Text style={[styles.headerTitle, isDark && DarkThemeStyles.darkHeaderTitle]}>{t("dailyPurchases")}</Text>
      <Ionicons
        name="arrow-back"
        size={24}
        color={isDark ? "#a78bfa" : "#111"}
        style={styles.backButton}
        onPress={onBack}
      />
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e', '#0f3460'] : [THEME.primaryLight, THEME.primary, '#5C2ECC']}
        start={{ x: 1, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, isDark && DarkThemeStyles.darkCard]}
      >
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>{t('totalExpenses')}</Text>
            <TouchableOpacity style={styles.ratesBtn} onPress={onShowRatesModal}>
              {ratesLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.ratesBtnText}>{ratesError ? '⚠️' : '💱'} {t('rates')}</Text>
              }
            </TouchableOpacity>
          </View>

          <Text style={styles.amount}>
            {isLoading ? '...' : `${symbol}${displayTotal.toFixed(2)}`}
          </Text>

          {budgetPercent > 0 && (
            <TouchableOpacity onPress={onCycleCurrency}>
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>
                  {badgeIcon} {budgetPercent}% {t('ofDailyBudget')}
                  {'   ·   '}{displayCurrency} →
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editButton} onPress={onEditBudget}>
              <Text style={styles.editButtonText}>
                {t('editBudget')} ({symbol}{displayBudget.toFixed(0)})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bundleActionBtn} onPress={onCreateBundle}>
              <Ionicons name="layers-outline" size={16} color="#fff" />
              <Text style={styles.bundleActionText}>{t('createNewBundle')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
