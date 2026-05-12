import { IncomeSourcesList } from "../components/IncomeSourcesList";
import { useIncomeSavingsScreen } from "./IncomeSavingsScreenProvider";

export function IncomeSourcesSection() {
  const { labels, sources, view } = useIncomeSavingsScreen();

  return (
    <IncomeSourcesList
      data={sources.data}
      sourceCount={sources.sourceCount}
      estimatedMonthlyTotal={sources.estimatedMonthlyTotal}
      selectedFilter={sources.selectedFilter}
      isDark={view.isDark}
      scrollBottomSpacing={view.scrollBottomSpacing}
      theme={view.theme}
      labels={{
        source: labels.source,
        all: labels.all,
        emptyTitle: labels.emptyTitle,
        emptySubtext: labels.emptySubtext,
        emptySearchTitle: labels.emptySearchTitle,
        emptySearchSubtext: labels.emptySearchSubtext,
      }}
      getSourceTypeLabel={sources.getSourceTypeLabel}
      onFilterChange={sources.onFilterChange}
      onDelete={sources.onDelete}
    />
  );
}
