import type { MaterialIcons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";

export function useGoalsFeedback() {
  const successSheetRef = useRef<BottomSheetModal>(null);
  const [successTitle, setSuccessTitle] = useState("");
  const [successDescription, setSuccessDescription] = useState("");
  const [successIcon, setSuccessIcon] =
    useState<keyof typeof MaterialIcons.glyphMap>("check-circle");

  const showSuccess = (
    title: string,
    description: string,
    icon: keyof typeof MaterialIcons.glyphMap,
  ) => {
    setSuccessTitle(title);
    setSuccessDescription(description);
    setSuccessIcon(icon);
  };

  const presentSuccess = () => {
    successSheetRef.current?.present();
  };

  return {
    successSheetRef,
    successTitle,
    successDescription,
    successIcon,
    showSuccess,
    presentSuccess,
  };
}
