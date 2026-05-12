import { ContributionModal } from "../goals-components/ContributionModal";
import { useGoalsScreen } from "./GoalsScreenProvider";

export function GoalsContributionOverlay() {
  const { contribution } = useGoalsScreen();

  return (
    <ContributionModal
      visible={contribution.visible}
      onClose={contribution.onClose}
      onSubmit={contribution.onSubmit}
      currency={contribution.selectedGoal?.goalTargetCurrency || "usd"}
      targetAmount={contribution.selectedGoal?.goalTargetAmount}
      currentAmount={contribution.selectedGoal?.currentAmount || 0}
    />
  );
}
