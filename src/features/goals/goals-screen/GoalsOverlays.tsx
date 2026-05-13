import { FeedbackBottomSheet } from "@/components/ui/FeedbackBottomSheet";

import { GOALS_SUCCESS_BOTTOM_SHEET_INSET } from "../constants";
import { GoalDeleteSheet } from "../goals-components/GoalDeleteSheet";
import { useGoalsScreen } from "./GoalsScreenProvider";

export function GoalsOverlays() {
  return (
    <>
      <GoalsDeleteOverlay />
      <GoalsSuccessOverlay />
    </>
  );
}

function GoalsDeleteOverlay() {
  const { deletion, labels, view } = useGoalsScreen();

  return (
    <GoalDeleteSheet
      modalRef={deletion.sheetRef}
      snapPoints={deletion.snapPoints}
      isDark={view.isDark}
      backgroundColor={view.theme.sheetBg}
      handleColor={view.theme.sheetHandle}
      titleColor={view.theme.sheetTitle}
      textColor={view.theme.sheetText}
      borderColor={view.theme.sheetBorder}
      title={labels.deleteTitle}
      description={labels.deleteConfirm}
      cancelLabel={labels.cancel}
      deleteLabel={labels.delete}
      onCancel={deletion.onCancel}
      onConfirm={deletion.onConfirm}
      onDismiss={deletion.onDismiss}
    />
  );
}

function GoalsSuccessOverlay() {
  const { feedback, labels, view } = useGoalsScreen();

  return (
    <FeedbackBottomSheet
      modalRef={feedback.sheetRef}
      isDark={view.isDark}
      title={feedback.title}
      description={feedback.description}
      actionLabel={labels.confirm}
      titleIcon={feedback.icon}
      actionIcon="check-circle"
      bottomInset={GOALS_SUCCESS_BOTTOM_SHEET_INSET}
      onAction={() => feedback.sheetRef.current?.dismiss()}
    />
  );
}
