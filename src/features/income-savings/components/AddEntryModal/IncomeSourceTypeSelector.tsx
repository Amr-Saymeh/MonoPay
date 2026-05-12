import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import type { SourceType } from "@/src/services/incomeSources.service";
import { hapticSelection } from "@/src/utils/haptics";
import { Pressable, View } from "react-native";

import { styles } from "./styles";

type IncomeSourceTypeSelectorProps = {
  type: SourceType;
  sourceTypes: SourceType[];
  pillBorder: string;
  pillTextColor: string;
  onTypeChange: (value: SourceType) => void;
};

export function IncomeSourceTypeSelector({
  type,
  sourceTypes,
  pillBorder,
  pillTextColor,
  onTypeChange,
}: IncomeSourceTypeSelectorProps) {
  const { t } = useI18n();

  const getSourceTypeLabel = (value: SourceType) => {
    switch (value) {
      case "salary":
        return t("incomeSavings.categories.salary");
      case "loan":
        return t("incomeSavings.categories.loan");
      case "freelance":
        return t("incomeSavings.categories.freelance");
      case "investment":
        return t("incomeSavings.categories.investment");
      default:
        return t("incomeSavings.categories.other");
    }
  };

  return (
    <View style={styles.pillsWrap}>
      {sourceTypes.map((item) => (
        <Pressable
          key={item}
          style={[
            styles.pill,
            { borderColor: pillBorder },
            type === item && styles.pillSelected,
          ]}
          onPress={() => {
            hapticSelection();
            onTypeChange(item);
          }}
        >
          <ThemedText
            style={[
              styles.pillText,
              { color: pillTextColor },
              type === item && styles.pillTextSelected,
            ]}
          >
            {getSourceTypeLabel(item)}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}
