import { FeedbackBottomSheet } from "@/components/ui/FeedbackBottomSheet";

import {
  INCOME_BOTTOM_SHEET_INSET,
  INCOME_SUCCESS_BOTTOM_SHEET_INSET,
} from "../constants";
import type { IncomeSource, SourceType } from "../services/incomeSavings.service";
import { IncomeSourceDeleteSheet } from "./IncomeSourceDeleteSheet";

type IncomeSavingsFeedbackSheetsProps = {
  deleteSheetRef: any;
  deleteSheetSnapPoints: string[];
  isDark: boolean;
  theme: any;
  pendingDeleteSource: IncomeSource | null;
  interpolate: (template: string, values: Record<string, string>) => string;
  getSourceTypeLabel: (sourceType: SourceType) => string;
  deleteTitle: string;
  deletePrompt: string;
  deletePromptGeneric: string;
  cancelLabel: string;
  deleteLabel: string;
  confirmLabel: string;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onDismissDelete: () => void;
  successSheetRef: any;
  successTitle: string;
  successDescription: string;
  successIcon: any;
};

export function IncomeSavingsFeedbackSheets({
  deleteSheetRef,
  deleteSheetSnapPoints,
  isDark,
  theme,
  pendingDeleteSource,
  interpolate,
  getSourceTypeLabel,
  deleteTitle,
  deletePrompt,
  deletePromptGeneric,
  cancelLabel,
  deleteLabel,
  confirmLabel,
  onCancelDelete,
  onConfirmDelete,
  onDismissDelete,
  successSheetRef,
  successTitle,
  successDescription,
  successIcon,
}: IncomeSavingsFeedbackSheetsProps) {
  return (
    <>
      <IncomeSourceDeleteSheet
        modalRef={deleteSheetRef}
        snapPoints={deleteSheetSnapPoints}
        bottomInset={INCOME_BOTTOM_SHEET_INSET}
        isDark={isDark}
        backgroundColor={theme.sheetBg}
        handleColor={theme.sheetHandle}
        titleColor={theme.sheetTitle}
        textColor={theme.sheetText}
        borderColor={theme.sheetBorder}
        title={deleteTitle}
        description={
          pendingDeleteSource
            ? interpolate(deletePrompt, {
                type: getSourceTypeLabel(pendingDeleteSource.type),
                wallet: pendingDeleteSource.walletName,
              })
            : deletePromptGeneric
        }
        cancelLabel={cancelLabel}
        deleteLabel={deleteLabel}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
        onDismiss={onDismissDelete}
      />

      <FeedbackBottomSheet
        modalRef={successSheetRef}
        isDark={isDark}
        title={successTitle}
        description={successDescription}
        actionLabel={confirmLabel}
        titleIcon={successIcon}
        actionIcon="check-circle"
        bottomInset={INCOME_SUCCESS_BOTTOM_SHEET_INSET}
        onAction={() => successSheetRef.current?.dismiss()}
      />
    </>
  );
}
