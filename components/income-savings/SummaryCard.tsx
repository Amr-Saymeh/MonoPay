import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";

interface SummaryCardProps {
  sourceCount: number;
  estimatedMonthlyTotal: number;
}

export function SummaryCard({ sourceCount, estimatedMonthlyTotal }: SummaryCardProps) {
  const { t } = useI18n();
  const formattedMonthlyTotal = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(estimatedMonthlyTotal);

  return (
    <View style={styles.summaryCard}>
      <LinearGradient
        colors={["#B166F8", "#864CBD", "#435799"]}
        start={{ x: 0.1, y: 0.3 }}
        end={{ x: 0.9, y: 0.8 }}
        style={styles.summaryGradient}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryIconWrap}>
            <MaterialIcons name="savings" size={20} color="#FFF" />
          </View>
          <View style={styles.summaryContent}>
            <ThemedText style={styles.summaryLabel}>{t("incomeSavings.summaryRegularSources")}</ThemedText>
            <ThemedText style={styles.summaryAmount}>{sourceCount}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.remainingText}>
          {t("incomeSavings.summaryEstimatedMonthlyInflow")}: {formattedMonthlyTotal}
        </ThemedText>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  summaryIconWrap: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFF",
  },
  remainingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
});
