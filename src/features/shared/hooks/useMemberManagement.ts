import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useSharedWalletRepository } from '../context/SharedWalletRepositoryContext';
import type { TranslateFn, UserProfile, WalletRecord } from '../types';
import { useMemberSuggestions } from './useMemberSuggestions';

export interface UseMemberManagementProps {
  user: { uid: string } | null;
  wallet: WalletRecord | null;
  walletId: number;
  walletName: string;
  isOwner: boolean;
  memberUids: string[];
  allUsers: Record<string, UserProfile>;
  t: TranslateFn;
}

export interface UseMemberManagementResult {
  search: string;
  setSearch: (value: string) => void;
  suggestions: Array<{ uid: string; profile: UserProfile }>;
  handleAddMember: (uid: string) => Promise<void>;
  handleRemoveMember: (uid: string) => Promise<void>;
}

export function useMemberManagement({
  user,
  wallet,
  walletId,
  walletName,
  isOwner,
  memberUids,
  allUsers,
  t,
}: UseMemberManagementProps): UseMemberManagementResult {
  const repository = useSharedWalletRepository();
  const [search, setSearch] = useState('');

  const { suggestions } = useMemberSuggestions(
    search,
    isOwner,
    allUsers,
    memberUids,
    user?.uid,
  );

  const handleAddMember = useCallback(
    async (uid: string) => {
      if (!isOwner || !wallet) return;
      try {
        await repository.addMember(walletId, uid, walletName);
        setSearch('');
      } catch (error) {
        Alert.alert(
          t('error') ?? 'Error',
          error instanceof Error ? error.message : 'Failed to add member',
        );
      }
    },
    [repository, isOwner, wallet, walletId, walletName, t],
  );

  const handleRemoveMember = useCallback(
    async (uid: string) => {
      if (!isOwner || !wallet) return;
      try {
        await repository.removeMember(walletId, uid);
      } catch (error) {
        Alert.alert(
          t('error') ?? 'Error',
          error instanceof Error ? error.message : 'Failed to remove member',
        );
      }
    },
    [repository, isOwner, wallet, walletId, t],
  );

  return { search, setSearch, suggestions, handleAddMember, handleRemoveMember };
}
