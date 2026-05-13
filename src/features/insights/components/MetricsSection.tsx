import React, { memo } from "react";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { styles } from "../styles";
import { money, SupportedLanguage } from "../utils/insights";
import { Palette } from "./InsightsShared";

type MetricsSectionProps = {
  health: number;
  incomeTotal: number;
  isRtl: boolean;
  language: SupportedLanguage;
  net: number;
  palette: Palette;
  primaryCurrency: string;
  spendTotal: number;
};

export const MetricsSection = memo(function MetricsSection({
  health,
  incomeTotal,
  isRtl,
  language,
  net,
  palette,
  primaryCurrency,
  spendTotal,
}: MetricsSectionProps) {
  const metrics = [
    {
      title: language === "ar" ? "إجمالي الإنفاق" : "Total spending",
      value: money(spendTotal, primaryCurrency),
      icon: "trending-down-outline" as const,
      color: palette.orange,
      meta: language === "ar" ? "خارجي" : "Outgoing",
    },
    {
      title: language === "ar" ? "إجمالي الدخل" : "Total income",
      value: money(incomeTotal, primaryCurrency),
      icon: "trending-up-outline" as const,
      color: palette.green,
      meta: language === "ar" ? "داخلي" : "Incoming",
    },
    {
      title: language === "ar" ? "صافي التدفق" : "Net flow",
      value: money(net, primaryCurrency),
      icon: "swap-horizontal-outline" as const,
      color: net >= 0 ? palette.green : palette.purple,
      meta:
        net >= 0
          ? language === "ar"
            ? "موجب"
            : "Positive"
          : language === "ar"
            ? "يحتاج ضبطًا"
            : "Needs tuning",
    },
  ];

  return (
    <View style={styles.metricsGrid}>
      {metrics.map((item, index) => (
        <Animated.View
          key={item.title}
          entering={FadeInUp.delay(index * 60)}
          style={[styles.metricCard, { backgroundColor: palette.card, borderColor: palette.border }]}
        >
          <View style={styles.metricTop}>
            <View style={[styles.metricIcon, { backgroundColor: `${item.color}18` }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <MaterialCommunityIcons name="star-four-points-outline" size={16} color={palette.muted} />
          </View>
          <Text style={[styles.metricTitle, isRtl ? styles.textRtl : null, { color: palette.muted }]}>
            {item.title}
          </Text>
          <Text style={[styles.metricValue, isRtl ? styles.textRtl : null, { color: palette.colorsText }]}>
            {item.value}
          </Text>
          <Text style={[styles.metricMeta, isRtl ? styles.textRtl : null, { color: item.color }]}>
            {item.meta}
          </Text>
        </Animated.View>
      ))}
      <Animated.View entering={FadeInUp.delay(180)} style={styles.metricCard}>
        <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={styles.health}>
          <Text style={[styles.healthLabel, isRtl ? styles.textRtl : null]}>
            {language === "ar" ? "الصحة المالية" : "Financial health"}
          </Text>
          <Text style={[styles.healthValue, isRtl ? styles.textRtl : null]}>{health.toFixed(1)}/10</Text>
          <Text style={[styles.healthText, isRtl ? styles.textRtl : null]}>
            {health >= 8
              ? language === "ar"
                ? "توازن ممتاز وتوزيع إنفاق جيد."
                : "Excellent balance with strong control over spending."
              : health >= 6
                ? language === "ar"
                  ? "الوضع جيد، راقب أعلى فئة فقط."
                  : "Healthy overall. Keep an eye on your top category."
                : language === "ar"
                  ? "ابدأ بمراقبة الفئات المتكررة والكبيرة."
                  : "Start by reducing repeated and heavy categories."}
          </Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
});