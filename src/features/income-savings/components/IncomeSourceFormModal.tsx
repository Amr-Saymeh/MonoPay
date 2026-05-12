import { AddEntryModal } from "@/components/income-savings/AddEntryModal";

import { REGULARITY_TYPES, SOURCE_TYPES } from "../constants";

type IncomeSourceFormModalProps = {
  state: {
    visible: boolean;
    isDark: boolean;
    saving: boolean;
  };
  form: {
    type: any;
    regularity: any;
    selectedWalletSlot: string | null;
    amount: string;
    currency: string;
    notes: string;
  };
  wallets: {
    options: any[];
    selectedCurrencies: string[];
  };
  actions: {
    onClose: () => void;
    onSave: () => void;
    onTypeChange: (value: any) => void;
    onRegularityChange: (value: any) => void;
    onWalletSelect: (value: string | null) => void;
    onAmountChange: (value: string) => void;
    onCurrencyChange: (value: string) => void;
    onNotesChange: (value: string) => void;
  };
};

export function IncomeSourceFormModal(props: IncomeSourceFormModalProps) {
  return (
    <AddEntryModal
      visible={props.state.visible}
      isDark={props.state.isDark}
      saving={props.state.saving}
      type={props.form.type}
      regularity={props.form.regularity}
      selectedWalletSlot={props.form.selectedWalletSlot}
      amount={props.form.amount}
      currency={props.form.currency}
      notes={props.form.notes}
      sourceTypes={SOURCE_TYPES}
      regularityTypes={REGULARITY_TYPES}
      walletOptions={props.wallets.options}
      selectedWalletCurrencies={props.wallets.selectedCurrencies}
      onClose={props.actions.onClose}
      onSave={props.actions.onSave}
      onTypeChange={props.actions.onTypeChange}
      onRegularityChange={props.actions.onRegularityChange}
      onWalletSelect={props.actions.onWalletSelect}
      onAmountChange={props.actions.onAmountChange}
      onCurrencyChange={props.actions.onCurrencyChange}
      onNotesChange={props.actions.onNotesChange}
    />
  );
}
