import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { MaterialIcons } from "@expo/vector-icons";
import React, { type RefObject, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { hapticSuccess } from "@/src/utils/haptics";

type FeedbackBottomSheetProps = {
  modalRef: RefObject<BottomSheetModal | null>;
  isDark: boolean;
  title: string;
  description: string;
  actionLabel: string;
  titleIcon?: keyof typeof MaterialIcons.glyphMap;
  actionIcon?: keyof typeof MaterialIcons.glyphMap;
  onAction: () => void;
  onDismiss?: () => void;
  bottomInset?: number;
};

export function FeedbackBottomSheet({
  modalRef,
  isDark,
  title,
  description,
  actionLabel,
  titleIcon,
  actionIcon = "check",
  onAction,
  onDismiss,
  bottomInset = 0,
}: FeedbackBottomSheetProps) {
  const snapPoints = useMemo(() => ["34%"], []);
  const sheetBg = isDark ? "#181124" : "#FFFFFF";
  const sheetHandle = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)";
  const sheetTitle = isDark ? "#F5F3FF" : "#1F2937";
  const sheetText = isDark ? "rgba(255,255,255,0.75)" : "#4B5563";

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={0}
      bottomInset={bottomInset}
      enablePanDownToClose
      onDismiss={onDismiss}
      handleIndicatorStyle={[styles.sheetHandle, { backgroundColor: sheetHandle }]}
      backgroundStyle={[styles.sheetBackground, { backgroundColor: sheetBg }]}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetView style={styles.sheetContent}>
        <View style={styles.titleRow}>
          {titleIcon ? <MaterialIcons name={titleIcon} size={22} color={sheetTitle} /> : null}
          <ThemedText style={[styles.sheetTitle, { color: sheetTitle }]}>{title}</ThemedText>
        </View>
        <ThemedText style={[styles.sheetDescription, { color: sheetText }]}>
          {description}
        </ThemedText>
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              hapticSuccess();
              onAction();
            }}
          >
            <View style={styles.primaryRow}>
              <MaterialIcons name={actionIcon} size={16} color="#FFFFFF" />
              <ThemedText style={styles.primaryBtnText}>{actionLabel}</ThemedText>
            </View>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    width: 44,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sheetDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 6,
  },
  primaryBtn: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#7C3AED",
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
