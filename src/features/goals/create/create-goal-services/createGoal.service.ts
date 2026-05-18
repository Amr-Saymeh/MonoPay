import { ref, set, update } from "firebase/database";

import { db } from "@/src/firebaseConfig";

import type { GoalRecord } from "../../goals-services/goals.service";
import { upsertCachedGoal } from "../../goals-services/goals.sqlite";
import type { FormValues } from "../constants";

export type SaveGoalParams = {
  userUid: string;
  goalId?: string;
  isEditing: boolean;
  data: FormValues;
};

async function syncGoalToFirebase(params: {
  goalId: string;
  userUid: string;
  isEditing: boolean;
  goalPayload: Omit<GoalRecord, "id" | "members" | "sharedLogs">;
  currentAmount: number;
}): Promise<void> {
  const { goalId, userUid, isEditing, goalPayload, currentAmount } = params;

  if (isEditing) {
    await update(ref(db, `wallets/${goalId}`), goalPayload);
    return;
  }

  await set(ref(db, `wallets/${goalId}`), {
    type: "goal",
    ownerUid: userUid,
    ...goalPayload,
    currencies: {
      [goalPayload.goalTargetCurrency || "usd"]: currentAmount,
    },
    members: { [userUid]: true },
    sharedLogs: {},
    createdAt: Number(goalId),
    state: "active",
  });
}

export async function saveGoal(params: SaveGoalParams): Promise<GoalRecord> {
  const { userUid, goalId, isEditing, data } = params;
  const timestamp = Date.now();
  const shouldEditExistingGoal = isEditing && Boolean(goalId);
  const nextGoalId = shouldEditExistingGoal && goalId ? goalId : String(timestamp);
  const currentAmount = data.currentAmount ? parseFloat(data.currentAmount) : 0;
  const goalPayload = {
    goal: data.title,
    goalTargetAmount: parseFloat(data.targetAmount),
    goalTargetCurrency: data.currency,
    goalTargetDate: data.targetDate ?? timestamp,
    currentAmount,
  };

  const cachedGoal = await upsertCachedGoal(userUid, {
    id: nextGoalId,
    ...goalPayload,
    members: { [userUid]: true },
  });

  syncGoalToFirebase({
    goalId: nextGoalId,
    userUid,
    isEditing: shouldEditExistingGoal,
    goalPayload,
    currentAmount,
  }).catch((error) => {
    console.warn("Goal saved locally, but Firebase sync failed", error);
  });

  return cachedGoal;
}
