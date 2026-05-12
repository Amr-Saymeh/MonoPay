import { useI18n } from "@/hooks/use-i18n";
import { hapticError, hapticSuccess, hapticTap, hapticWarning } from "@/src/utils/haptics";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

import { GOAL_DELETE_SHEET_SNAP_POINTS } from "../constants";
import type { GoalRecord } from "../goals-services/goals.service";

type I18nT = ReturnType<typeof useI18n>["t"];

export function useGoalDeletion(params: {
  deleteGoal: {
    mutateAsync: (goalId: string) => Promise<unknown>;
  };
  t: I18nT;
  showSuccess: (
    title: string,
    description: string,
    icon: "delete-forever",
  ) => void;
  presentSuccess: () => void;
}) {
  const { deleteGoal, t, showSuccess, presentSuccess } = params;
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const deleteSheetSnapPoints = useMemo(() => GOAL_DELETE_SHEET_SNAP_POINTS, []);
  const [pendingDeleteGoal, setPendingDeleteGoal] =
    useState<GoalRecord | null>(null);

  const openDelete = (goal: GoalRecord) => {
    hapticWarning();
    setPendingDeleteGoal(goal);
    deleteSheetRef.current?.present();
  };

  const cancelDelete = () => {
    hapticTap();
    deleteSheetRef.current?.dismiss();
  };

  const confirmDelete = async () => {
    if (!pendingDeleteGoal) return;

    try {
      hapticWarning();
      await deleteGoal.mutateAsync(pendingDeleteGoal.id);
      deleteSheetRef.current?.dismiss();
      hapticSuccess();
      showSuccess(
        t("goals.goalDeletedTitle"),
        t("goals.deleteSuccess"),
        "delete-forever",
      );
      requestAnimationFrame(presentSuccess);
    } catch (error) {
      hapticError();
      Alert.alert(t("error"), String(error));
    }
  };

  return {
    sheetRef: deleteSheetRef,
    snapPoints: deleteSheetSnapPoints,
    onOpen: openDelete,
    onCancel: cancelDelete,
    onConfirm: confirmDelete,
    onDismiss: () => setPendingDeleteGoal(null),
  };
}
