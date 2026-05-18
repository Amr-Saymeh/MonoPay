import { get, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";

import { db } from "@/src/firebaseConfig";

export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface MoneyRequestItem {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  // "currancy" is an intentional typo that matches the field name in the Firebase DB.
  // Do not rename — changing it here will break reads against the existing schema.
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

      // Request records only store UIDs. We fetch the other party's name and
      // phone number here so the list screen can display them without extra calls.
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

      // transferService writes each request to both the sender's and the
      // recipient's moneyRequests node, so every request appears in both
      // users' lists. We split here by role:
      // toUserId = the user being asked to pay (received tab)
      setReceived(
        enriched
          .filter((i) => i.toUserId === currentUid)
          .sort((a, b) => b.createdAt - a.createdAt),
      );

      // fromUserId = the user who initiated the request (sent tab)
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
