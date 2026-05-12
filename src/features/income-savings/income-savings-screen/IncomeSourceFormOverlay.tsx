import { IncomeSourceFormModal } from "../components/IncomeSourceFormModal";
import { useIncomeSavingsScreen } from "./IncomeSavingsScreenProvider";

export function IncomeSourceFormOverlay() {
  const { form } = useIncomeSavingsScreen();

  return (
    <IncomeSourceFormModal
      state={form.state}
      form={form.values}
      wallets={form.wallets}
      actions={form.actions}
    />
  );
}
