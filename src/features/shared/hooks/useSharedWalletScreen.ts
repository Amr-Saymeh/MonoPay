import { useCallback, useMemo } from 'react';

import { SharedLog, TranslateFn, UserProfile, WalletRecord } from '../types';
import { getUserLabel } from '../utils/formatters';
import { useAllUsersProfiles } from './useAllUsersProfiles';
import { useAmountModalState } from './useAmountModalState';
import { useAmountTransaction } from './useAmountTransaction';
import { useGoalManagement } from './useGoalManagement';
import { useMemberManagement } from './useMemberManagement';
import { useSharedWallet } from './useSharedWallet';
import { useSharedWalletLogs } from './useSharedWalletLogs';
import { useWalletBalance } from './useWalletBalance';

export interface WalletInfo {
  data: WalletRecord | null;
  loading: boolean;
  name: string;
  goal: string;
  setGoal: (goal: string) => void;
  walletState: string;
  isOwner: boolean;
  ownerLabel: string;
  handleSaveGoal: () => Promise<void>;
}

export interface BalanceInfo {
  balances: Array<[string, number]>;
  totalBalance: number;
  availableCurrencies: string[];
}

export interface MembersInfo {
  memberProfiles: Array<{ uid: string; profile?: UserProfile }>;
  search: string;
  setSearch: (value: string) => void;
  suggestions: Array<{ uid: string; profile: UserProfile }>;
  handleAddMember: (uid: string) => Promise<void>;
  handleRemoveMember: (uid: string) => Promise<void>;
}

export interface AmountModalInfo {
  visible: boolean;
  amount: string;
  setAmount: (value: string) => void;
  currency: string | null;
  setCurrency: (value: string | null) => void;
  reason: string;
  setReason: (value: string) => void;
  isAdd: boolean;
  saving: boolean;
  open: (isAdd: boolean, currency?: string) => void;
  close: () => void;
  handleSave: () => Promise<void>;
}

export interface HistoryInfo {
  logs: SharedLog[];
  logsLoading: boolean;
  allUsers: Record<string, UserProfile>;
}

export interface UseSharedWalletScreenResult {
  wallet: WalletInfo;
  balance: BalanceInfo;
  members: MembersInfo;
  amountModal: AmountModalInfo;
  history: HistoryInfo;
}

export function useSharedWalletScreen(
  user: { uid: string } | null,
  walletId: number,
  t: TranslateFn,
): UseSharedWalletScreenResult {
  const { wallet: walletData, loading, name, goal, setGoal, memberUids } = useSharedWallet(
    user,
    walletId,
  );
  const { logs, loading: logsLoading } = useSharedWalletLogs(user, walletId);
  const { allUsers } = useAllUsersProfiles(user);
  const { balances, totalBalance, availableCurrencies } = useWalletBalance(walletData);

  const isOwner = Boolean(user && walletData?.ownerUid && walletData.ownerUid === user.uid);
  const walletState = String(walletData?.state ?? 'active').toLowerCase();

  const ownerProfile = useMemo(
    () => (walletData?.ownerUid ? allUsers[walletData.ownerUid] : undefined),
    [allUsers, walletData?.ownerUid],
  );
  const ownerLabel = getUserLabel(ownerProfile, walletData?.ownerUid ?? '—');

  const memberProfiles = useMemo(
    () => memberUids.map((uid) => ({ uid, profile: allUsers[uid] })),
    [allUsers, memberUids],
  );

  const modal = useAmountModalState(availableCurrencies);

  const { execute, saving } = useAmountTransaction({
    user,
    walletId,
    t,
    onSuccess: () => {
      modal.close();
      modal.reset();
    },
  });

  const { handleSaveGoal } = useGoalManagement({
    user,
    wallet: walletData,
    walletId,
    goal,
    isOwner,
    t,
  });

  const { search, setSearch, suggestions, handleAddMember, handleRemoveMember } =
    useMemberManagement({
      user,
      wallet: walletData,
      walletId,
      walletName: name,
      isOwner,
      memberUids,
      allUsers,
      t,
    });

  const handleSave = useCallback(async () => {
    if (!modal.currency) return;
    const result = await execute({
      amount: modal.amount,
      currency: modal.currency,
      reason: modal.reason,
      isAdd: modal.isAdd,
    });
    if (!result.success) {
      const { Alert } = await import('react-native');
      Alert.alert(t('error') ?? 'Error', result.error ?? (t('failed') ?? 'Failed'));
    }
  }, [modal, execute, t]);

  return {
    wallet: {
      data: walletData,
      loading,
      name,
      goal,
      setGoal,
      walletState,
      isOwner,
      ownerLabel,
      handleSaveGoal,
    },
    balance: {
      balances,
      totalBalance,
      availableCurrencies,
    },
    members: {
      memberProfiles,
      search,
      setSearch,
      suggestions,
      handleAddMember,
      handleRemoveMember,
    },
    amountModal: {
      visible: modal.visible,
      amount: modal.amount,
      setAmount: modal.setAmount,
      currency: modal.currency,
      setCurrency: modal.setCurrency,
      reason: modal.reason,
      setReason: modal.setReason,
      isAdd: modal.isAdd,
      saving,
      open: modal.open,
      close: modal.close,
      handleSave,
    },
    history: {
      logs,
      logsLoading,
      allUsers,
    },
  };
}
