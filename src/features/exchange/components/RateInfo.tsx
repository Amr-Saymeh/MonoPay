import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface RateInfoProps {
  fromCurrency: string;
  toCurrency: string;
  rate: number | null;
  loading?: boolean;
}

export const RateInfo: React.FC<RateInfoProps> = ({ fromCurrency, toCurrency, rate, loading }) => {
  const iconColor = useThemeColor({}, 'icon');

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={iconColor} />
      </View>
    );
  }
  if (!rate) return null;

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.text, { color: iconColor }]}>
        1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
