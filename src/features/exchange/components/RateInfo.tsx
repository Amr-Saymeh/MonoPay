import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface RateInfoProps {
  fromCurrency: string;
  toCurrency: string;
  rate: number | null;
}

export const RateInfo: React.FC<RateInfoProps> = ({ fromCurrency, toCurrency, rate }) => {
  const iconColor = useThemeColor({}, 'icon');

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
