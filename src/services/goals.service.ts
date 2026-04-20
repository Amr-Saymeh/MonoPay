import {
  onValue,
  push,
  ref,
  remove,
  update,
} from "firebase/database";

import { db } from "@/src/firebaseConfig";

export type GoalRecord = {
  id: string;
  goal?: string;
  goalTargetCurrency?: string;
  goalTargetAmount?: number;
  goalTargetDate?: number;
  currentAmount?: number;
  members?: Record<string, boolean>;
  sharedLogs?: Record<string, any>;
};

export type GoalsSnapshot = {
  goals: GoalRecord[];
  totalSaved: number;
  totalTarget: number;
};

export function normalizeCurrencyCode(value: string | undefined | null): string {
  if (!value) return "";
  const token = value.trim().toLowerCase().split(/\s+/).pop() ?? "";
  return token.replace(/[^a-z]/g, "");
}

export function subscribeUserGoals(
  userUid: string,
  onData: (snapshot: GoalsSnapshot) => void,
): () => void {
  const walletsRef = ref(db, "wallets");
  const unsubscribe = onValue(walletsRef, (snapshot) => {
    const data = snapshot.val() as Record<string, any> | null;
    if (!data) {
      onData({ goals: [], totalSaved: 0, totalTarget: 0 });
      return;
    }

    const goals = Object.entries(data)
      .filter(([, goal]) => goal?.type === "goal" && goal?.members?.[userUid])
      .map(([id, goal]) => ({ id, ...goal })) as GoalRecord[];

    const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.currentAmount || 0), 0);
    const totalTarget = goals.reduce(
      (sum, goal) => sum + Number(goal.goalTargetAmount || 0),
      0,
    );

    onData({ goals, totalSaved, totalTarget });
  });

  return () => unsubscribe();
}

export async function addGoalContribution(params: {
  userUid: string;
  goal: GoalRecord;
  amount: number;
  reason?: string;
}): Promise<void> {
  const { userUid, goal, amount, reason } = params;
  const currency = normalizeCurrencyCode(goal.goalTargetCurrency) || "usd";
  const newAmount = Number(goal.currentAmount || 0) + amount;
  const now = Date.now();
  const txId = push(ref(db, `users/${userUid}/transaction history`)).key;
  if (!txId) throw new Error("Failed to create transaction id");

  await update(ref(db), {
    [`wallets/${goal.id}/currentAmount`]: newAmount,
    [`wallets/${goal.id}/currencies/${currency}`]: newAmount,
    [`wallets/${goal.id}/currancies/${currency}`]: newAmount,
    [`wallets/${goal.id}/sharedLogs/${now}`]: {
      amount,
      currency,
      reason: reason || "",
      userUid,
      createdAt: now,
    },
    [`users/${userUid}/transaction history/${txId}`]: {
      amount,
      currency,
      currancy: currency,
      notes: reason || `Contribution to goal: ${goal.goal || "Goal"}`,
      category: "goal",
      type: "send",
      senderUid: userUid,
      receiverUid: goal.id,
      goalId: goal.id,
      goalTitle: goal.goal || "",
      "transaction date": now,
      createdAt: now,
    },
  });
}

export async function deleteGoal(goalId: string): Promise<void> {
  await remove(ref(db, `wallets/${goalId}`));
}
