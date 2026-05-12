import { AppDialogModal } from "@/components/ui/AppDialogModal";

import { IncomeSavingsFeedbackSheets } from "../components/IncomeSavingsFeedbackSheets";
import { useIncomeSavingsScreen } from "./IncomeSavingsScreenProvider";

export function IncomeSavingsOverlays() {
  const { deletion, feedback, helpers, labels, view } = useIncomeSavingsScreen();

  return (
    <>
      <IncomeSavingsFeedbackSheets
        appearance={{ isDark: view.isDark, theme: view.theme }}
        deletion={deletion}
        success={feedback.success}
        labels={{
          deleteTitle: labels.deleteTitle,
          deletePrompt: labels.deletePrompt,
          deletePromptGeneric: labels.deletePromptGeneric,
          cancel: labels.cancel,
          delete: labels.delete,
          confirm: labels.confirm,
        }}
        helpers={helpers}
      />
      <AppDialogModal
        visible={feedback.error.visible}
        isDark={view.isDark}
        title={feedback.error.title}
        description={feedback.error.description}
        actionLabel={labels.confirm}
        icon="error-outline"
        onClose={feedback.error.onClose}
      />
    </>
  );
}
