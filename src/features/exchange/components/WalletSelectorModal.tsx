import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { WalletCard } from '../hooks/useWallets';

interface WalletSelectorModalProps {
  visible: boolean;
  wallets: WalletCard[];
  selectedWalletId: number | null;
  onSelect: (walletId: number) => void;
  onClose: () => void;
}

export const WalletSelectorModal: React.FC<WalletSelectorModalProps> = ({
  visible,
  wallets,
  selectedWalletId,
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
            <ThemedText style={styles.title}>Select Wallet</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={[styles.close, { color: iconColor }]}>×</ThemedText>
            </TouchableOpacity>
          </View>
          {wallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.userWalletKey}
              style={[
                styles.option,
                { borderBottomColor: borderColor },
                wallet.walletid === selectedWalletId && [styles.optionSelected, { backgroundColor: surfacePressedColor }],
              ]}
              onPress={() => {
                onSelect(wallet.walletid);
                onClose();
              }}
            >
              <ThemedText style={styles.emoji}>{wallet.emoji || '💳'}</ThemedText>
              <ThemedText style={styles.name}>{wallet.name}</ThemedText>
              {wallet.walletid === selectedWalletId && (
                <FontAwesome name="check" size={16} color={tintColor} />
              )}
            </TouchableOpacity>
          ))}
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
  emoji: {
    fontSize: 22,
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});
