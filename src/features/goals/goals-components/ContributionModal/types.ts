export type UserWalletRef = {
  walletKey: string;
  name: string;
  balance: number;
  currencyKey: string;
  currencyContainer: "currancies" | "currencies";
};

export type ContributionFormValues = {
  amount: string;
  reason: string;
  selectedWalletKey: string | null;
};

export type ContributionModalTheme = {
  inputBg: string;
  inputBorder: string;
  inputColor: string;
  placeholderColor: string;
  iconColor: string;
  cardBg: string;
  cardBorder: string;
  sheetBg: string;
  sheetHandle: string;
  cancelBorder: string;
  cancelTextColor: string;
};

