import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/src/firebaseConfig";
import { SharedLog } from "../types";

interface UseSharedWalletLogsResult {
  logs: SharedLog[];
  loading: boolean;
}

export function useSharedWalletLogs(
  user: { uid: string } | null,
  walletId: number
): UseSharedWalletLogsResult {
  const [logs, setLogs] = useState<SharedLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !Number.isFinite(walletId)) return;
    setLoading(true);
    const walletKey = `wallet${walletId}`;
    const unsub = onValue(
      ref(db, `wallets/${walletKey}/sharedLogs`),
      (snap) => {
        const raw = (snap.val() ?? {}) as Record<string, any>;
        const list: SharedLog[] = Object.entries(raw)
          .map(([id, v]) => ({
            id,
            userUid: String(v.userUid ?? ""),
            amount: Number(v.amount) || 0,
            currency: String(v.currency ?? "").toLowerCase(),
            reason: String(v.reason ?? ""),
            createdAt: Number(v.createdAt) || 0,
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setLogs(list);
        setLoading(false);
      },
      () => {
        setLogs([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user, walletId]);

  return { logs, loading };
}
