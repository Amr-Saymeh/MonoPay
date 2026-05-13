import { SummaryCard } from "./SummaryCard";
import { ThemedText } from "@/components/themed-text";
import { hapticSelection } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { FlatList, Pressable, View } from "react-native";

import {
  getIncomeAccentColor,
  SOURCE_TYPE_FILTERS,
  type SourceTypeFilter,
} from "../constants";
import type { SourceType } from "../services/incomeSavings.service";
import { styles } from "../stylesheet";

type IncomeSourcesListHeaderProps = {
  sourceCount: number;
  estimatedMonthlyTotal: number;
  selectedFilter: SourceTypeFilter;
  isDark: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  sourceLabel: string;
  allLabel: string;
  getSourceTypeLabel: (type: SourceType) => string;
  onFilterChange: (filter: SourceTypeFilter) => void;
};

export function IncomeSourcesListHeader({
  sourceCount,
  estimatedMonthlyTotal,
  selectedFilter,
  isDark,
  backgroundColor,
  borderColor,
  textColor,
  sourceLabel,
  allLabel,
  getSourceTypeLabel,
  onFilterChange,
}: IncomeSourcesListHeaderProps) {
  return (
    <View style={styles.listHeaderWrap}>
      <SummaryCard
        sourceCount={sourceCount}
        estimatedMonthlyTotal={estimatedMonthlyTotal}
      />
      {sourceCount > 0 ? (
        <View style={[styles.filterWrap, { backgroundColor, borderColor }]}>
          <View style={styles.filterHeader}>
            <MaterialIcons
              name="category"
              size={18}
              color={getIncomeAccentColor(isDark)}
            />
            <ThemedText style={[styles.filterTitle, { color: textColor }]}>
              {sourceLabel}
            </ThemedText>
          </View>
          <FlatList
            data={SOURCE_TYPE_FILTERS}
            horizontal
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
            renderItem={({ item }) => {
              const isActive = selectedFilter === item;
              const label =
                item === "all" ? allLabel : getSourceTypeLabel(item);

              return (
                <Pressable
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => {
                    hapticSelection();
                    onFilterChange(item);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.82}
                  >
                    {label}
                  </ThemedText>
                </Pressable>
              );
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
