import { useEffect, useState } from "react";

import { get, onValue, ref } from "firebase/database";

import { db } from "@/src/firebaseConfig";
import { Wallet } from "../types/index";

export interface EnrichedWalletSlot {
  slotKey: string;
  slotName: string;
  walletKey: string;
  walletId: number;
  color?: string;
  emoji?: string;
  wallet?: Wallet;
}

interface UseUserWalletsResult {
  wallets: EnrichedWalletSlot[];
  loading: boolean;
  error: string | null;
}

export function useUserWallets(userUid: string | null): UseUserWalletsResult {
  const [wallets, setWallets] = useState<EnrichedWalletSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userUid) {
      setWallets([]);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubs: (() => void)[] = [];

    get(ref(db, `users/${userUid}/userwallet`))
      .then((snap) => {
        if (!snap.exists()) {
          setWallets([]);
          setLoading(false);
          return;
        }

        const raw = snap.val() as Record<
          string,
          {
            name: string;
            walletid?: number;
            id?: number;
            color?: string;
            emoji?: string;
          }
        >;

        const entries = Object.entries(raw);

        entries.forEach(([slotKey, slot]) => {
          const walletId = slot.walletid ?? slot.id;
          if (walletId === undefined) return;

          const walletKey = `wallet${walletId}`;

          const unsub = onValue(ref(db, `wallets/${walletKey}`), (wSnap) => {
            const wallet: Wallet | undefined = wSnap.exists()
              ? wSnap.val()
              : undefined;

            setWallets((prev) => {
              const others = prev.filter((w) => w.slotKey !== slotKey);
              if (!wallet || wallet.state !== "active") return others;
              return [
                ...others,
                {
                  slotKey,
                  slotName: slot.name,
                  walletKey,
                  walletId,
                  color: slot.color,
                  emoji: slot.emoji,
                  wallet,
                },
              ].sort((a, b) => a.slotKey.localeCompare(b.slotKey));
            });

            setLoading(false);
          });

          unsubs.push(unsub);
        });
      })
      .catch((e) => {
        console.error("[useUserWallets]", e);
        setError("Failed to load wallets");
        setLoading(false);
      });

    return () => unsubs.forEach((u) => u());
  }, [userUid]);

  return { wallets, loading, error };
}
