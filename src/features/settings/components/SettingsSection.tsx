import React from "react";

import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "../styles";

type SettingsSectionProps = {
  children: React.ReactNode;
  color: string;
  isRtl: boolean;
  title: string;
};

export function SettingsSection({ children, color, isRtl, title }: SettingsSectionProps) {
  return (
    <>
      <ThemedText
        style={[styles.sectionLabel, { color }, isRtl ? styles.sectionLabelRtl : null]}
      >
        {title}
      </ThemedText>
      <View>{children}</View>
    </>
  );
}