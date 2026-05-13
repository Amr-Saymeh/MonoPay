import React, { memo } from "react";

import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { styles } from "../styles";
import { BreakdownItem, Entry, SupportedLanguage, WEEKDAYS, money } from "../utils/insights";
import { Palette } from "./InsightsShared";

type InsightsGridProps = {
  busiestDay: number;
  categoryBaseTotal: number;
  colorsText: string;
  filteredLength: number;
  isRtl: boolean;
  language: SupportedLanguage;
  largestEntry: Entry | null;
  muted: string;
  palette: Palette;
  top?: BreakdownItem;
};

export const InsightsGrid = memo(function InsightsGrid({
  busiestDay,
  categoryBaseTotal,
  colorsText,
  filteredLength,
  isRtl,
  language,
  largestEntry,
  muted,
  palette,
  top,
}: InsightsGridProps) {
  const cards = [
    {
      title: language === "ar" ? "أعلى فئة" : "Top category",
      value: top
        ? `${top.label} · ${Math.round((top.amount / Math.max(categoryBaseTotal, 1)) * 100)}%`
        : language === "ar"
          ? "لا يوجد"
          : "No data",
      icon: "pie-chart-outline" as const,
      color: top?.color ?? palette.purple,
    },
    {
      title: language === "ar" ? "أكبر حركة" : "Largest move",
      value: largestEntry ? `${largestEntry.title} · ${money(largestEntry.amount, largestEntry.currency)}` : "—",
      icon: "sparkles-outline" as const,
      color: palette.orange,
    },
    {
      title: language === "ar" ? "عدد الحركات" : "Activity count",
      value: `${filteredLength}`,
      icon: "stats-chart-outline" as const,
      color: palette.blue,
    },
    {
      title: language === "ar" ? "اليوم الأكثر نشاطًا" : "Busiest day",
      value: `${WEEKDAYS[language][busiestDay]}`,
      icon: "calendar-outline" as const,
      color: palette.green,
    },
  ];

  return (
    <View style={styles.insightGrid}>
      {cards.map((item, index) => (
        <Animated.View
          key={item.title}
          entering={FadeInUp.delay(index * 40)}
          style={[styles.insight, { backgroundColor: palette.card, borderColor: palette.border }]}
        >
          <View style={[styles.metricIcon, { backgroundColor: `${item.color}18` }]}>
            <Ionicons name={item.icon} size={18} color={item.color} />
          </View>
          <Text style={[styles.insightTitle, isRtl ? styles.textRtl : null, { color: muted }]}>
            {item.title}
          </Text>
          <Text
            style={[styles.insightValue, isRtl ? styles.textRtl : null, { color: colorsText }]}
            numberOfLines={2}
          >
            {item.value}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
});