import { db } from "@/src/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
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
      setName("");
      return;
    }

    const unsub = onValue(
      ref(db, `users/${user.uid}/userwallet`),
      (snap) => {
        const links = (snap.val() ?? {}) as Record<
          string,
          { walletid?: number; name?: string }
        >;

        const link = Object.values(links).find(
          (item) => Number(item?.walletid) === walletId,
        );

        const label = link?.name?.trim();
        setName(label && label.length > 0 ? label : `Wallet ${walletId}`);
      },
      () => {
        setName(`Wallet ${walletId}`);
      },
    );

    return () => unsub();
  }, [user, walletId]);

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
