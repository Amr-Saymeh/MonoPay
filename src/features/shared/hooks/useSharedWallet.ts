/**
 * useSharedWallet.ts
 *
 * SRP: Subscribes to wallet data (members, goal, balances) and the wallet's
 *      display name from the user's own profile.
 *
 * DIP: Reads via ISharedWalletRepository — no direct Firebase import.
 */

import { useEffect, useState } from 'react';

import { useSharedWalletRepository } from '../context/SharedWalletRepositoryContext';
import { WalletRecord } from '../types';

export interface UseSharedWalletResult {
  wallet: WalletRecord | null;
  loading: boolean;
  name: string;
  goal: string;
  memberUids: string[];
  setGoal: (goal: string) => void;
}

export function useSharedWallet(
  user: { uid: string } | null,
  walletId: number,
): UseSharedWalletResult {
  const repository = useSharedWalletRepository();
  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [memberUids, setMemberUids] = useState<string[]>([]);

  // Subscribe to the user's wallet-link (to get the wallet display name).
  useEffect(() => {
    if (!user || !Number.isFinite(walletId)) {
      setName('');
      return;
    }
    return repository.subscribeToWalletName(user.uid, walletId, setName);
  }, [repository, user, walletId]);

  // Subscribe to the live wallet document.
  useEffect(() => {
    if (!user || !Number.isFinite(walletId)) {
      setLoading(false);
      return;
    }

    return repository.subscribeToWallet(
      walletId,
      (value) => {
        setWallet(value);
        if (value) {
          setGoal(value.goal ?? '');
          setMemberUids(Object.keys(value.members ?? {}));
        }
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [repository, user, walletId]);

  return { wallet, loading, name, goal, memberUids, setGoal };
}
