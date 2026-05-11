import { ScrollView } from "react-native";

import type { GoalRecord } from "../goals-services/goals.service";
import type { SortDir, SortKey } from "../constants";
import { GoalsList } from "./GoalsList";
import { GoalsSearch } from "./GoalsSearch";
import { GoalsSortControls } from "./GoalsSortControls";
import { GoalsSummaryCard } from "./GoalsSummaryCard";
import { styles } from "../stylesheet";

type GoalsContentBodyProps = {
  scrollBottomSpacing: number;
  totalSaved: string;
  remaining: string;
  progress: number;
  labels: Record<string, string>;
  onAdd: () => void;
  search: {
    enabled: boolean;
    value: string;
    isDark: boolean;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    placeholderColor: string;
    onChange: (value: string) => void;
  };
  sort: {
    isDark: boolean;
    sortKey: SortKey;
    sortDir: SortDir;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    activeLabel: string;
    getLabel: (key: SortKey) => string;
    onSortSelect: (key: SortKey) => void;
    onDirectionChange: (dir: SortDir) => void;
  };
  goals: GoalRecord[];
  visibleGoals: GoalRecord[];
  userUid?: string;
  onContribute: (goal: GoalRecord) => void;
  onEdit: (goal: GoalRecord) => void;
  onDelete: (goal: GoalRecord) => void;
};

export function GoalsContentBody({
  scrollBottomSpacing,
  totalSaved,
  remaining,
  progress,
  labels,
  onAdd,
  search,
  sort,
  goals,
  visibleGoals,
  userUid,
  onContribute,
  onEdit,
  onDelete,
}: GoalsContentBodyProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: scrollBottomSpacing },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <GoalsSummaryCard
        totalSaved={totalSaved}
        remaining={remaining}
        progress={progress}
        totalSavedLabel={labels.totalSaved}
        addLabel={labels.add}
        progressLabel={labels.progress}
        remainingLabel={labels.remaining}
        onAdd={onAdd}
      />
      <GoalsSearch
        visible={search.enabled}
        value={search.value}
        placeholder={labels.searchPlaceholder}
        isDark={search.isDark}
        backgroundColor={search.backgroundColor}
        borderColor={search.borderColor}
        textColor={search.textColor}
        placeholderColor={search.placeholderColor}
        onChange={search.onChange}
      />
      <GoalsSortControls
        isDark={sort.isDark}
        sortKey={sort.sortKey}
        sortDir={sort.sortDir}
        backgroundColor={sort.backgroundColor}
        borderColor={sort.borderColor}
        textColor={sort.textColor}
        title={labels.sortTitle}
        activeLabel={sort.activeLabel}
        ascLabel={labels.sortAsc}
        descLabel={labels.sortDesc}
        getLabel={sort.getLabel}
        onSortSelect={sort.onSortSelect}
        onDirectionChange={sort.onDirectionChange}
      />
      <GoalsList
        goals={goals}
        visibleGoals={visibleGoals}
        userUid={userUid}
        emptyTitle={labels.emptyTitle}
        emptySubtext={labels.emptySubtext}
        emptySearchTitle={labels.emptySearchTitle}
        emptySearchSubtext={labels.emptySearchSubtext}
        onContribute={onContribute}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </ScrollView>
  );
}
