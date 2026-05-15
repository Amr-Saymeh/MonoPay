import { useCallback, useState } from 'react';

import { useSharedWalletRepository } from '../context/SharedWalletRepositoryContext';
import type { TranslateFn } from '../types';
import { formatCurrency } from '../utils/formatters';

export interface UseAmountTransactionProps {
  user: { uid: string } | null;
  walletId: number;
  t: TranslateFn;
  onSuccess: () => void;
  /** OCP extension point — called after a successful commit with the result. */
  onAfterCommit?: (result: { currentBalance: number; newBalance: number }) => void;
}

export interface ExecuteParams {
  amount: string;
  currency: string | null;
  reason: string;
  isAdd: boolean;
}

export interface TransactionResult {
  success: boolean;
  currentBalance?: number;
  newBalance?: number;
  error?: string;
}

export function useAmountTransaction({
  user,
  walletId,
  t,
  onSuccess,
  onAfterCommit,
}: UseAmountTransactionProps) {
  const repository = useSharedWalletRepository();
  const [saving, setSaving] = useState(false);

  /** Parses a user-typed amount string into a finite positive number, or NaN. */
  const parseAmount = useCallback((value: string): number => {
    const normalized = value.replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN;
  }, []);

  const execute = useCallback(
    async (params: ExecuteParams): Promise<TransactionResult> => {
      if (!user || !Number.isFinite(walletId)) {
        return { success: false, error: 'Invalid user or wallet' };
      }

      const value = parseAmount(params.amount);
      if (Number.isNaN(value)) {
        return { success: false, error: t('invalidAmount') ?? 'Enter a valid amount.' };
      }

      if (!params.currency) {
        return { success: false, error: t('selectCurrency') ?? 'Please select a currency.' };
      }

      const delta = params.isAdd ? value : -value;

      setSaving(true);
      try {
        const result = await repository.runAmountTransaction(walletId, {
          uid: user.uid,
          amount: delta,
          currency: formatCurrency(params.currency),
          reason: params.reason,
        });

        if (!result.success) {
          const errorKey = result.error === 'insufficient_funds' ? 'insufficientFunds' : 'failed';
          return { ...result, error: t(errorKey) ?? result.error };
        }

        onSuccess();
        onAfterCommit?.({ currentBalance: result.currentBalance!, newBalance: result.newBalance! });
        return result;
      } finally {
        setSaving(false);
      }
    },
    [repository, user, walletId, t, onSuccess, onAfterCommit, parseAmount],
  );

  const getAvailableBalance = useCallback(
    async (currency: string | null): Promise<number> => {
      if (!user || !Number.isFinite(walletId) || !currency) return 0;
      try {
        // Re-uses the repo's one-off read via subscribeToWallet would be wasteful;
        // a direct balance fetch is appropriate here. We read once from the repo
        // by temporarily subscribing and immediately unsubscribing.
        return await new Promise((resolve) => {
          const unsub = repository.subscribeToWallet(
            walletId,
            (wallet) => {
              const key = formatCurrency(currency);
              resolve(Number(wallet?.currancies?.[key]) || 0);
              unsub();
            },
          );
        });
      } catch {
        return 0;
      }
    },
    [repository, user, walletId],
  );

  return { saving, execute, getAvailableBalance, parseAmount };
}
