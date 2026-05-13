import React from "react";

import { StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";

type AuthScreenHeaderProps = {
  delay?: number;
  title: string;
};

export function AuthScreenHeader({ delay = 0, title }: AuthScreenHeaderProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(delay)}
      style={styles.header}
    >
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.brand}>MONOPAY</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  title: {
    fontSize: 40,
    fontFamily: Fonts.rounded,
    includeFontPadding: false,
    lineHeight: 48,
  },
  brand: {
    fontSize: 22,
    fontFamily: Fonts.rounded,
    includeFontPadding: false,
    letterSpacing: 1.5,
    lineHeight: 28,
    color: "#8B5CF6",
  },
});