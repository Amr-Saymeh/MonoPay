export type WalletRecord = {
  currancies?: Record<string, number>;
  id?: number;
  state?: string;
  expiryDate?: string;
  ownerUid?: string;
  members?: Record<string, true>;
  type?: "real" | "credit" | "shared" | string;
};

export type UserWalletLink = {
  name?: string;
  walletid?: number;
  color?: string;
  emoji?: string;
};

export type WalletCard = {
  userWalletKey: string;
  walletid: number;
  name: string;
  color: string;
  emoji: string;
  wallet?: WalletRecord;
};
