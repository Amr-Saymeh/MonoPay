import { useEffect, useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addGoalContribution,
  deleteGoal,
  subscribeUserGoals,
  type GoalRecord,
  type GoalsSnapshot,
} from "../goals-services/goals.service";
import {
  addCachedGoalContribution,
  getCachedGoalsSnapshot,
  deleteCachedGoal,
  saveGoalsSnapshotToCache,
} from "../goals-services/goals.sqlite";

const emptyGoalsSnapshot: GoalsSnapshot = {
  goals: [],
  totalSaved: 0,
  totalTarget: 0,
};

export const goalsQueryKey = (userUid?: string) => ["goals", userUid] as const;

export function useGoalsQuery(userUid?: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => goalsQueryKey(userUid), [userUid]);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userUid) return emptyGoalsSnapshot;

      const cachedSnapshot = await getCachedGoalsSnapshot(userUid);
      return (
        cachedSnapshot ??
        queryClient.getQueryData<GoalsSnapshot>(queryKey) ??
        emptyGoalsSnapshot
      );
    },
    enabled: Boolean(userUid),
    initialData: emptyGoalsSnapshot,
  });

  useEffect(() => {
    if (!userUid) {
      queryClient.setQueryData(queryKey, emptyGoalsSnapshot);
      return;
    }

    return subscribeUserGoals(userUid, (snapshot) => {
      queryClient.setQueryData(queryKey, snapshot);
      saveGoalsSnapshotToCache(userUid, snapshot).catch((error) => {
        console.warn("Failed to cache goals snapshot", error);
      });
    });
  }, [queryClient, queryKey, userUid]);

  return query;
}

export function useAddGoalContributionMutation(userUid?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      goal: GoalRecord;
      amount: number;
      reason?: string;
    }) => {
      if (!userUid) throw new Error("Missing user session");

      const updatedGoal = await addCachedGoalContribution({
        userUid,
        ...params,
      });

      addGoalContribution({ userUid, ...params }).catch((error) => {
        console.warn("Goal contribution saved locally, but Firebase sync failed", error);
      });

      return updatedGoal;
    },
    onSuccess: (updatedGoal) => {
      if (!userUid) return;

      const queryKey = goalsQueryKey(userUid);
      const currentSnapshot = queryClient.getQueryData<GoalsSnapshot>(queryKey) ?? {
        goals: [],
        totalSaved: 0,
        totalTarget: 0,
      };
      const goalExists = currentSnapshot.goals.some(
        (goal) => goal.id === updatedGoal.id,
      );
      const goals = goalExists
        ? currentSnapshot.goals.map((goal) =>
            goal.id === updatedGoal.id ? { ...goal, ...updatedGoal } : goal,
          )
        : [updatedGoal, ...currentSnapshot.goals];
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
        console.warn("Failed to refresh goals cache after contribution", error);
      });
    },
  });
}

export function useDeleteGoalMutation(userUid?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      if (!userUid) throw new Error("Missing user session");

      await deleteCachedGoal(userUid, goalId);

      deleteGoal(goalId).catch((error) => {
        console.warn("Goal deleted locally, but Firebase sync failed", error);
      });

      return goalId;
    },
    onSuccess: (goalId) => {
      if (!userUid) return;

      const queryKey = goalsQueryKey(userUid);
      const currentSnapshot = queryClient.getQueryData<GoalsSnapshot>(queryKey);
      if (!currentSnapshot) return;

      const goals = currentSnapshot.goals.filter((goal) => goal.id !== goalId);
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
        console.warn("Failed to refresh goals cache after delete", error);
      });
    },
  });
}

