import { ThemedText } from "@/components/themed-text";
import { hapticSelection } from "@/src/utils/haptics";
import { Pressable, View } from "react-native";

import { CURRENCIES, type Currency } from "../constants";
import { styles } from "../stylesheet";

type CurrencySelectorProps = {
  value: Currency;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  onChange: (value: Currency) => void;
};

export function CurrencySelector({
  value,
  borderColor,
  backgroundColor,
  textColor,
  onChange,
}: CurrencySelectorProps) {
  return (
    <View style={styles.pillRow}>
      {CURRENCIES.map((curr) => (
        <Pressable
          key={curr}
          style={[
            styles.pill,
            { borderColor, backgroundColor },
            value === curr && styles.pillSelected,
          ]}
          onPress={() => {
            hapticSelection();
            onChange(curr);
          }}
        >
          <ThemedText
            style={[
              styles.pillText,
              { color: textColor },
              value === curr && styles.pillTextSelected,
            ]}
          >
            {curr.toUpperCase()}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

