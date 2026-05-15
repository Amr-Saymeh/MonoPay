/**
 * useAmountModalState.ts
 *
 * SRP: Owns only the UI state for the amount-entry modal.
 *      (visibility, amount string, currency, reason, isAdd flag)
 *
 * Extracted from useSharedWalletScreen which had too many responsibilities.
 */

import { useCallback, useEffect, useState } from 'react';

export interface AmountModalState {
  visible: boolean;
  amount: string;
  currency: string | null;
  reason: string;
  isAdd: boolean;
}

export interface UseAmountModalStateResult extends AmountModalState {
  setAmount: (value: string) => void;
  setCurrency: (value: string | null) => void;
  setReason: (value: string) => void;
  open: (isAdd: boolean, currency?: string) => void;
  close: () => void;
  reset: () => void;
}

export function useAmountModalState(availableCurrencies: string[]): UseAmountModalStateResult {
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isAdd, setIsAdd] = useState(true);

  // Auto-select first available currency when list becomes available.
  useEffect(() => {
    if (!currency && availableCurrencies.length > 0) {
      setCurrency(availableCurrencies[0]);
    }
  }, [currency, availableCurrencies]);

  const reset = useCallback(() => {
    setAmount('');
    setReason('');
  }, []);

  const open = useCallback(
    (nextIsAdd: boolean, preferredCurrency?: string) => {
      setIsAdd(nextIsAdd);
      reset();
      setCurrency(preferredCurrency ?? availableCurrencies[0] ?? null);
      setVisible(true);
    },
    [availableCurrencies, reset],
  );

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  return {
    visible,
    amount,
    setAmount,
    currency,
    setCurrency,
    reason,
    setReason,
    isAdd,
    open,
    close,
    reset,
  };
}
