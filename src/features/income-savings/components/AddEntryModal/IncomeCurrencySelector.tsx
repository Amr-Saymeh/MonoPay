import { ThemedText } from "@/components/themed-text";
import { hapticSelection } from "@/src/utils/haptics";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

import { styles } from "./styles";
import { normalizeCurrencyCode } from "./utils";

type IncomeCurrencySelectorProps = {
  currency: string;
  selectedWalletCurrencies: string[];
  pillBorder: string;
  pillTextColor: string;
  onCurrencyChange: (value: string) => void;
};

export function IncomeCurrencySelector({
  currency,
  selectedWalletCurrencies,
  pillBorder,
  pillTextColor,
  onCurrencyChange,
}: IncomeCurrencySelectorProps) {
  const currencyOptions = useMemo(() => {
    const rawCurrencies =
      selectedWalletCurrencies.length > 0
        ? selectedWalletCurrencies
        : ["usd", "eur", "nis"];

    return Array.from(
      new Set(
        rawCurrencies
          .map((item) => normalizeCurrencyCode(item))
          .filter(Boolean),
      ),
    );
  }, [selectedWalletCurrencies]);

  return (
    <View style={styles.pillsWrap}>
      {currencyOptions.map((item) => {
        const normalized = normalizeCurrencyCode(currency);
        return (
          <Pressable
            key={item}
            style={[
              styles.pill,
              { borderColor: pillBorder },
              normalized === item && styles.pillSelected,
            ]}
            onPress={() => {
              hapticSelection();
              onCurrencyChange(item);
            }}
          >
            <ThemedText
              style={[
                styles.pillText,
                { color: pillTextColor },
                normalized === item && styles.pillTextSelected,
              ]}
            >
              {item.toUpperCase()}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
