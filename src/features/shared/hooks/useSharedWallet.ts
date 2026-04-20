import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/src/firebaseConfig";
import { WalletRecord } from "../types";

interface UseSharedWalletResult {
  wallet: WalletRecord | null;
  loading: boolean;
  name: string;
  goal: string;
  memberUids: string[];
  setGoal: (goal: string) => void;
}

export function useSharedWallet(
  user: { uid: string } | null,
  walletId: number
): UseSharedWalletResult {
  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [memberUids, setMemberUids] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !Number.isFinite(walletId)) {
      setLoading(false);
      return;
    }
    const walletKey = `wallet${walletId}`;
    const unsub = onValue(
      ref(db, `wallets/${walletKey}`),
      (snap) => {
        const value = (snap.val() ?? null) as WalletRecord | null;
        if (!value || String(value.type ?? "") !== "shared") {
          setWallet(null);
          setLoading(false);
          return;
        }
        setWallet(value);
        setName(`Wallet ${walletId}`);
        setGoal(value.goal ?? "");
        setMemberUids(Object.keys(value.members ?? {}));
        setLoading(false);
      },
      () => {
        setWallet(null);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user, walletId]);

  return { wallet, loading, name, goal, memberUids, setGoal };
}
