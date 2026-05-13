import type {
  Regularity,
  SourceType,
} from "@/src/services/incomeSources.service";

export type WalletOption = {
  slotKey: string;
  walletid: number;
  walletKey: string;
  name: string;
};

export type AddEntryModalProps = {
  visible: boolean;
  isDark: boolean;
  saving: boolean;
  type: SourceType;
  regularity: Regularity;
  selectedWalletSlot: string | null;
  amount: string;
  currency: string;
  notes: string;
  sourceTypes: SourceType[];
  regularityTypes: Regularity[];
  walletOptions: WalletOption[];
  selectedWalletCurrencies: string[];
  onClose: () => void;
  onSave: () => void;
  onTypeChange: (value: SourceType) => void;
  onRegularityChange: (value: Regularity) => void;
  onWalletSelect: (slotKey: string) => void;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onNotesChange: (value: string) => void;
};
