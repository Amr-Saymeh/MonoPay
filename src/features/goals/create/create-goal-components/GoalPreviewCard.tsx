import { ThemedText } from "@/components/themed-text";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

import {
  CREATE_GOAL_PREVIEW_GRADIENT,
} from "../constants";
import { GOALS_SOFT_WHITE_ICON } from "../../constants";
import { styles } from "../stylesheet";

type GoalPreviewCardProps = {
  title: string;
  fallbackTitle: string;
  targetLabel: string;
  amount: string;
  targetDate: number | null;
};

export function GoalPreviewCard({
  title,
  fallbackTitle,
  targetLabel,
  amount,
  targetDate,
}: GoalPreviewCardProps) {
  return (
    <LinearGradient
      colors={CREATE_GOAL_PREVIEW_GRADIENT}
      start={{ x: 0.1, y: 0.25 }}
      end={{ x: 0.9, y: 0.85 }}
      style={styles.previewCard}
    >
      <MaterialIcons name="savings" size={28} color={GOALS_SOFT_WHITE_ICON} />
      <ThemedText style={styles.previewTitle} numberOfLines={2} ellipsizeMode="tail">
        {title || fallbackTitle}
      </ThemedText>
      <ThemedText style={styles.previewSub}>{targetLabel}</ThemedText>
      <ThemedText style={styles.previewAmount}>{amount}</ThemedText>
      {targetDate ? (
        <ThemedText style={styles.previewDate}>
          {new Date(targetDate).toLocaleDateString()}
        </ThemedText>
      ) : null}
      <View style={styles.previewCircleTop} />
      <View style={styles.previewCircleBottom} />
    </LinearGradient>
  );
}

