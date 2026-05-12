import { ThemedText } from "@/components/themed-text";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { RefObject } from "react";
import { Pressable, View } from "react-native";

import { getGoalsNeutralIconColor, GOALS_WHITE_ICON } from "../constants";
import { styles } from "../stylesheet";

type GoalDeleteSheetProps = {
  modalRef: RefObject<BottomSheetModal | null>;
  snapPoints: string[];
  isDark: boolean;
  backgroundColor: string;
  handleColor: string;
  titleColor: string;
  textColor: string;
  borderColor: string;
  title: string;
  description: string;
  cancelLabel: string;
  deleteLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  onDismiss: () => void;
};

export function GoalDeleteSheet({
  modalRef,
  snapPoints,
  isDark,
  backgroundColor,
  handleColor,
  titleColor,
  textColor,
  borderColor,
  title,
  description,
  cancelLabel,
  deleteLabel,
  onCancel,
  onConfirm,
  onDismiss,
}: GoalDeleteSheetProps) {
  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={0}
      onDismiss={onDismiss}
      handleIndicatorStyle={[styles.sheetHandle, { backgroundColor: handleColor }]}
      backgroundStyle={[styles.sheetBackground, { backgroundColor }]}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetView style={styles.sheetContent}>
        <ThemedText style={[styles.sheetTitle, { color: titleColor }]}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.sheetDescription, { color: textColor }]}>
          {description}
        </ThemedText>
        <View style={styles.sheetActions}>
          <Pressable
            style={[
              styles.sheetButton,
              styles.sheetButtonSecondary,
              { borderColor },
            ]}
            onPress={onCancel}
          >
            <View style={styles.sheetBtnRow}>
              <MaterialIcons
                name="close"
                size={16}
                color={getGoalsNeutralIconColor(isDark)}
              />
              <ThemedText style={styles.sheetButtonSecondaryText}>
                {cancelLabel}
              </ThemedText>
            </View>
          </Pressable>
          <Pressable
            style={[styles.sheetButton, styles.sheetButtonDanger]}
            onPress={onConfirm}
          >
            <View style={styles.sheetBtnRow}>
              <MaterialIcons name="delete-forever" size={16} color={GOALS_WHITE_ICON} />
              <ThemedText style={styles.sheetButtonDangerText}>
                {deleteLabel}
              </ThemedText>
            </View>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

