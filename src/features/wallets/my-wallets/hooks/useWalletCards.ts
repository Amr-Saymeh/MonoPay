import { useEffect, useState } from "react";

import { onValue, ref } from "firebase/database";

import { db } from "@/src/firebaseConfig";

import type { UserWalletLink, WalletCard, WalletRecord } from "../types";
import { getDefaultColor } from "../utils";

type UseWalletCardsParams = {
  userId?: string;
};

export function useWalletCards({ userId }: UseWalletCardsParams) {
  const [loading, setLoading] = useState(true);
  const [userWallets, setUserWallets] = useState<Record<string, UserWalletLink>>({});
  const [wallets, setWallets] = useState<Record<string, WalletRecord>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserWallets({});
      setWallets({});
      setSelectedKey(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onValue(
      ref(db, `users/${userId}/userwallet`),
      (snapshot) => {
        setUserWallets((snapshot.val() ?? {}) as Record<string, UserWalletLink>);
        setLoading(false);
      },
      () => {
        setUserWallets({});
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const walletIds = Array.from(
      new Set(
        Object.values(userWallets)
          .map((wallet) => Number(wallet?.walletid))
          .filter((walletId) => Number.isFinite(walletId) && walletId > 0) as number[],
      ),
    ).sort((a, b) => a - b);

    if (walletIds.length === 0) {
      setWallets({});
      return;
    }

    const unsubscribes = walletIds.map((walletId) => {
      const walletKey = `wallet${walletId}`;

      return onValue(
        ref(db, `wallets/${walletKey}`),
        (snapshot) => {
          const value = snapshot.val() as WalletRecord | null;
          setWallets((current) => {
            const next = { ...current };
            if (value) {
              next[walletKey] = value;
            } else {
              delete next[walletKey];
            }
            return next;
          });
        },
        () => {
          setWallets((current) => {
            const next = { ...current };
            delete next[walletKey];
            return next;
          });
        },
      );
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [userWallets]);

  const cards: WalletCard[] = (() => {
    const list = Object.entries(userWallets)
      .map(([userWalletKey, link]) => {
        const walletid = Number(link?.walletid);
        if (!Number.isFinite(walletid) || walletid <= 0) return null;

        const wallet = wallets[`wallet${walletid}`];

        return {
          userWalletKey,
          walletid,
          name: link?.name?.trim() || `Wallet ${walletid}`,
          emoji: link?.emoji?.trim() || "💳",
          color: link?.color?.trim() || getDefaultColor(wallet?.type),
          wallet,
        };
      })
      .filter(Boolean) as WalletCard[];

    list.sort((a, b) => a.walletid - b.walletid);
    return list;
  })();

  useEffect(() => {
    if (cards.length === 0) {
      if (selectedKey !== null) setSelectedKey(null);
      return;
    }

    if (!selectedKey || !cards.some((card) => card.userWalletKey === selectedKey)) {
      setSelectedKey(cards[0].userWalletKey);
    }
  }, [cards, selectedKey]);

  const selected =
    !selectedKey ? null : (cards.find((card) => card.userWalletKey === selectedKey) ?? null);

  const selectedIndex =
    !selectedKey ? -1 : cards.findIndex((card) => card.userWalletKey === selectedKey);

  const mainWallet = (() => {
    const byKey = cards.find((card) => card.userWalletKey === "wallet1");
    if (byKey) return byKey;

    const byName = cards.find((card) => card.name.trim().toLowerCase() === "main wallet");
    if (byName) return byName;

    return cards[0] ?? null;
  })();

  return {
    cards,
    loading,
    mainWallet,
    selected,
    selectedIndex,
    selectedKey,
    setSelectedKey,
    userWallets,
  };
}
