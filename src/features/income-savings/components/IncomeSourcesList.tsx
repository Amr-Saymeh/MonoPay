import { EntryCard } from "@/components/income-savings/EntryCard";
import { FlatList } from "react-native";

import type { IncomeSource, SourceType } from "../services/incomeSavings.service";
import type { SourceTypeFilter } from "../constants";
import { IncomeSourcesEmptyState } from "./IncomeSourcesEmptyState";
import { IncomeSourcesListHeader } from "./IncomeSourcesListHeader";
import { styles } from "../stylesheet";

type IncomeSourcesListProps = {
  data: IncomeSource[];
  sourceCount: number;
  estimatedMonthlyTotal: number;
  selectedFilter: SourceTypeFilter;
  isDark: boolean;
  scrollBottomSpacing: number;
  theme: {
    searchBg: string;
    searchBorder: string;
    filterText: string;
    cardBg: string;
    cardBorder: string;
    regularityTextColor: string;
  };
  labels: Record<string, string>;
  getSourceTypeLabel: (type: SourceType) => string;
  onFilterChange: (filter: SourceTypeFilter) => void;
  onDelete: (source: IncomeSource) => void;
};

export function IncomeSourcesList({
  data,
  sourceCount,
  estimatedMonthlyTotal,
  selectedFilter,
  isDark,
  scrollBottomSpacing,
  theme,
  labels,
  getSourceTypeLabel,
  onFilterChange,
  onDelete,
}: IncomeSourcesListProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomSpacing }]}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      initialNumToRender={8}
      windowSize={7}
      ListHeaderComponent={
        <IncomeSourcesListHeader
          sourceCount={sourceCount}
          estimatedMonthlyTotal={estimatedMonthlyTotal}
          selectedFilter={selectedFilter}
          isDark={isDark}
          backgroundColor={theme.searchBg}
          borderColor={theme.searchBorder}
          textColor={theme.filterText}
          sourceLabel={labels.source}
          allLabel={labels.all}
          getSourceTypeLabel={getSourceTypeLabel}
          onFilterChange={onFilterChange}
        />
      }
      ListEmptyComponent={
        sourceCount === 0 ? (
          <IncomeSourcesEmptyState
            isSearchEmpty={false}
            title={labels.emptyTitle}
            description={labels.emptySubtext}
          />
        ) : (
          <IncomeSourcesEmptyState
            isSearchEmpty
            title={labels.emptySearchTitle}
            description={labels.emptySearchSubtext}
          />
        )
      }
      renderItem={({ item }) => (
        <EntryCard
          item={item}
          cardBg={theme.cardBg}
          cardBorder={theme.cardBorder}
          regularityTextColor={theme.regularityTextColor}
          onDelete={onDelete}
        />
      )}
    />
  );
}