import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { hapticError, hapticTap } from "@/src/utils/haptics";

type AppDialogModalProps = {
  visible: boolean;
  isDark: boolean;
  title: string;
  description: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  actionLabel: string;
  onClose: () => void;
};

export function AppDialogModal({
  visible,
  isDark,
  title,
  description,
  icon = "error-outline",
  actionLabel,
  onClose,
}: AppDialogModalProps) {
  React.useEffect(() => {
    if (visible) hapticError();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.card, { backgroundColor: isDark ? "#1F1B2E" : "#FFFFFF" }]}>
          <View style={styles.titleRow}>
            <MaterialIcons name={icon} size={22} color={isDark ? "#F5F3FF" : "#1F2937"} />
            <ThemedText style={styles.title}>{title}</ThemedText>
          </View>
          <ThemedText style={[styles.description, { color: isDark ? "rgba(255,255,255,0.78)" : "#4B5563" }]}>
            {description}
          </ThemedText>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              hapticTap();
              onClose();
            }}
          >
            <View style={styles.primaryRow}>
              <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
              <ThemedText style={styles.primaryText}>{actionLabel}</ThemedText>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.58)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#7C3AED",
  },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
