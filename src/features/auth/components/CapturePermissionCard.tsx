import React from "react";

import { ActivityIndicator, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";

type CapturePermissionCardProps = {
  actionLabel: string;
  activityColor?: string;
  description: string;
  loading?: boolean;
  onPress: () => void;
  title?: string;
};

export function CapturePermissionCard({
  actionLabel,
  activityColor,
  description,
  loading,
  onPress,
  title,
}: CapturePermissionCardProps) {
  return (
    <ThemedView style={styles.permission}>
      <Animated.View entering={FadeInDown.duration(450)} style={styles.card}>
        {loading ? <ActivityIndicator size="small" color={activityColor} /> : null}
        {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}
        <ThemedText style={styles.text}>{description}</ThemedText>
        <GradientButton label={actionLabel} onPress={onPress} />
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  permission: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 28, 0.08)",
    backgroundColor: "rgba(17, 24, 28, 0.03)",
  },
  text: {
    marginBottom: 6,
    opacity: 0.7,
  },
});