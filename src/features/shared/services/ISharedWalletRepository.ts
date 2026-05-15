import { SharedLog, WalletRecord } from '../types';

export interface TransactionParams {
  uid: string;
  amount: number;     
  currency: string;
  reason: string;
}

export interface TransactionResult {
  success: boolean;
  currentBalance?: number;
  newBalance?: number;
  error?: string;
}

export interface ISharedWalletRepository {
 
  subscribeToWallet(
    walletId: number,
    onData: (wallet: WalletRecord | null) => void,
    onError?: () => void,
  ): () => void;

 
  subscribeToWalletName(
    uid: string,
    walletId: number,
    onData: (name: string) => void,
    onError?: () => void,
  ): () => void;

  subscribeToLogs(
    walletId: number,
    onData: (logs: SharedLog[]) => void,
    onError?: () => void,
  ): () => void;

  fetchAllUsers(): Promise<Record<string, { name?: string; email?: string; number?: string | number; type?: number }>>;

  
  saveGoal(walletId: number, goal: string | null): Promise<void>;

  
  addMember(walletId: number, uid: string, walletName: string): Promise<void>;

 
  removeMember(walletId: number, uid: string): Promise<void>;

  
  runAmountTransaction(walletId: number, params: TransactionParams): Promise<TransactionResult>;
}
