import { ScrollView } from "react-native";

import { GoalsList } from "../goals-components/GoalsList";
import { GoalsSearch } from "../goals-components/GoalsSearch";
import { GoalsSortControls } from "../goals-components/GoalsSortControls";
import { GoalsSummaryCard } from "../goals-components/GoalsSummaryCard";
import { styles } from "../stylesheet";
import { useGoalsScreen } from "./GoalsScreenProvider";

export function GoalsBodySection() {
  const { actions, goalsList, labels, search, sorting, summary, view } =
    useGoalsScreen();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: view.scrollBottomSpacing },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <GoalsSummaryCard
        totalSaved={summary.formattedTotalSaved}
        remaining={summary.formattedRemaining}
        progress={summary.overallProgress}
        totalSavedLabel={labels.totalSaved}
        addLabel={labels.add}
        progressLabel={labels.progress}
        remainingLabel={labels.remaining}
        onAdd={actions.onCreateGoal}
      />
      <GoalsSearch
        visible={search.enabled}
        value={search.query}
        placeholder={labels.searchPlaceholder}
        isDark={view.isDark}
        backgroundColor={view.theme.searchBg}
        borderColor={view.theme.searchBorder}
        textColor={view.theme.searchText}
        placeholderColor={view.theme.searchPlaceholder}
        onChange={search.onChange}
      />
      <GoalsSortControls
        isDark={view.isDark}
        sortKey={sorting.sortKey}
        sortDir={sorting.sortDir}
        backgroundColor={view.theme.sortSurface}
        borderColor={view.theme.sortBorder}
        textColor={view.theme.sortText}
        title={labels.sortTitle}
        activeLabel={sorting.activeLabel}
        ascLabel={labels.sortAsc}
        descLabel={labels.sortDesc}
        getLabel={sorting.getOptionLabel}
        onSortSelect={sorting.onSelect}
        onDirectionChange={sorting.onDirectionChange}
      />
      <GoalsList
        goals={goalsList.goals}
        visibleGoals={goalsList.visibleGoals}
        userUid={goalsList.userUid}
        emptyTitle={labels.emptyTitle}
        emptySubtext={labels.emptySubtext}
        emptySearchTitle={labels.emptySearchTitle}
        emptySearchSubtext={labels.emptySearchSubtext}
        onContribute={goalsList.onContribute}
        onEdit={goalsList.onEdit}
        onDelete={goalsList.onDelete}
      />
    </ScrollView>
  );
}
