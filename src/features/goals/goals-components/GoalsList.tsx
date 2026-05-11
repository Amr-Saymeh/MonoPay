import { GoalCard } from "./GoalCard";
import { ThemedText } from "@/components/themed-text";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";

import type { GoalRecord } from "../goals-services/goals.service";
import { normalizeCurrencyCode } from "../goals-services/goals.service";
import {
  GOALS_EMPTY_ICON_COLOR,
  GOALS_EMPTY_SEARCH_ICON_COLOR,
} from "../constants";
import { styles } from "../stylesheet";

type GoalsListProps = {
  goals: GoalRecord[];
  visibleGoals: GoalRecord[];
  userUid?: string;
  emptyTitle: string;
  emptySubtext: string;
  emptySearchTitle: string;
  emptySearchSubtext: string;
  onContribute: (goal: GoalRecord) => void;
  onEdit: (goal: GoalRecord) => void;
  onDelete: (goal: GoalRecord) => void;
};

export function GoalsList({
  goals,
  visibleGoals,
  userUid,
  emptyTitle,
  emptySubtext,
  emptySearchTitle,
  emptySearchSubtext,
  onContribute,
  onEdit,
  onDelete,
}: GoalsListProps) {
  if (goals.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="savings" size={52} color={GOALS_EMPTY_ICON_COLOR} />
        <ThemedText style={styles.emptyTitle}>{emptyTitle}</ThemedText>
        <ThemedText style={styles.emptySubtext}>{emptySubtext}</ThemedText>
      </View>
    );
  }

  if (visibleGoals.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="search-off" size={46} color={GOALS_EMPTY_SEARCH_ICON_COLOR} />
        <ThemedText style={styles.emptyTitle}>{emptySearchTitle}</ThemedText>
        <ThemedText style={styles.emptySubtext}>{emptySearchSubtext}</ThemedText>
      </View>
    );
  }

  return (
    <>
      {visibleGoals.map((goal) => (
        <GoalCard
          key={goal.id}
          id={goal.id}
          title={goal.goal ?? ""}
          currentAmount={goal.currentAmount || 0}
          targetAmount={goal.goalTargetAmount ?? 0}
          targetCurrency={goal.goalTargetCurrency ?? "usd"}
          targetDate={goal.goalTargetDate ?? 0}
          myContributions={Object.entries(goal.sharedLogs ?? {})
            .filter(
              ([, log]: [string, any]) => !log?.userUid || log.userUid === userUid,
            )
            .map(([logKey, log]: [string, any]) => ({
              amount: Number(log?.amount ?? 0),
              currency: String(
                log?.currency ||
                  normalizeCurrencyCode(goal.goalTargetCurrency) ||
                  "usd",
              ),
              createdAt: Number(log?.createdAt ?? logKey ?? 0),
              reason: String(log?.reason || ""),
            }))
            .filter((log: any) => Number.isFinite(log.amount) && log.amount > 0)
            .sort((a: any, b: any) => b.createdAt - a.createdAt)}
          onContribute={() => onContribute(goal)}
          onEdit={() => onEdit(goal)}
          onDelete={() => onDelete(goal)}
        />
      ))}
    </>
  );
}

