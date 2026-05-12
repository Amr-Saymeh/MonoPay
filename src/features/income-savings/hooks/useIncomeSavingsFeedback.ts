import { MaterialIcons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { type RefObject, useEffect, useRef, useState } from "react";

export function useIncomeSavingsSuccessPresentation(params: {
  successSheetRef: RefObject<BottomSheetModal | null>;
  sourceModalVisible: boolean;
  pendingDeleteSource: unknown;
  pendingSuccessSheet: boolean;
  setPendingSuccessSheet: (value: boolean) => void;
}) {
  const {
    successSheetRef,
    sourceModalVisible,
    pendingDeleteSource,
    pendingSuccessSheet,
    setPendingSuccessSheet,
  } = params;

  useEffect(() => {
    if (sourceModalVisible || pendingDeleteSource || !pendingSuccessSheet) {
      return;
    }

    const timer = setTimeout(() => {
      successSheetRef.current?.present();
      setPendingSuccessSheet(false);
    }, 120);

    return () => clearTimeout(timer);
  }, [
    pendingDeleteSource,
    pendingSuccessSheet,
    setPendingSuccessSheet,
    sourceModalVisible,
    successSheetRef,
  ]);
}

export function useIncomeSavingsFeedback() {
  const successSheetRef = useRef<BottomSheetModal>(null);
  const [successTitle, setSuccessTitle] = useState("");
  const [successDescription, setSuccessDescription] = useState("");
  const [successIcon, setSuccessIcon] =
    useState<keyof typeof MaterialIcons.glyphMap>("check-circle");
  const [pendingSuccessSheet, setPendingSuccessSheet] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  const showSuccess = (
    title: string,
    description: string,
    icon: keyof typeof MaterialIcons.glyphMap,
  ) => {
    setSuccessTitle(title);
    setSuccessDescription(description);
    setSuccessIcon(icon);
    setPendingSuccessSheet(true);
  };

  const showError = (title: string, description: string) => {
    setErrorTitle(title);
    setErrorDescription(description);
    setErrorVisible(true);
  };

  return {
    successSheetRef,
    successTitle,
    successDescription,
    successIcon,
    pendingSuccessSheet,
    setPendingSuccessSheet,
    errorTitle,
    errorDescription,
    errorVisible,
    setErrorVisible,
    showSuccess,
    showError,
  };
}
