import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useAnimatedListItem } from "../hooks";
import { SharedLog } from "../types";

interface HistoryRowProps {
  item: SharedLog;
  index: number;
  isLast: boolean;
  actorLabel: string;
}

function formatCurrency(code: string) {
  return code.trim().toUpperCase();
}

function formatAmount(value: number) {
  return Number(value).toFixed(2);
}

export function HistoryRow({
  item,
  index,
  isLast,
  actorLabel,
}: HistoryRowProps) {
  const anim = useAnimatedListItem(index * 55 + 260);
  const isPositive = item.amount >= 0;
  const date = new Date(item.createdAt);

  return (
    <Animated.View style={[styles.historyRow, !isLast && styles.historyRowBorder, anim]}>
      <View style={[styles.historyDot, { backgroundColor: isPositive ? "#a78bfa" : "#c084fc" }]} />
      <View style={styles.historyInfo}>
        <ThemedText style={styles.historyText} numberOfLines={1}>
          {item.reason || (isPositive ? "Add money" : "Spend")}
        </ThemedText>
        <ThemedText style={styles.historySub} numberOfLines={1}>
          {actorLabel} · {date.toLocaleDateString()}
        </ThemedText>
      </View>
      <ThemedText style={[styles.historyAmount, isPositive ? styles.amountPositive : styles.amountNegative]}>
        {isPositive ? "+" : ""}
        {formatAmount(item.amount)} {formatCurrency(item.currency)}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  historyRow: {
     flexDirection: "row",
     alignItems: "center", 
     paddingVertical: 10, 
     gap: 10 
    },
  historyRowBorder: { 
    borderBottomWidth: 1, 
    borderBottomColor: "#e2dff0" 
  },
  historyDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    flexShrink: 0 
  },
  historyInfo: { 
    flex: 1 
  },
  historyText: { 
    fontSize: 13 
  },
  historySub: { 
    fontSize: 11, 
    opacity: 0.6, 
    marginTop: 2 
  },
  historyAmount: { 
    fontSize: 12, 
    fontFamily: Fonts.sansBold 
  },
  amountPositive: { 
    color: "#7c3aed" 
  },
  amountNegative: { 
    color: "#c084fc" 
  },
});
