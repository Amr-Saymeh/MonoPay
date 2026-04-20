export type WalletRecord = {
  id?: number;
  state?: string;
  type?: string;
  currancies?: Record<string, number>;
  ownerUid?: string;
  members?: Record<string, true>;
  goal?: string;
};

export type UserProfile = {
  name?: string;
  email?: string;
  number?: string | number;
  type?: number;
};

export type SharedLog = {
  id: string;
  userUid: string;
  amount: number;
  currency: string;
  reason: string;
  createdAt: number;
};
