export type UserRecord = {
  address?: string;
  email?: string;
  identityImage?: string;
  identityNumber?: number;
  name?: string;
  number?: string | number;
  personalImage?: string;
  type?: number;
};

export type PendingUser = {
  id: string;
  data: UserRecord;
};

export type WalletRecord = {
  id?: number;
};
