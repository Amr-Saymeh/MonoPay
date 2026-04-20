import { useState, useCallback } from "react";
import { ref, runTransaction, update, push } from "firebase/database";
import { db } from "@/src/firebaseConfig";
import { Alert } from "react-native";

interface UseAmountTransactionProps {
  user: { uid: string } | null;
  walletId: number;
  t: (key: string) => string | undefined;
  onSuccess: () => void;
}

interface ExecuteParams {
  amount: string;
  currency: string | null;
  reason: string;
  isAdd: boolean;
}

interface TransactionResult {
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
}: UseAmountTransactionProps) {
  const [saving, setSaving] = useState(false);

  const parseAmount = useCallback((value: string): number => {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN;
  }, []);

  const formatCurrency = useCallback((code: string): string => {
    return code.trim().toUpperCase();
  }, []);

  const execute = useCallback(
    async (params: ExecuteParams): Promise<TransactionResult> => {
      if (!user || !Number.isFinite(walletId)) {
        return { success: false, error: "Invalid user or wallet" };
      }

      const value = parseAmount(params.amount);
      if (Number.isNaN(value)) {
        return {
          success: false,
          error: t("invalidAmount") ?? "Enter a valid amount.",
        };
      }

      if (!params.currency) {
        return {
          success: false,
          error: t("selectCurrency") ?? "Please select a currency.",
        };
      }

      const walletKey = `wallet${walletId}`;
      const key = formatCurrency(params.currency);
      const delta = params.isAdd ? value : -value;
      const currencyRef = ref(db, `wallets/${walletKey}/currancies/${key}`);

      setSaving(true);

      try {
        let currentBalance = 0;
        let newBalance = 0;
        let transactionCommitted = false;

        const result = await runTransaction(currencyRef, (currentValue) => {
          currentBalance = Number(currentValue) || 0;
          newBalance = currentBalance + delta;

          if (newBalance < 0) {
            return undefined; // Abort transaction
          }

          transactionCommitted = true;
          return newBalance;
        });

        if (!result.committed) {
          return {
            success: false,
            error: t("insufficientFunds") ?? "Not enough balance.",
            currentBalance,
          };
        }

        // Log the transaction
        const logsRef = ref(db, `wallets/${walletKey}/sharedLogs`);
        const logRef = push(logsRef);
        await update(ref(db), {
          [`wallets/${walletKey}/sharedLogs/${logRef.key}`]: {
            userUid: user.uid,
            amount: delta,
            currency: key,
            reason: params.reason.trim() || (params.isAdd ? "Add money" : "Spend"),
            createdAt: Date.now(),
          },
        });

        onSuccess();
        return { success: true, currentBalance, newBalance };
      } catch (e) {
        console.error("[useAmountTransaction] Error:", e);
        return {
          success: false,
          error: e instanceof Error ? e.message : "Transaction failed",
        };
      } finally {
        setSaving(false);
      }
    },
    [user, walletId, t, onSuccess, parseAmount, formatCurrency]
  );

  const getAvailableBalance = useCallback(
    async (currency: string | null): Promise<number> => {
      if (!user || !Number.isFinite(walletId) || !currency) return 0;

      try {
        const { get } = await import("firebase/database");
        const walletKey = `wallet${walletId}`;
        const key = formatCurrency(currency);
        const snap = await get(
          ref(db, `wallets/${walletKey}/currancies/${key}`)
        );
        return Number(snap.val()) || 0;
      } catch {
        return 0;
      }
    },
    [user, walletId, formatCurrency]
  );

  return {
    saving,
    execute,
    getAvailableBalance,
    parseAmount,
  };
}
