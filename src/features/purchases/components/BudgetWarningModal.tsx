import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useI18n } from '@/hooks/use-i18n';
import { BudgetWarningModalProps } from '../types';
import { WarningModalStyles as styles } from '../styles';

export default function BudgetWarningModal({
  visible,
  onClose,
  onConfirm,
  newTotal,
  budget,
  currencySymbol,
}: BudgetWarningModalProps) {
  const { t } = useI18n() as any;
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  
  const diff = newTotal - budget;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <ThemedView style={[styles.card, { backgroundColor }]}>
          <View style={styles.iconBox}>
            <ThemedText style={styles.icon}>🛑</ThemedText>
          </View>
          
          <ThemedText style={styles.title}>{t('budgetWarningTitle')}</ThemedText>
          <ThemedText style={styles.message}>{t('budgetWarningMessage')}</ThemedText>
          
          <View style={[styles.statsBox, { backgroundColor: surfaceColor }]}>
            <View style={styles.statRow}>
              <ThemedText style={styles.statLabel}>{t('dailyBudget')}</ThemedText>
              <ThemedText style={styles.statValue}>{currencySymbol}{budget.toFixed(2)}</ThemedText>
            </View>
            
            <View style={styles.statRow}>
              <ThemedText style={styles.statLabel}>{t('newTotalAfter')}</ThemedText>
              <ThemedText style={styles.statValue}>{currencySymbol}{newTotal.toFixed(2)}</ThemedText>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statRow}>
              <ThemedText style={styles.totalLabel}>{t('remainingBudget')}</ThemedText>
              <ThemedText style={styles.totalValue}>
                {diff > 0 ? `-${currencySymbol}${diff.toFixed(2)}` : `${currencySymbol}${Math.abs(diff).toFixed(2)}`}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.btnCol}>
            <TouchableOpacity style={styles.saveBtn} onPress={onClose}>
              <ThemedText style={styles.saveBtnText}>{t('saveMyMoney')}</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.proceedBtn} onPress={onConfirm}>
              <ThemedText style={styles.proceedBtnText}>{t('proceedAnyway')}</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}
