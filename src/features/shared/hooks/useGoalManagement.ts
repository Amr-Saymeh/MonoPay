import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useSharedWalletRepository } from '../context/SharedWalletRepositoryContext';
import type { TranslateFn, WalletRecord } from '../types';

export interface UseGoalManagementProps {
  user: { uid: string } | null;
  wallet: WalletRecord | null;
  walletId: number;
  goal: string;
  isOwner: boolean;
  t: TranslateFn;
}

export function useGoalManagement({
  wallet,
  walletId,
  goal,
  isOwner,
  t,
}: UseGoalManagementProps) {
  const repository = useSharedWalletRepository();

  const handleSaveGoal = useCallback(async () => {
    if (!isOwner || !wallet) {
      Alert.alert(t('error') ?? 'Error', t('onlyOwnerCanEdit') ?? 'Only the owner can edit.');
      return;
    }

    try {
      await repository.saveGoal(walletId, goal.trim() || null);
      Alert.alert(t('saved') ?? 'Saved', t('changesSaved') ?? 'Changes saved.');
    } catch (error) {
      Alert.alert(
        t('error') ?? 'Error',
        error instanceof Error ? error.message : 'Failed to save goal',
      );
    }
  }, [repository, goal, isOwner, wallet, walletId, t]);

  return { handleSaveGoal };
}
