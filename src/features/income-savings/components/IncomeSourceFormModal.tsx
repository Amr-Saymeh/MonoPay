import { AddEntryModal } from "@/components/income-savings/AddEntryModal";

import { REGULARITY_TYPES, SOURCE_TYPES } from "../constants";

type IncomeSourceFormModalProps = {
  visible: boolean;
  isDark: boolean;
  saving: boolean;
  type: any;
  regularity: any;
  selectedWalletSlot: string | null;
  amount: string;
  currency: string;
  notes: string;
  walletOptions: any[];
  selectedWalletCurrencies: string[];
  onClose: () => void;
  onSave: () => void;
  onTypeChange: (value: any) => void;
  onRegularityChange: (value: any) => void;
  onWalletSelect: (value: string | null) => void;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onNotesChange: (value: string) => void;
};

export function IncomeSourceFormModal(props: IncomeSourceFormModalProps) {
  return (
    <AddEntryModal
      visible={props.visible}
      isDark={props.isDark}
      saving={props.saving}
      type={props.type}
      regularity={props.regularity}
      selectedWalletSlot={props.selectedWalletSlot}
      amount={props.amount}
      currency={props.currency}
      notes={props.notes}
      sourceTypes={SOURCE_TYPES}
      regularityTypes={REGULARITY_TYPES}
      walletOptions={props.walletOptions}
      selectedWalletCurrencies={props.selectedWalletCurrencies}
      onClose={props.onClose}
      onSave={props.onSave}
      onTypeChange={props.onTypeChange}
      onRegularityChange={props.onRegularityChange}
      onWalletSelect={props.onWalletSelect}
      onAmountChange={props.onAmountChange}
      onCurrencyChange={props.onCurrencyChange}
      onNotesChange={props.onNotesChange}
    />
  );
}