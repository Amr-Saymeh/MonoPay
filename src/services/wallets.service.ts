import { onValue, ref, runTransaction } from "firebase/database";

import { db } from "@/src/firebaseConfig";

export type UserWalletLink = {
  name?: string;
  walletid?: number;
};

export type WalletRecord = {
  currancies?: Record<string, number>;
  currencies?: Record<string, number>;
  state?: string;
};

export function subscribeUserWalletLinks(
  userUid: string,
  onData: (links: Record<string, UserWalletLink>) => void,
): () => void {
  const walletLinksRef = ref(db, `users/${userUid}/userwallet`);
  const unsubscribe = onValue(walletLinksRef, (snap) => {
    onData((snap.val() ?? {}) as Record<string, UserWalletLink>);
  });

  return () => unsubscribe();
}

export function subscribeWalletsByIds(
  walletIds: number[],
  onData: (wallets: Record<string, WalletRecord>) => void,
): () => void {
  if (walletIds.length === 0) {
    onData({});
    return () => {};
  }

  const currentWallets: Record<string, WalletRecord> = {};
  const unsubs = walletIds.map((id) => {
    const walletKey = `wallet${id}`;
    return onValue(ref(db, `wallets/${walletKey}`), (snap) => {
      const value = (snap.val() ?? null) as WalletRecord | null;
      if (value) currentWallets[walletKey] = value;
      else delete currentWallets[walletKey];
      onData({ ...currentWallets });
    });
  });

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
}

export async function addBalanceToWalletCurrency(
  walletKey: string,
  currencyCode: string,
  amount: number,
): Promise<void> {
  const normalizedCode = currencyCode.trim().toLowerCase();
  await runTransaction(ref(db, `wallets/${walletKey}`), (wallet) => {
    const currentWallet =
      wallet && typeof wallet === "object" ? { ...(wallet as Record<string, any>) } : {};

    const curranciesMap =
      currentWallet.currancies && typeof currentWallet.currancies === "object"
        ? { ...currentWallet.currancies }
        : null;
    const currenciesMap =
      currentWallet.currencies && typeof currentWallet.currencies === "object"
        ? { ...currentWallet.currencies }
        : null;

    const existingFromCurrancies = Number(curranciesMap?.[normalizedCode]);
    const existingFromCurrencies = Number(currenciesMap?.[normalizedCode]);
    const base = Number.isFinite(existingFromCurrancies)
      ? existingFromCurrancies
      : Number.isFinite(existingFromCurrencies)
        ? existingFromCurrencies
        : 0;
    const nextValue = base + amount;

    if (curranciesMap) {
      curranciesMap[normalizedCode] = nextValue;
      currentWallet.currancies = curranciesMap;
    }
    if (currenciesMap) {
      currenciesMap[normalizedCode] = nextValue;
      currentWallet.currencies = currenciesMap;
    }

    if (!curranciesMap && !currenciesMap) {
      currentWallet.currancies = { [normalizedCode]: nextValue };
    }

    return currentWallet;
  });
}
