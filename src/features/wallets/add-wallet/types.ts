export type WalletType = "real" | "credit" | "shared";

export type WalletRecord = {
  id?: number;
};

export type UserWalletLink = {
  walletid?: number;
  id?: number;
};

export type BalanceRow = {
  id: string;
  currency: string;
  amount: string;
};

export type UserProfile = {
  name?: string;
  number?: string | number;
  type?: number;
};

export type SharedSuggestion = {
  uid: string;
  profile: UserProfile;
};

export type PreviewCurrency = {
  code: string;
  balance: number;
};
