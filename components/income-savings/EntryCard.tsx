import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import type { IncomeSource } from "@/src/services/incomeSources.service";
import { hapticWarning } from "@/src/utils/haptics";

interface EntryCardProps {
  item: IncomeSource;
  cardBg: string;
  cardBorder: string;
  regularityTextColor: string;
  onDelete: (item: IncomeSource) => void;
}

export function EntryCard({ item, cardBg, cardBorder, regularityTextColor, onDelete }: EntryCardProps) {
  const { t } = useI18n();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(item.amount || 0));

  const sourceTypeLabel = (() => {
    switch (item.type) {
      case "salary":
        return t("incomeSavings.categories.salary");
      case "loan":
        return t("incomeSavings.categories.loan");
      case "freelance":
        return t("incomeSavings.categories.freelance");
      case "investment":
        return t("incomeSavings.categories.investment");
      default:
        return t("incomeSavings.categories.other");
    }
  })();

  const regularityLabel = (() => {
    switch (item.regularity) {
      case "daily":
        return t("incomeSavings.daily");
      case "weekly":
        return t("incomeSavings.weekly");
      case "yearly":
        return t("incomeSavings.yearly");
      default:
        return t("incomeSavings.monthly");
    }
  })();

  const handleDeletePress = () => {
    hapticWarning();
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 12,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -12,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 8,
        duration: 85,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -8,
        duration: 85,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => onDelete(item));
  };

  return (
    <Animated.View
      style={[
        styles.sourceCard,
        { backgroundColor: cardBg, borderColor: cardBorder },
        { transform: [{ translateX: shakeAnimation }] },
      ]}
    >
      <View style={styles.sourceHeader}>
        <ThemedText style={styles.sourceTitle}>{sourceTypeLabel}</ThemedText>
        <Pressable onPress={handleDeletePress} style={styles.sourceDelete}>
          <MaterialIcons name="delete" size={24} color="#EF4444" />
        </Pressable>
      </View>

      <ThemedText style={styles.sourceAmount}>
        {formattedAmount} {String(item.currency || "usd").toUpperCase()}
      </ThemedText>

      <View style={styles.sourceMetaRow}>
        <ThemedText style={styles.sourceMeta}>{t("incomeSavings.walletLabel")}: {item.walletName}</ThemedText>
        <View style={styles.regularityPill}>
          <ThemedText style={[styles.regularityPillText, { color: regularityTextColor }]}> 
            {regularityLabel}
          </ThemedText>
        </View>
      </View>

      {!!item.notes && <ThemedText style={styles.sourceNotes}>{item.notes}</ThemedText>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sourceCard: {
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "rgba(124,58,237,0.08)",
    gap: 8,
  },
  sourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7C3AED",
  },
  sourceDelete: {
    padding: 4,
  },
  sourceAmount: {
    fontSize: 22,
    fontWeight: "700",
  },
  sourceMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  sourceMeta: {
    fontSize: 13,
    opacity: 0.7,
    flex: 1,
  },
  regularityPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(16,185,129,0.16)",
    borderColor: "rgba(16,185,129,0.45)",
    borderWidth: 1,
  },
  regularityPillText: {
    color: "#065F46",
    fontSize: 11,
    fontWeight: "700",
  },
  sourceNotes: {
    fontSize: 12,
    opacity: 0.7,
  },
});
