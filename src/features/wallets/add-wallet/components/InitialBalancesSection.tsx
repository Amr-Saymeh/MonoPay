
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AuthInput } from "@/components/ui/auth-input";
import { useThemeColor } from "@/hooks/use-theme-color";

import { styles } from "../styles";
import type { BalanceRow } from "../types";

type InitialBalancesSectionProps = {
  title: string;
  balances: BalanceRow[];
  onAddBalance: () => void;
  onCycleCurrency: (rowId: string) => void;
  onAmountChange: (rowId: string, text: string) => void;
};

export function InitialBalancesSection({
  title,
  balances,
  onAddBalance,
  onCycleCurrency,
  onAmountChange,
}: InitialBalancesSectionProps) {
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        <Pressable
          onPress={onAddBalance}
          style={({ pressed }) => [styles.addCurrencyButton, pressed ? styles.pressed : null]}
        >
          <MaterialIcons name="add" size={18} color="#6D28D9" />
        </Pressable>
      </View>

      <View style={styles.balancesList}>
        {balances.map((row) => (
          <View key={row.id} style={styles.balanceRow}>
            <Pressable
              onPress={() => onCycleCurrency(row.id)}
              style={({ pressed }) => [
                styles.currencyPill,
                { backgroundColor: surfaceColor, borderColor },
                pressed ? styles.pressed : null,
              ]}
            >
              <ThemedText type="defaultSemiBold">{row.currency.toUpperCase()}</ThemedText>
            </Pressable>
            <View style={{ flex: 1 }}>
              <AuthInput
                value={row.amount}
                onChangeText={(text) => onAmountChange(row.id, text)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
