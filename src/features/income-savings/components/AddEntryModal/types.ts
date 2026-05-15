import type {
  Regularity,
  SourceType,
} from "@/src/services/incomeSources.service";
import type { Control } from "react-hook-form";

import type { IncomeSourceFormValues } from "../../constants";

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
  control: Control<IncomeSourceFormValues>;
  type: SourceType;
  regularity: Regularity;
  selectedWalletSlot: string | null;
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
  onCurrencyChange: (value: string) => void;
  onNotesChange: (value: string) => void;
};
