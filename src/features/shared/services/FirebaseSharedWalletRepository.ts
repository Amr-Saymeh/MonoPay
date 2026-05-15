/**
 * FirebaseSharedWalletRepository.ts
 *
 * Concrete Firebase implementation of ISharedWalletRepository.
 *
 * DIP: This is the ONLY file that imports Firebase SDK.
 * All business logic (hooks, services) depends on the interface, not this class.
 *
 * OCP: To switch backend (e.g. REST API, Supabase) — create a new class
 *      implementing ISharedWalletRepository. Zero other files change.
 */

import { db } from '@/src/firebaseConfig';
import { get, onValue, push, ref, runTransaction, update } from 'firebase/database';
import { SharedLog, WalletRecord } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getNextUserWalletKey } from '../utils/walletHelpers';
import {
  ISharedWalletRepository,
  TransactionParams,
  TransactionResult,
} from './ISharedWalletRepository';

export class FirebaseSharedWalletRepository implements ISharedWalletRepository {
  // ─── Subscriptions ────────────────────────────────────────────────────────

  subscribeToWallet(
    walletId: number,
    onData: (wallet: WalletRecord | null) => void,
    onError?: () => void,
  ): () => void {
    const walletKey = `wallet${walletId}`;
    const unsub = onValue(
      ref(db, `wallets/${walletKey}`),
      (snap) => {
        const value = (snap.val() ?? null) as WalletRecord | null;
        if (!value || String(value.type ?? '') !== 'shared') {
          onData(null);
          return;
        }
        onData(value);
      },
      () => {
        onData(null);
        onError?.();
      },
    );
    return unsub;
  }

  subscribeToWalletName(
    uid: string,
    walletId: number,
    onData: (name: string) => void,
    onError?: () => void,
  ): () => void {
    const unsub = onValue(
      ref(db, `users/${uid}/userwallet`),
      (snap) => {
        const links = (snap.val() ?? {}) as Record<string, { walletid?: number; name?: string }>;
        const link = Object.values(links).find((item) => Number(item?.walletid) === walletId);
        const label = link?.name?.trim();
        onData(label && label.length > 0 ? label : `Wallet ${walletId}`);
      },
      () => {
        onData(`Wallet ${walletId}`);
        onError?.();
      },
    );
    return unsub;
  }

  subscribeToLogs(
    walletId: number,
    onData: (logs: SharedLog[]) => void,
    onError?: () => void,
  ): () => void {
    const walletKey = `wallet${walletId}`;
    const unsub = onValue(
      ref(db, `wallets/${walletKey}/sharedLogs`),
      (snap) => {
        const raw = (snap.val() ?? {}) as Record<string, any>;
        const list: SharedLog[] = Object.entries(raw)
          .map(([id, v]) => ({
            id,
            userUid: String(v.userUid ?? ''),
            amount: Number(v.amount) || 0,
            currency: String(v.currency ?? '').toLowerCase(),
            reason: String(v.reason ?? ''),
            createdAt: Number(v.createdAt) || 0,
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
        onData(list);
      },
      () => {
        onData([]);
        onError?.();
      },
    );
    return unsub;
  }

  // ─── One-time reads ────────────────────────────────────────────────────────

  async fetchAllUsers(): Promise<Record<string, { name?: string; email?: string; number?: string | number; type?: number }>> {
    try {
      const snap = await get(ref(db, 'users'));
      return (snap.val() ?? {}) as Record<string, any>;
    } catch {
      return {};
    }
  }

  // ─── Writes ───────────────────────────────────────────────────────────────

  async saveGoal(walletId: number, goal: string | null): Promise<void> {
    await update(ref(db), {
      [`wallets/wallet${walletId}/goal`]: goal?.trim() || null,
    });
  }

  async addMember(walletId: number, uid: string, walletName: string): Promise<void> {
    const walletKey = `wallet${walletId}`;
    const snap = await get(ref(db, `users/${uid}/userwallet`));
    const userWallets = (snap.val() ?? {}) as Record<string, { walletid?: number }>;

    const updates: Record<string, unknown> = {
      [`wallets/${walletKey}/members/${uid}`]: true,
    };

    if (!Object.values(userWallets).some((item) => Number(item?.walletid) === walletId)) {
      updates[`users/${uid}/userwallet/${getNextUserWalletKey(userWallets)}`] = {
        name: walletName.trim() || `Wallet ${walletId}`,
        walletid: walletId,
      };
    }

    await update(ref(db), updates);
  }

  async removeMember(walletId: number, uid: string): Promise<void> {
    const walletKey = `wallet${walletId}`;
    const snap = await get(ref(db, `users/${uid}/userwallet`));
    const userWallets = (snap.val() ?? {}) as Record<string, { walletid?: number }>;

    const updates: Record<string, unknown> = {
      [`wallets/${walletKey}/members/${uid}`]: null,
    };

    for (const [slotKey, link] of Object.entries(userWallets)) {
      if (Number(link?.walletid) === walletId) {
        updates[`users/${uid}/userwallet/${slotKey}`] = null;
      }
    }

    await update(ref(db), updates);
  }

  async runAmountTransaction(walletId: number, params: TransactionParams): Promise<TransactionResult> {
    const walletKey = `wallet${walletId}`;
    const key = formatCurrency(params.currency);
    const currencyRef = ref(db, `wallets/${walletKey}/currancies/${key}`);

    let currentBalance = 0;
    let newBalance = 0;

    const result = await runTransaction(currencyRef, (currentValue) => {
      currentBalance = Number(currentValue) || 0;
      newBalance = currentBalance + params.amount;
      if (newBalance < 0) return undefined; // abort
      return newBalance;
    });

    if (!result.committed) {
      return { success: false, currentBalance, error: 'insufficient_funds' };
    }

    // Append audit log
    const logsRef = ref(db, `wallets/${walletKey}/sharedLogs`);
    const logRef = push(logsRef);
    await update(ref(db), {
      [`wallets/${walletKey}/sharedLogs/${logRef.key}`]: {
        userUid: params.uid,
        amount: params.amount,
        currency: key,
        reason: params.reason.trim() || (params.amount >= 0 ? 'Add money' : 'Spend'),
        createdAt: Date.now(),
      },
    });

    return { success: true, currentBalance, newBalance };
  }
}

/** Default singleton — injected throughout the feature by default. */
export const sharedWalletRepository: ISharedWalletRepository = new FirebaseSharedWalletRepository();
