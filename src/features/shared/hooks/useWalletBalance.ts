/**
 * useWalletBalance.ts
 *
 * SRP: Derives balance display data from a wallet record — no subscriptions,
 *      no side effects.
 */

import { useMemo } from 'react';

import { WalletRecord } from '../types';
import { getTotalBalance } from '../utils/walletHelpers';

export interface UseWalletBalanceResult {
  balances: Array<[string, number]>;
  totalBalance: number;
  availableCurrencies: string[];
}

export function useWalletBalance(
  wallet: WalletRecord | null | undefined,
): UseWalletBalanceResult {
  const balances = useMemo(
    () =>
      Object.entries(wallet?.currancies ?? {})
        .filter(([key, value]) => key && Number.isFinite(Number(value)))
        .sort(([a], [b]) => a.localeCompare(b)),
    [wallet?.currancies],
  );

  const totalBalance = useMemo(
    () => getTotalBalance(wallet?.currancies),
    [wallet?.currancies],
  );

  const availableCurrencies = useMemo(() => balances.map(([code]) => code), [balances]);

  return { balances, totalBalance, availableCurrencies };
}
