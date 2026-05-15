import type { TranslationKey } from '@/src/i18n/translations';

/** Matches `useI18n().t` — typed translation lookup for this feature. */
export type TranslateFn = (key: TranslationKey) => string;

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
