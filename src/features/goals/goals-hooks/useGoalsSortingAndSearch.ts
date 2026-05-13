import { hapticSelection } from "@/src/utils/haptics";
import type { useI18n } from "@/hooks/use-i18n";
import { useCallback, useState } from "react";

import {
  SORT_OPTIONS,
  sortGoals,
  type SortDir,
  type SortKey,
} from "../constants";
import type { GoalRecord } from "../goals-services/goals.service";

type I18nT = ReturnType<typeof useI18n>["t"];

export function useGoalsSortingAndSearch(goals: GoalRecord[], t: I18nT) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const visibleGoals = sortGoals(goals, sortKey, sortDir).filter((goal) =>
    goals.length > 3 && searchQuery.trim()
      ? String(goal.goal ?? "")
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      : true,
  );
  const activeSortOption = SORT_OPTIONS.find((option) => option.key === sortKey)!;

  const getSortOptionLabel = useCallback(
    (key: SortKey) => {
      if (key === "date") return t("goals.targetDate");
      if (key === "progress") return t("goals.sort.progress");
      if (key === "targetAmount") return t("goals.targetAmount");
      return t("goals.sort.amountSaved");
    },
    [t],
  );

  const handleSortSelect = (key: SortKey) => {
    hapticSelection();
    if (key !== sortKey) {
      setSortKey(key);
      setSortDir(SORT_OPTIONS.find((option) => option.key === key)!.defaultDir);
    }
  };

  return {
    search: {
      enabled: goals.length > 3,
      query: searchQuery,
      onChange: setSearchQuery,
    },
    sorting: {
      sortKey,
      sortDir,
      activeLabel: getSortOptionLabel(activeSortOption.key),
      getOptionLabel: getSortOptionLabel,
      onSelect: handleSortSelect,
      onDirectionChange: setSortDir,
    },
    visibleGoals,
  };
}
