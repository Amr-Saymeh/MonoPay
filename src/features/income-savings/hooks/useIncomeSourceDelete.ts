import { hapticSuccess, hapticTap, hapticWarning } from "@/src/utils/haptics";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import type { useI18n } from "@/hooks/use-i18n";

import { INCOME_DELETE_SHEET_SNAP_POINTS } from "../constants";
import type { IncomeSource } from "../services/incomeSavings.service";

type I18nT = ReturnType<typeof useI18n>["t"];

export function useIncomeSourceDelete(params: {
  user: unknown;
  deleteMutation: {
    mutateAsync: (sourceId: string) => Promise<unknown>;
  };
  t: I18nT;
  showSuccess: (title: string, description: string, icon: "delete-forever") => void;
  showError: (title: string, description: string) => void;
}) {
  const { user, deleteMutation, t, showSuccess, showError } = params;
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const [pendingDeleteSource, setPendingDeleteSource] =
    useState<IncomeSource | null>(null);

  const handleDeleteSource = (item: IncomeSource) => {
    hapticWarning();
    setPendingDeleteSource(item);
    deleteSheetRef.current?.present();
  };

  const handleCancelDelete = () => {
    hapticTap();
    deleteSheetRef.current?.dismiss();
  };

  const handleConfirmDelete = async () => {
    if (!user || !pendingDeleteSource) return;

    try {
      hapticWarning();
      await deleteMutation.mutateAsync(pendingDeleteSource.id);
      deleteSheetRef.current?.dismiss();
      hapticSuccess();
      showSuccess(
        t("incomeSavings.deleteSuccess"),
        t("incomeSavings.deletedDescription"),
        "delete-forever",
      );
    } catch (error) {
      showError(t("error"), String(error));
    }
  };

  return {
    deleteSheetRef,
    deleteSheetSnapPoints: INCOME_DELETE_SHEET_SNAP_POINTS,
    pendingDeleteSource,
    handleDeleteSource,
    handleCancelDelete,
    handleConfirmDelete,
    clearPendingDeleteSource: () => setPendingDeleteSource(null),
  };
}
