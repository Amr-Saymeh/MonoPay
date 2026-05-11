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
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<GoalsSnapshot>(queryKey) ?? emptyGoalsSnapshot,
      ),
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
    });
  }, [queryClient, queryKey, userUid]);

  return query;
}

export function useAddGoalContributionMutation(userUid?: string) {
  return useMutation({
    mutationFn: (params: { goal: GoalRecord; amount: number; reason?: string }) => {
      if (!userUid) throw new Error("Missing user session");
      return addGoalContribution({ userUid, ...params });
    },
  });
}

export function useDeleteGoalMutation() {
  return useMutation({
    mutationFn: deleteGoal,
  });
}

