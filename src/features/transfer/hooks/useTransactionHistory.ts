import { useEffect, useState } from "react";
import { get, onValue, ref } from "firebase/database";

import { db } from "@/src/firebaseConfig";
import { TransactionRecord } from "../types";

export interface EnrichedTransaction extends TransactionRecord {
  id: string;
  otherPartyName: string;
}

export function useTransactionHistory(uid: string) {
  const [transactions, setTransactions] = useState<EnrichedTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    // "transaction history" is the literal DB key — the space is intentional
    // and must be preserved to match the existing Firebase schema.
    const txRef = ref(db, `users/${uid}/transaction history`);

    const unsub = onValue(txRef, async (snap) => {
      if (!snap.exists()) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const raw = snap.val() as Record<string, TransactionRecord>;

      // Transaction records store only UIDs to keep writes small. We fetch
      // display names here so the history screen never has to do it itself.
      const enriched = await Promise.all(
        Object.entries(raw).map(async ([id, record]) => {
          const otherUid =
            record.type === "send" ? record.receiverUid : record.senderUid;
          let otherPartyName = "";
          try {
            const userSnap = await get(ref(db, `users/${otherUid}/name`));
            if (userSnap.exists()) otherPartyName = userSnap.val();
          } catch {}
          return { ...record, id, otherPartyName };
        }),
      );

      // Sort newest first so the most recent activity appears at the top
      // of the list without any additional transformation in the UI layer.
      enriched.sort(
        (a, b) => b["transaction date"] - a["transaction date"],
      );

      setTransactions(enriched);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  return { transactions, loading };
}
