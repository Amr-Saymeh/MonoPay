import { useMutation } from "@tanstack/react-query";

import { saveGoal, type SaveGoalParams } from "../create-goal-services/createGoal.service";

export function useSaveGoalMutation(userUid?: string) {
  return useMutation({
    mutationFn: (params: Omit<SaveGoalParams, "userUid">) => {
      if (!userUid) throw new Error("Missing user session");
      return saveGoal({ userUid, ...params });
    },
  });
}

