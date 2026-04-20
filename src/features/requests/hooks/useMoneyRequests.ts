import { get, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";

import { db } from "@/src/firebaseConfig";

export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface MoneyRequestItem {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currancy: string;
  category: string;
  note: string;
  status: RequestStatus;
  createdAt: number;
  decidedAt?: number;
  // enriched
  otherPartyName?: string;
  otherPartyNumber?: string;
}

export function useMoneyRequests(currentUid: string) {
  const [received, setReceived] = useState<MoneyRequestItem[]>([]);
  const [sent, setSent] = useState<MoneyRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUid) return;

    const requestsRef = ref(db, `users/${currentUid}/moneyRequests`);

    const unsub = onValue(requestsRef, async (snap) => {
      if (!snap.exists()) {
        setReceived([]);
        setSent([]);
        setLoading(false);
        return;
      }

      const raw = snap.val() as Record<string, Omit<MoneyRequestItem, "id">>;
      const items: MoneyRequestItem[] = Object.entries(raw).map(
        ([id, data]) => ({ id, ...data }),
      );

      // جيب أسماء المستخدمين الآخرين
      const enriched = await Promise.all(
        items.map(async (item) => {
          const otherUid =
            item.fromUserId === currentUid ? item.toUserId : item.fromUserId;
          try {
            const userSnap = await get(ref(db, `users/${otherUid}`));
            if (userSnap.exists()) {
              const user = userSnap.val();
              return {
                ...item,
                otherPartyName: user.name ?? "Unknown",
                otherPartyNumber: user.number ? String(user.number) : undefined,
              };
            }
          } catch {}
          return item;
        }),
      );

      // Received = أنا الدافع (toUserId)
      setReceived(
        enriched
          .filter((i) => i.toUserId === currentUid)
          .sort((a, b) => b.createdAt - a.createdAt),
      );

      // Sent = أنا الطالب (fromUserId)
      setSent(
        enriched
          .filter((i) => i.fromUserId === currentUid)
          .sort((a, b) => b.createdAt - a.createdAt),
      );

      setLoading(false);
    });

    return () => unsub();
  }, [currentUid]);

  return { received, sent, loading };
}
