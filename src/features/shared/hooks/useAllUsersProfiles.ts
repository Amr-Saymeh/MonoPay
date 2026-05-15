/**
 * useAllUsersProfiles.ts
 *
 * SRP: Fetches all user profiles once when the authenticated user is available.
 * DIP: Reads via ISharedWalletRepository — no direct Firebase import.
 */

import { useEffect, useState } from 'react';

import { useSharedWalletRepository } from '../context/SharedWalletRepositoryContext';
import { UserProfile } from '../types';

export interface UseAllUsersProfilesResult {
  allUsers: Record<string, UserProfile>;
}

export function useAllUsersProfiles(user: { uid: string } | null): UseAllUsersProfilesResult {
  const repository = useSharedWalletRepository();
  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    repository.fetchAllUsers().then((data) => {
      if (!cancelled) setAllUsers(data);
    });

    return () => {
      cancelled = true;
    };
  }, [repository, user]);

  return { allUsers };
}
