import { onValue, push, ref, remove, set } from "firebase/database";

import { db } from "@/src/firebaseConfig";
import { addBalanceToWalletCurrency } from "@/src/services/wallets.service";

export type Regularity = "daily" | "weekly" | "monthly" | "yearly";
export type SourceType = "salary" | "loan" | "freelance" | "investment" | "other";

export type IncomeSource = {
  id: string;
  type: SourceType;
  amount: number;
  currency: string;
  walletid: number;
  walletName: string;
  regularity: Regularity;
  notes?: string;
  createdAt: number;
};

export type CreateIncomeSourceParams = {
  userUid: string;
  type: SourceType;
  amount: number;
  currency: string;
  walletid: number;
  walletKey: string;
  walletName: string;
  regularity: Regularity;
  notes?: string;
};

export function subscribeIncomeSources(
  userUid: string,
  onData: (sources: IncomeSource[]) => void,
): () => void {
  const incomeSourcesRef = ref(db, `users/${userUid}/incomeSources`);
  const unsubscribe = onValue(incomeSourcesRef, (snap) => {
    const data = snap.val() as Record<string, Omit<IncomeSource, "id">> | null;
    if (!data) {
      onData([]);
      return;
    }

    const list = Object.entries(data)
      .map(([id, row]) => ({ id, ...row }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    onData(list);
  });

  return () => unsubscribe();
}

export async function createIncomeSourceAndFundWallet(
  params: CreateIncomeSourceParams,
): Promise<void> {
  const now = Date.now();
  const {
    userUid,
    type,
    amount,
    currency,
    walletid,
    walletKey,
    walletName,
    regularity,
    notes,
  } = params;

  await addBalanceToWalletCurrency(walletKey, currency, amount);

  const newSourceRef = push(ref(db, `users/${userUid}/incomeSources`));
  await set(newSourceRef, {
    type,
    amount,
    currency,
    walletid,
    walletName,
    regularity,
    notes: notes?.trim() || "",
    createdAt: now,
  });
}

export async function deleteIncomeSource(
  userUid: string,
  sourceId: string,
): Promise<void> {
  await remove(ref(db, `users/${userUid}/incomeSources/${sourceId}`));
}
