import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  formatCompactNumber,
  getGoalsFloatingButtonBottom,
  getGoalsTheme,
} from "../constants";
import { useGoalDeletion } from "../goals-hooks/useGoalDeletion";
import { useGoalsContribution } from "../goals-hooks/useGoalsContribution";
import { useGoalsFeedback } from "../goals-hooks/useGoalsFeedback";
import { useGoalsNavigation } from "../goals-hooks/useGoalsNavigation";
import {
  useAddGoalContributionMutation,
  useDeleteGoalMutation,
  useGoalsQuery,
} from "../goals-hooks/useGoalsQuery";
import { useGoalsSortingAndSearch } from "../goals-hooks/useGoalsSortingAndSearch";
import { buildGoalsLabels } from "./goalsScreenLabels";

export type GoalsScreenModel = ReturnType<typeof useGoalsScreenModel>;

export function useGoalsScreenModel() {
  const { t } = useI18n();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const { goals, totalSaved, totalTarget } = useGoalsQuery(user?.uid).data;
  const addContribution = useAddGoalContributionMutation(user?.uid);
  const deleteGoal = useDeleteGoalMutation();
  const feedbackState = useGoalsFeedback();
  const navigation = useGoalsNavigation();
  const { search, sorting, visibleGoals } = useGoalsSortingAndSearch(goals, t);
  const contribution = useGoalsContribution({
    user,
    addContribution,
    t,
    showSuccess: feedbackState.showSuccess,
    presentSuccess: feedbackState.presentSuccess,
  });
  const deletion = useGoalDeletion({
    deleteGoal,
    t,
    showSuccess: feedbackState.showSuccess,
    presentSuccess: feedbackState.presentSuccess,
  });

  const theme = getGoalsTheme(isDark);
  const floatingButtonBottom = getGoalsFloatingButtonBottom(
    Platform.OS,
    insets.bottom,
  );
  
  const scrollBottomSpacing = floatingButtonBottom + 86;
  const overallProgress =
    totalTarget > 0 ? Math.min(totalSaved / totalTarget, 1) : 0;

  return {
    labels: buildGoalsLabels(t),
    view: {
      insets,
      theme,
      isDark,
      pageTransition: navigation.pageTransition,
      floatingButtonBottom,
      scrollBottomSpacing,
    },
    summary: {
      formattedTotalSaved: formatCompactNumber(totalSaved),
      formattedRemaining: formatCompactNumber(
        Math.max(totalTarget - totalSaved, 0),
      ),
      overallProgress,
    },
    search,
    sorting,
    goalsList: {
      goals,
      visibleGoals,
      userUid: user?.uid,
      onContribute: contribution.onOpen,
      onEdit: navigation.handleEditGoal,
      onDelete: deletion.onOpen,
    },
    contribution: {
      visible: contribution.visible,
      selectedGoal: contribution.selectedGoal,
      onClose: contribution.onClose,
      onSubmit: contribution.onSubmit,
    },
    deletion: {
      sheetRef: deletion.sheetRef,
      snapPoints: deletion.snapPoints,
      onCancel: deletion.onCancel,
      onConfirm: deletion.onConfirm,
      onDismiss: deletion.onDismiss,
    },
    feedback: {
      sheetRef: feedbackState.successSheetRef,
      title: feedbackState.successTitle,
      description: feedbackState.successDescription,
      icon: feedbackState.successIcon,
    },
    actions: {
      onBack: navigation.handleBack,
      onCreateGoal: navigation.handleCreateGoal,
    },
  };
}
