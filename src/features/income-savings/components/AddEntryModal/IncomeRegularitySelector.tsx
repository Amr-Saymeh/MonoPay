import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import type { Regularity } from "@/src/services/incomeSources.service";
import { hapticSelection } from "@/src/utils/haptics";
import { Pressable, View } from "react-native";

import { styles } from "./styles";

type IncomeRegularitySelectorProps = {
  regularity: Regularity;
  regularityTypes: Regularity[];
  pillBorder: string;
  pillTextColor: string;
  onRegularityChange: (value: Regularity) => void;
};

export function IncomeRegularitySelector({
  regularity,
  regularityTypes,
  pillBorder,
  pillTextColor,
  onRegularityChange,
}: IncomeRegularitySelectorProps) {
  const { t } = useI18n();

  const getRegularityLabel = (value: Regularity) => {
    switch (value) {
      case "daily":
        return t("incomeSavings.daily");
      case "weekly":
        return t("incomeSavings.weekly");
      case "yearly":
        return t("incomeSavings.yearly");
      default:
        return t("incomeSavings.monthly");
    }
  };

  return (
    <View style={styles.pillsWrap}>
      {regularityTypes.map((item) => (
        <Pressable
          key={item}
          style={[
            styles.pill,
            { borderColor: pillBorder },
            regularity === item && styles.pillSelected,
          ]}
          onPress={() => {
            hapticSelection();
            onRegularityChange(item);
          }}
        >
          <ThemedText
            style={[
              styles.pillText,
              { color: pillTextColor },
              regularity === item && styles.pillTextSelected,
            ]}
          >
            {getRegularityLabel(item)}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}
