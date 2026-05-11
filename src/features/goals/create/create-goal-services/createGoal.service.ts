import { ref, set, update } from "firebase/database";

import { db } from "@/src/firebaseConfig";

import type { FormValues } from "../constants";

export type SaveGoalParams = {
  userUid: string;
  goalId?: string;
  isEditing: boolean;
  data: FormValues;
};

export async function saveGoal(params: SaveGoalParams): Promise<void> {
  const { userUid, goalId, isEditing, data } = params;
  const timestamp = Date.now();
  const goalPayload = {
    goal: data.title,
    goalTargetAmount: parseFloat(data.targetAmount),
    goalTargetCurrency: data.currency,
    goalTargetDate: data.targetDate ?? timestamp,
    currentAmount: data.currentAmount ? parseFloat(data.currentAmount) : 0,
  };

  if (isEditing && goalId) {
    await update(ref(db, `wallets/${goalId}`), goalPayload);
    return;
  }

  await set(ref(db, `wallets/${timestamp}`), {
    type: "goal",
    ownerUid: userUid,
    ...goalPayload,
    currencies: {
      [data.currency]: data.currentAmount ? parseFloat(data.currentAmount) : 0,
    },
    members: { [userUid]: true },
    sharedLogs: {},
    createdAt: timestamp,
    state: "active",
  });
}
