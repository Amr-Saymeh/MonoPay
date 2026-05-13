import { ThemedText } from "@/components/themed-text";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";
import { Pressable } from "react-native";

import { hapticSelection } from "@/src/utils/haptics";
import { styles } from "./styles";
import type { WalletOption } from "./types";

type IncomeWalletSelectorProps = {
  walletOptions: WalletOption[];
  selectedWalletSlot: string | null;
  pillBorder: string;
  walletTextColor: string;
  onWalletSelect: (slotKey: string) => void;
};

export function IncomeWalletSelector({
  walletOptions,
  selectedWalletSlot,
  pillBorder,
  walletTextColor,
  onWalletSelect,
}: IncomeWalletSelectorProps) {
  return (
    <GestureScrollView
      horizontal
      style={styles.walletListScroll}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      directionalLockEnabled
      bounces={false}
      overScrollMode="never"
      contentContainerStyle={styles.walletList}
    >
      {walletOptions.map((wallet) => {
        const isSelected = selectedWalletSlot === wallet.slotKey;
        return (
          <Pressable
            key={wallet.slotKey}
            style={[
              styles.walletOption,
              { borderColor: pillBorder },
              isSelected && styles.walletOptionSelected,
            ]}
            onPress={() => {
              hapticSelection();
              onWalletSelect(wallet.slotKey);
            }}
          >
            <ThemedText
              numberOfLines={1}
              style={[styles.walletOptionText, { color: walletTextColor }]}
            >
              {wallet.name}
            </ThemedText>
            {isSelected ? (
              <MaterialIcons
                name="check-circle"
                size={16}
                color="#7C3AED"
                style={styles.walletCheckIcon}
              />
            ) : null}
          </Pressable>
        );
      })}
    </GestureScrollView>
  );
}
