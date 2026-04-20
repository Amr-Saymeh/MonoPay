import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { db } from '../../../../src/firebaseConfig';

export interface WalletCard {
  userWalletKey: string;
  walletid: number;
  name: string;
  emoji?: string;
  color?: string;
}

export function useWallets(userId: string | undefined) {
  const [wallets, setWallets] = useState<WalletCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setWallets([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onValue(
      ref(db, `users/${userId}/userwallet`),
      (snapshot) => {
        const data = snapshot.val() || {};
        const walletList: WalletCard[] = Object.entries(data)
          .map(([key, wallet]: [string, any]) => ({
            userWalletKey: key,
            walletid: Number(wallet?.walletid),
            name: wallet?.name?.trim() || `Wallet ${wallet?.walletid}`,
            emoji: wallet?.emoji?.trim() || '💳',
            color: wallet?.color?.trim(),
          }))
          .filter((w) => Number.isFinite(w.walletid) && w.walletid > 0)
          .sort((a, b) => a.walletid - b.walletid);

        setWallets(walletList);
        setLoading(false);
      },
      () => {
        setWallets([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { wallets, loading };
}
