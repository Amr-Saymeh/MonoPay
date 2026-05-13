import { useI18n } from "@/hooks/use-i18n";
import { hapticError, hapticSuccess, hapticTap } from "@/src/utils/haptics";
import { useState } from "react";
import { Alert } from "react-native";

import type { GoalRecord } from "../goals-services/goals.service";

type I18nT = ReturnType<typeof useI18n>["t"];

export function useGoalsContribution(params: {
  user: unknown;
  addContribution: {
    mutateAsync: (params: {
      goal: GoalRecord;
      amount: number;
      reason?: string;
    }) => Promise<unknown>;
  };
  t: I18nT;
  showSuccess: (title: string, description: string, icon: "add-circle") => void;
  presentSuccess: () => void;
}) {
  const { user, addContribution, t, showSuccess, presentSuccess } = params;
  const [selectedGoal, setSelectedGoal] = useState<GoalRecord | null>(null);
  const [showContributionModal, setShowContributionModal] = useState(false);

  const openContribution = (goal: GoalRecord) => {
    hapticTap();
    setSelectedGoal(goal);
    setShowContributionModal(true);
  };

  const closeContribution = () => {
    setShowContributionModal(false);
    setSelectedGoal(null);
  };

  const handleContributionSubmit = async (amount: number, reason?: string) => {
    if (!selectedGoal || !user) return;

    try {
      await addContribution.mutateAsync({ goal: selectedGoal, amount, reason });
      hapticSuccess();
      showSuccess(
        t("goals.contributionAddedTitle"),
        t("goals.contributionSuccess"),
        "add-circle",
      );
      closeContribution();
      setTimeout(presentSuccess, 240);
    } catch (error) {
      hapticError();
      Alert.alert(t("error"), String(error));
    }
  };

  return {
    visible: showContributionModal,
    selectedGoal,
    onOpen: openContribution,
    onClose: closeContribution,
    onSubmit: handleContributionSubmit,
  };
}
