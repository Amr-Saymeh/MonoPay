import { IncomeSavingsHeader } from "../components/IncomeSavingsHeader";
import { useIncomeSavingsScreen } from "./IncomeSavingsScreenProvider";

export function IncomeSavingsHeaderSection() {
  const { actions, labels, view } = useIncomeSavingsScreen();

  return (
    <IncomeSavingsHeader
      title={labels.title}
      isDark={view.isDark}
      backgroundColor={view.theme.headerSurface}
      borderColor={view.theme.headerBorder}
      onBack={actions.onBack}
    />
  );
}
