import { IncomeSavingsScreenProvider } from "./income-savings-screen/IncomeSavingsScreenProvider";
import { IncomeSavingsScreenView } from "./income-savings-screen/IncomeSavingsScreenView";

export default function IncomeSavingsScreen() {
  return (
    <IncomeSavingsScreenProvider>
      <IncomeSavingsScreenView />
    </IncomeSavingsScreenProvider>
  );
}
