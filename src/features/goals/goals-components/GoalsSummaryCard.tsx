import { ThemedText } from "@/components/themed-text";
import { hapticTap } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";

import { GOALS_SUMMARY_GRADIENT, GOALS_WHITE_ICON } from "../constants";
import { styles } from "../stylesheet";

type GoalsSummaryCardProps = {
  totalSaved: string;
  remaining: string;
  progress: number;
  totalSavedLabel: string;
  addLabel: string;
  progressLabel: string;
  remainingLabel: string;
  onAdd: () => void;
};

export function GoalsSummaryCard({
  totalSaved,
  remaining,
  progress,
  totalSavedLabel,
  addLabel,
  progressLabel,
  remainingLabel,
  onAdd,
}: GoalsSummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <LinearGradient
        colors={GOALS_SUMMARY_GRADIENT}
        start={{ x: 0.1, y: 0.3 }}
        end={{ x: 0.9, y: 0.8 }}
        style={styles.summaryGradient}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryIconWrap}>
            <MaterialIcons name="account-balance-wallet" size={20} color={GOALS_WHITE_ICON} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.summaryLabel}>{totalSavedLabel}</ThemedText>
            <ThemedText style={styles.summaryAmount}>${totalSaved}</ThemedText>
          </View>
          <Pressable
            style={styles.addSmallBtn}
            onPress={() => {
              hapticTap();
              onAdd();
            }}
          >
            <View style={styles.addSmallRow}>
              <MaterialIcons name="add-circle-outline" size={14} color={GOALS_WHITE_ICON} />
              <ThemedText style={styles.addSmallText}>{addLabel}</ThemedText>
            </View>
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.progressMeta}>
          <ThemedText style={styles.progressLabel}>{progressLabel}</ThemedText>
          <ThemedText style={styles.progressPercent}>
            {(progress * 100).toFixed(1)}%
          </ThemedText>
        </View>
        <ThemedText style={styles.remainingText}>
          ${remaining} {remainingLabel}
        </ThemedText>
      </LinearGradient>
    </View>
  );
}

