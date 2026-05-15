/**
 * SharedWalletRepositoryContext.tsx
 *
 * DIP: Hooks depend on ISharedWalletRepository via context, not on Firebase
 *      directly. Tests and Storybook can wrap the tree with a mock repository.
 */

import { createContext, useContext, type ReactNode } from 'react';

import { sharedWalletRepository } from '../services/FirebaseSharedWalletRepository';
import type { ISharedWalletRepository } from '../services/ISharedWalletRepository';

const SharedWalletRepositoryContext =
  createContext<ISharedWalletRepository>(sharedWalletRepository);

export interface SharedWalletRepositoryProviderProps {
  children: ReactNode;
  repository?: ISharedWalletRepository;
}

export function SharedWalletRepositoryProvider({
  children,
  repository = sharedWalletRepository,
}: SharedWalletRepositoryProviderProps) {
  return (
    <SharedWalletRepositoryContext.Provider value={repository}>
      {children}
    </SharedWalletRepositoryContext.Provider>
  );
}

export function useSharedWalletRepository(): ISharedWalletRepository {
  return useContext(SharedWalletRepositoryContext);
}
