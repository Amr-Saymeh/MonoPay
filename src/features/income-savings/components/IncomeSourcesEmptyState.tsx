import { ThemedText } from "@/components/themed-text";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";

import {
  INCOME_EMPTY_ICON_COLOR,
  INCOME_EMPTY_SEARCH_ICON_COLOR,
} from "../constants";
import { styles } from "../stylesheet";

type IncomeSourcesEmptyStateProps = {
  isSearchEmpty: boolean;
  title: string;
  description: string;
};

export function IncomeSourcesEmptyState({
  isSearchEmpty,
  title,
  description,
}: IncomeSourcesEmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <MaterialIcons
        name={isSearchEmpty ? "search-off" : "account-balance-wallet"}
        size={isSearchEmpty ? 46 : 52}
        color={isSearchEmpty ? INCOME_EMPTY_SEARCH_ICON_COLOR : INCOME_EMPTY_ICON_COLOR}
      />
      <ThemedText style={styles.emptyTitle}>{title}</ThemedText>
      <ThemedText style={styles.emptySubtext}>{description}</ThemedText>
    </View>
  );
}
