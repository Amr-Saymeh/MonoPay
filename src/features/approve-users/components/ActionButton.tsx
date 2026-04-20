import React from "react";

import { Pressable } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "../styles";

type ActionButtonProps = {
  label: string;
  variant: "approve" | "reject";
  onPress: () => void;
  disabled?: boolean;
};

export function ActionButton({ label, variant, onPress, disabled }: ActionButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        variant === "approve" ? styles.actionApprove : styles.actionReject,
        pressed ? styles.actionPressed : null,
        disabled ? styles.actionDisabled : null,
      ]}
    >
      <ThemedText type="defaultSemiBold" style={styles.actionLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
