import { FeedbackBottomSheet } from "@/components/ui/FeedbackBottomSheet";

import {
  INCOME_BOTTOM_SHEET_INSET,
  INCOME_SUCCESS_BOTTOM_SHEET_INSET,
} from "../constants";
import type { IncomeSource, SourceType } from "../services/incomeSavings.service";
import { IncomeSourceDeleteSheet } from "./IncomeSourceDeleteSheet";

type IncomeSavingsFeedbackSheetsProps = {
  appearance: {
    isDark: boolean;
    theme: any;
  };
  deletion: {
    sheetRef: any;
    snapPoints: string[];
    pendingSource: IncomeSource | null;
    onCancel: () => void;
    onConfirm: () => void;
    onDismiss: () => void;
  };
  success: {
    sheetRef: any;
    title: string;
    description: string;
    icon: any;
  };
  labels: {
    deleteTitle: string;
    deletePrompt: string;
    deletePromptGeneric: string;
    cancel: string;
    delete: string;
    confirm: string;
  };
  helpers: {
    interpolate: (template: string, values: Record<string, string>) => string;
    getSourceTypeLabel: (sourceType: SourceType) => string;
  };
};

export function IncomeSavingsFeedbackSheets({
  appearance,
  deletion,
  success,
  labels,
  helpers,
}: IncomeSavingsFeedbackSheetsProps) {
  return (
    <>
      <IncomeSourceDeleteSheet
        modalRef={deletion.sheetRef}
        snapPoints={deletion.snapPoints}
        bottomInset={INCOME_BOTTOM_SHEET_INSET}
        isDark={appearance.isDark}
        backgroundColor={appearance.theme.sheetBg}
        handleColor={appearance.theme.sheetHandle}
        titleColor={appearance.theme.sheetTitle}
        textColor={appearance.theme.sheetText}
        borderColor={appearance.theme.sheetBorder}
        title={labels.deleteTitle}
        description={
          deletion.pendingSource
            ? helpers.interpolate(labels.deletePrompt, {
                type: helpers.getSourceTypeLabel(deletion.pendingSource.type),
                wallet: deletion.pendingSource.walletName,
              })
            : labels.deletePromptGeneric
        }
        cancelLabel={labels.cancel}
        deleteLabel={labels.delete}
        onCancel={deletion.onCancel}
        onConfirm={deletion.onConfirm}
        onDismiss={deletion.onDismiss}
      />

      <FeedbackBottomSheet
        modalRef={success.sheetRef}
        isDark={appearance.isDark}
        title={success.title}
        description={success.description}
        actionLabel={labels.confirm}
        titleIcon={success.icon}
        actionIcon="check-circle"
        bottomInset={INCOME_SUCCESS_BOTTOM_SHEET_INSET}
        onAction={() => success.sheetRef.current?.dismiss()}
      />
    </>
  );
}
