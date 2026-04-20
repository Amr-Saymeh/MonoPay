import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useI18n } from "@/hooks/use-i18n";
import { PurchaseListProps } from '../types';
import { PurchaseListStyles as styles } from '../styles';
import PurchaseCard from './PurchaseCard';
import { THEME } from '../constants';

export default function PurchaseList({
  purchases,
  loading,
  onPressItem,
  onDelete,
}: PurchaseListProps) {
  const { t } = useI18n() as any;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  if (purchases.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{t('noPendingUsers')} 🛒</Text> 
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {purchases.map((item) => (
        <PurchaseCard
          key={item.id}
          item={item}
          onPress={onPressItem}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
}
