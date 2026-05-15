import { AddEntryModal } from "./AddEntryModal";

import { REGULARITY_TYPES, SOURCE_TYPES } from "../constants";
import type { Control } from "react-hook-form";
import type { IncomeSourceFormValues } from "../constants";

type IncomeSourceFormModalProps = {
  state: {
    visible: boolean;
    isDark: boolean;
    saving: boolean;
  };
  form: {
    control: Control<IncomeSourceFormValues>;
    type: any;
    regularity: any;
    selectedWalletSlot: string | null;
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
      control={props.form.control}
      type={props.form.type}
      regularity={props.form.regularity}
      selectedWalletSlot={props.form.selectedWalletSlot}
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
      onCurrencyChange={props.actions.onCurrencyChange}
      onNotesChange={props.actions.onNotesChange}
    />
  );
}
