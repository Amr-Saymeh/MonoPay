/**
 * useSharedWalletLogs.ts
 *
 * SRP: Subscribes to and exposes the wallet's transaction log.
 * DIP: Reads via ISharedWalletRepository — no direct Firebase import.
 */

import { useEffect, useState } from 'react';

import { useSharedWalletRepository } from '../context/SharedWalletRepositoryContext';
import { SharedLog } from '../types';

export interface UseSharedWalletLogsResult {
  logs: SharedLog[];
  loading: boolean;
}

export function useSharedWalletLogs(
  user: { uid: string } | null,
  walletId: number,
): UseSharedWalletLogsResult {
  const repository = useSharedWalletRepository();
  const [logs, setLogs] = useState<SharedLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !Number.isFinite(walletId)) return;

    setLoading(true);

    return repository.subscribeToLogs(
      walletId,
      (data) => {
        setLogs(data);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [repository, user, walletId]);

  return { logs, loading };
}
