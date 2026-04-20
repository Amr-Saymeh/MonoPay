import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CURRENCY_NAMES, normalizeCurrency } from '../utils/currency';

interface CurrencySelectorModalProps {
  visible: boolean;
  currencies: string[];
  selectedCurrency: string;
  title: string;
  onSelect: (currency: string) => void;
  onClose: () => void;
}

export const CurrencySelectorModal: React.FC<CurrencySelectorModalProps> = ({
  visible,
  currencies,
  selectedCurrency,
  title,
  onSelect,
  onClose,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const surfacePressedColor = useThemeColor({}, 'surfacePressed');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={[styles.close, { color: iconColor }]}>×</ThemedText>
            </TouchableOpacity>
          </View>
          {currencies.map((currency) => {
            const isSelected = normalizeCurrency(currency) === normalizeCurrency(selectedCurrency);
            return (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.option,
                  { borderBottomColor: borderColor },
                  isSelected && [styles.optionSelected, { backgroundColor: surfacePressedColor }],
                ]}
                onPress={() => {
                  onSelect(currency);
                  onClose();
                }}
              >
                <View style={styles.info}>
                  <ThemedText style={styles.code}>{currency}</ThemedText>
                  <ThemedText style={[styles.name, { color: iconColor }]}>{CURRENCY_NAMES[currency]}</ThemedText>
                </View>
                {isSelected && (
                  <FontAwesome name="check" size={16} color={tintColor} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  close: {
    fontSize: 28,
    lineHeight: 28,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionSelected: {
  },
  info: {
    flex: 1,
  },
  code: {
    fontSize: 16,
    fontWeight: '500',
  },
  name: {
    fontSize: 13,
    marginTop: 2,
  },
});
