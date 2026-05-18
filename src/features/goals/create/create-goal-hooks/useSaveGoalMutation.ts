import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveGoal, type SaveGoalParams } from "../create-goal-services/createGoal.service";
import { goalsQueryKey } from "../../goals-hooks/useGoalsQuery";
import { saveGoalsSnapshotToCache } from "../../goals-services/goals.sqlite";
import type { GoalsSnapshot } from "../../goals-services/goals.service";

export function useSaveGoalMutation(userUid?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Omit<SaveGoalParams, "userUid">) => {
      if (!userUid) throw new Error("Missing user session");
      return saveGoal({ userUid, ...params });
    },
    onSuccess: (savedGoal) => {
      if (!userUid) return;

      const queryKey = goalsQueryKey(userUid);
      const currentSnapshot = queryClient.getQueryData<GoalsSnapshot>(queryKey) ?? {
        goals: [],
        totalSaved: 0,
        totalTarget: 0,
      };
      const goalExists = currentSnapshot.goals.some(
        (goal) => goal.id === savedGoal.id,
      );
      const goals = goalExists
        ? currentSnapshot.goals.map((goal) =>
            goal.id === savedGoal.id ? { ...goal, ...savedGoal } : goal,
          )
        : [savedGoal, ...currentSnapshot.goals];
      const nextSnapshot: GoalsSnapshot = {
        goals,
        totalSaved: goals.reduce(
          (sum, goal) => sum + Number(goal.currentAmount || 0),
          0,
        ),
        totalTarget: goals.reduce(
          (sum, goal) => sum + Number(goal.goalTargetAmount || 0),
          0,
        ),
      };

      queryClient.setQueryData(queryKey, nextSnapshot);
      saveGoalsSnapshotToCache(userUid, nextSnapshot).catch((error) => {
        console.warn("Failed to refresh goals cache after save", error);
      });
    },
  });
}

