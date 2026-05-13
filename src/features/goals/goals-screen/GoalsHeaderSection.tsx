import { GoalsHeader } from "../goals-components/GoalsHeader";
import { useGoalsScreen } from "./GoalsScreenProvider";

export function GoalsHeaderSection() {
  const { actions, labels, view } = useGoalsScreen();

  return (
    <GoalsHeader
      title={labels.title}
      isDark={view.isDark}
      backgroundColor={view.theme.headerSurface}
      borderColor={view.theme.headerBorder}
      onBack={actions.onBack}
    />
  );
}
