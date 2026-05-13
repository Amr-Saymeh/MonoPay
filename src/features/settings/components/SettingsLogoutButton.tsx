import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "../styles";

type SettingsLogoutButtonProps = {
  color: string;
  disabled: boolean;
  isRtl: boolean;
  label: string;
  onPress: () => void;
};

export function SettingsLogoutButton({
  color,
  disabled,
  isRtl,
  label,
  onPress,
}: SettingsLogoutButtonProps) {
  return (
    <Pressable
      style={[
        styles.logoutBtn,
        isRtl ? styles.logoutBtnRtl : null,
        {
          borderWidth: 1.5,
          borderColor: color,
          borderRadius: 16,
          marginHorizontal: 4,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <MaterialIcons name="logout" size={20} color={color} />
      <ThemedText style={[styles.logoutText, { color }]}>{label}</ThemedText>
    </Pressable>
  );
}