import React, { memo } from "react";

import { Ionicons } from "@expo/vector-icons";
import { LayoutChangeEvent, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { styles } from "../styles";
import { BreakdownItem, ChartView, SupportedLanguage, WEEKDAYS, money } from "../utils/insights";
import { lineSegments } from "./InsightsShared";

type ChartsSectionProps = {
  border: string;
  breakdown: BreakdownItem[];
  card: string;
  chart: ChartView;
  chartWidth: number;
  colorsText: string;
  green: string;
  isRtl: boolean;
  language: SupportedLanguage;
  maxTrend: number;
  maxWeekdayValue: number;
  muted: string;
  onChartLayout: (event: LayoutChangeEvent) => void;
  orange: string;
  primaryCurrency: string;
  topAmountBase: number;
  trend: { label: string; spend: number; income: number }[];
  weekday: { day: number; spend: number; income: number }[];
};

export const ChartsSection = memo(function ChartsSection({
  border,
  breakdown,
  card,
  chart,
  chartWidth,
  colorsText,
  green,
  isRtl,
  language,
  maxTrend,
  maxWeekdayValue,
  muted,
  onChartLayout,
  orange,
  primaryCurrency,
  topAmountBase,
  trend,
  weekday,
}: ChartsSectionProps) {
  const usableWidth = Math.max(chartWidth - 48, 1);
  const spendPoints = trend.map((item, index) => ({
    x: 24 + (trend.length > 1 ? usableWidth / (trend.length - 1) : usableWidth) * index,
    y: 140 - (item.spend / maxTrend) * 110,
  }));
  const incomePoints = trend.map((item, index) => ({
    x: 24 + (trend.length > 1 ? usableWidth / (trend.length - 1) : usableWidth) * index,
    y: 140 - (item.income / maxTrend) * 110,
  }));

  return (
    <View style={[styles.section, { backgroundColor: card, borderColor: border }]}>
      <Text style={[styles.sectionTitle, isRtl ? styles.textRtl : null, { color: colorsText }]}>
        {language === "ar" ? "اقرأ بياناتك بأكثر من طريقة" : "Read your data in multiple ways"}
      </Text>
      <Text style={[styles.sectionSub, isRtl ? styles.textRtl : null, { color: muted }]}>
        {language === "ar" ? "الاتجاهات، التوزيع، والإيقاع الأسبوعي" : "Trends, distribution, and weekly rhythm"}
      </Text>

      {chart === "trend" ? (
        <View onLayout={onChartLayout} style={[styles.chartCard, { borderColor: border }]}>
          <View style={[styles.legend, isRtl ? styles.legendRtl : null]}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: orange }]} />
              <Text style={[styles.legendText, { color: muted }]}>{language === "ar" ? "الإنفاق" : "Spending"}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: green }]} />
              <Text style={[styles.legendText, { color: muted }]}>{language === "ar" ? "الدخل" : "Income"}</Text>
            </View>
          </View>

          <View style={styles.chartArea}>
            {[0, 0.5, 1].map((ratio) => (
              <View key={ratio} style={[styles.grid, { top: 18 + (1 - ratio) * 110, borderColor: border }]} />
            ))}
            {lineSegments(spendPoints, orange)}
            {lineSegments(incomePoints, green)}
            {spendPoints.map((point, index) => (
              <View
                key={`s-${index}`}
                style={[styles.point, { left: point.x - 4, top: point.y - 4, backgroundColor: orange }]}
              />
            ))}
            {incomePoints.map((point, index) => (
              <View
                key={`i-${index}`}
                style={[styles.point, { left: point.x - 4, top: point.y - 4, backgroundColor: green }]}
              />
            ))}
            {trend.map((item, index) => (
              <Text key={item.label} style={[styles.xLabel, { left: (spendPoints[index]?.x ?? 24) - 18, color: muted }]}>
                {item.label}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {chart === "categories" ? (
        <View style={[styles.chartCard, { borderColor: border }]}>
          {breakdown.length === 0 ? (
            <Text style={[styles.emptySub, { color: muted }]}>
              {language === "ar" ? "لا توجد بيانات كافية للفئات" : "No category data for these filters"}
            </Text>
          ) : (
            breakdown.slice(0, 6).map((item, index) => (
              <Animated.View key={item.key} entering={FadeInRight.delay(index * 50)} style={styles.barRow}>
                <View style={[styles.barHead, isRtl ? styles.barHeadRtl : null]}>
                  <View style={[styles.barTitleWrap, isRtl ? styles.barTitleWrapRtl : null]}>
                    <View style={[styles.metricIcon, { backgroundColor: `${item.color}18` }]}>
                      <Ionicons name={item.icon} size={16} color={item.color} />
                    </View>
                    <View>
                      <Text style={[styles.barTitle, isRtl ? styles.textRtl : null, { color: colorsText }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.barMeta, isRtl ? styles.textRtl : null, { color: muted }]}>
                        {Math.round((item.amount / Math.max(topAmountBase || 1, 1)) * 100)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.barAmount, isRtl ? styles.textRtl : null, { color: colorsText }]}>
                    {money(item.amount, primaryCurrency)}
                  </Text>
                </View>
                <View style={[styles.track, { backgroundColor: border }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${Math.max((item.amount / Math.max(breakdown[0]?.amount ?? 1, 1)) * 100, 6)}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </Animated.View>
            ))
          )}
        </View>
      ) : null}

      {chart === "rhythm" ? (
        <View style={[styles.chartCard, { borderColor: border }]}>
          <View style={[styles.legend, isRtl ? styles.legendRtl : null]}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: orange }]} />
              <Text style={[styles.legendText, { color: muted }]}>{language === "ar" ? "إنفاق" : "Spend"}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: green }]} />
              <Text style={[styles.legendText, { color: muted }]}>{language === "ar" ? "دخل" : "Income"}</Text>
            </View>
          </View>
          <View style={styles.rhythm}>
            {weekday.map((item) => (
              <View key={item.day} style={styles.day}>
                <View style={styles.dayBars}>
                  <View style={[styles.dayBar, { height: `${(item.spend / maxWeekdayValue) * 100}%`, backgroundColor: orange }]} />
                  <View style={[styles.dayBar, { height: `${(item.income / maxWeekdayValue) * 100}%`, backgroundColor: green }]} />
                </View>
                <Text style={[styles.dayLabel, { color: muted }]}>{WEEKDAYS[language][item.day]}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
});