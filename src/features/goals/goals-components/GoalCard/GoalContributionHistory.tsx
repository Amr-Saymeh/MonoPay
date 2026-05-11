import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import { hapticSelection } from "@/src/utils/haptics";

import type { GoalContribution } from "./GoalCard";
import { formatCurrency, formatDateTime } from "./goalCard.utils";

type GoalContributionHistoryProps = {
  contributions: GoalContribution[];
};

export function GoalContributionHistory({
  contributions,
}: GoalContributionHistoryProps) {
  const { t } = useI18n();
  const historyOpacity = useRef(new Animated.Value(0)).current;
  const historyTranslateY = useRef(new Animated.Value(-8)).current;
  const [showHistory, setShowHistory] = useState(false);
  const [isHistoryMounted, setIsHistoryMounted] = useState(false);

  const handleToggleHistory = () => {
    hapticSelection();
    if (showHistory) {
      Animated.parallel([
        Animated.timing(historyOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(historyTranslateY, {
          toValue: -8,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHistory(false);
        setIsHistoryMounted(false);
      });
      return;
    }

    setIsHistoryMounted(true);
    setShowHistory(true);
  };

  useEffect(() => {
    if (!isHistoryMounted || !showHistory) return;
    historyOpacity.setValue(0);
    historyTranslateY.setValue(-8);
    Animated.parallel([
      Animated.timing(historyOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(historyTranslateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isHistoryMounted, showHistory, historyOpacity, historyTranslateY]);

  if (contributions.length === 0) return null;

  return (
    <>
      <Pressable style={styles.historyToggle} onPress={handleToggleHistory}>
        <View style={styles.historyToggleLeft}>
          <MaterialIcons name="history" size={16} color="#EDE9FE" />
          <ThemedText style={styles.historyToggleText}>
            {showHistory
              ? t("goals.hideContributionHistory")
              : t("goals.showContributionHistory")}
          </ThemedText>
        </View>
        <MaterialIcons
          name={showHistory ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={20}
          color="#EDE9FE"
        />
      </Pressable>

      {isHistoryMounted && (
        <Animated.View
          style={[
            styles.historyAnimatedContainer,
            {
              opacity: historyOpacity,
              transform: [{ translateY: historyTranslateY }],
            },
          ]}
        >
          <View style={styles.contributionsBox}>
            <ThemedText style={styles.contributionsTitle}>
              {t("goals.yourContributions")}
            </ThemedText>
            {contributions.map((contribution, index) => (
              <GoalContributionRow
                key={`${contribution.createdAt}-${index}`}
                contribution={contribution}
              />
            ))}
          </View>
        </Animated.View>
      )}
    </>
  );
}

function GoalContributionRow({
  contribution,
}: {
  contribution: GoalContribution;
}) {
  return (
    <View style={styles.contributionRow}>
      <View style={styles.contributionContent}>
        <ThemedText style={styles.contributionAmount}>
          {formatCurrency(contribution.amount, contribution.currency)}
        </ThemedText>
        <ThemedText style={styles.contributionDate}>
          {formatDateTime(contribution.createdAt)}
        </ThemedText>
        {!!contribution.reason && (
          <ThemedText style={styles.contributionReason}>
            {contribution.reason}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  historyToggle: {
    marginTop: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  historyToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyToggleText: {
    color: "#EDE9FE",
    fontSize: 12,
    fontWeight: "600",
  },
  historyAnimatedContainer: {
    overflow: "hidden",
  },
  contributionsBox: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
    paddingTop: 10,
    gap: 8,
    marginBottom: 8,
  },
  contributionsTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  contributionRow: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 4,
  },
  contributionContent: {
    flex: 1,
  },
  contributionAmount: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  contributionDate: {
    color: "#EDE9FE",
    fontSize: 11,
    marginTop: 1,
  },
  contributionReason: {
    color: "#EDE9FE",
    fontSize: 12,
    marginTop: 4,
  },
});

