import React, { memo, useMemo, useState } from "react";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from "react-native-reanimated";

import { styles } from "../styles";
import {
  BreakdownItem,
  CategoryOption,
  ChartView,
  Entry,
  FlowFilter,
  IconName,
  money,
  SortMode,
  SupportedLanguage,
  TimeWindow,
  WEEKDAYS,
  WINDOWS,
} from "../utils/insights";

type Palette = {
  bg: string;
  blue: string;
  border: string;
  card: string;
  colorsText: string;
  green: string;
  muted: string;
  orange: string;
  purple: string;
  scheme: "light" | "dark";
};

type ChipProps = {
  active: boolean;
  color: string;
  icon?: IconName;
  label: string;
  onPress: () => void;
  textColor: string;
};

function Chip({ active, color, icon, label, onPress, textColor }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? color : "transparent",
          borderColor: active ? color : "rgba(148,163,184,0.3)",
        },
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? "#fff" : textColor} />
      ) : null}
      <Text style={[styles.chipText, { color: active ? "#fff" : textColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}

type ModalOption = {
  key: string;
  label: string;
  color?: string;
};

type FilterSelectorProps = {
  accent: string;
  isRtl: boolean;
  label: string;
  onPress: () => void;
  palette: Palette;
  value: string;
};

function FilterSelector({
  accent,
  isRtl,
  label,
  onPress,
  palette,
  value,
}: FilterSelectorProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.selectorCard,
        isRtl ? styles.selectorCardRtl : null,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <Text
        style={[
          styles.selectorLabel,
          isRtl ? styles.textRtl : null,
          { color: palette.muted },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.selectorValueRow,
          isRtl ? styles.selectorValueRowRtl : null,
        ]}
      >
        <Text
          style={[
            styles.selectorValue,
            isRtl ? styles.textRtl : null,
            { color: palette.colorsText },
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
        <Ionicons
          name={isRtl ? "chevron-back" : "chevron-forward"}
          size={18}
          color={accent}
        />
      </View>
    </Pressable>
  );
}

type SelectorModalProps = {
  onClose: () => void;
  onSelect: (key: string) => void;
  options: ModalOption[];
  palette: Palette;
  selected: string;
  title: string;
  visible: boolean;
};

function SelectorModal({
  onClose,
  onSelect,
  options,
  palette,
  selected,
  title,
  visible,
}: SelectorModalProps) {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalSheet,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
          onPress={() => undefined}
        >
          <View
            style={[styles.modalGrabber, { backgroundColor: palette.border }]}
          />
          <Text style={[styles.modalTitle, { color: palette.colorsText }]}>
            {title}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const active = option.key === selected;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    onSelect(option.key);
                    onClose();
                  }}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: active
                        ? `${option.color ?? palette.purple}18`
                        : "transparent",
                      borderColor: active
                        ? (option.color ?? palette.purple)
                        : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color: active
                          ? (option.color ?? palette.purple)
                          : palette.colorsText,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function lineSegments(
  points: { x: number; y: number }[],
  color: string,
) {
  return points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    const dx = next.x - point.x;
    const dy = next.y - point.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    return (
      <View
        key={`${color}-${index}`}
        style={[
          styles.segment,
          {
            width: length,
            left: (point.x + next.x) / 2 - length / 2,
            top: (point.y + next.y) / 2 - 1.5,
            backgroundColor: color,
            transform: [{ rotateZ: `${angle}rad` }],
          },
        ]}
      />
    );
  });
}

type HeroSectionProps = {
  avg: number;
  filteredLength: number;
  isRtl: boolean;
  language: SupportedLanguage;
  palette: Palette;
  primaryCurrency: string;
  profileName?: string | null;
  title: string;
};

export const HeroSection = memo(function HeroSection({
  avg,
  filteredLength,
  isRtl,
  language,
  palette,
  primaryCurrency,
  profileName,
  title,
}: HeroSectionProps) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <LinearGradient
        colors={
          palette.scheme === "dark"
            ? ["#24143A", "#211F5F", "#123B66"]
            : ["#B166F8", "#8B5CF6", "#4F7DDB"]
        }
        style={styles.hero}
      >
        <View style={[styles.heroTop, isRtl ? styles.rowRtl : null]}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons
              name={isRtl ? "arrow-forward" : "arrow-back"}
              size={20}
              color="#fff"
            />
          </Pressable>
        </View>
        <Text style={[styles.heroTitle, isRtl ? styles.textRtl : null]}>
          {title}
        </Text>
        <Text style={[styles.heroSubtitle, isRtl ? styles.textRtl : null]}>
          {language === "ar"
            ? `لوحة تفاعلية متقدمة مبنية فقط من حركاتك أنت${profileName ? `، ${profileName}` : ""}.`
            : `An interactive analytics workspace built only from your own activity${profileName ? `, ${profileName}` : ""}.`}
        </Text>
        <View style={[styles.heroMiniRow, isRtl ? styles.rowRtl : null]}>
          <View style={styles.heroMini}>
            <Text style={[styles.heroMiniLabel, isRtl ? styles.textRtl : null]}>
              {language === "ar" ? "الحركات" : "Visible moves"}
            </Text>
            <Text style={[styles.heroMiniValue, isRtl ? styles.textRtl : null]}>
              {filteredLength}
            </Text>
          </View>
          <View style={styles.heroMini}>
            <Text style={[styles.heroMiniLabel, isRtl ? styles.textRtl : null]}>
              {language === "ar" ? "متوسط الحركة" : "Avg. move"}
            </Text>
            <Text style={[styles.heroMiniValue, isRtl ? styles.textRtl : null]}>
              {money(avg, primaryCurrency)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

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
          style={[
            styles.metricCard,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <View style={styles.metricTop}>
            <View
              style={[
                styles.metricIcon,
                { backgroundColor: `${item.color}18` },
              ]}
            >
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <MaterialCommunityIcons
              name="star-four-points-outline"
              size={16}
              color={palette.muted}
            />
          </View>
          <Text
            style={[
              styles.metricTitle,
              isRtl ? styles.textRtl : null,
              { color: palette.muted },
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.metricValue,
              isRtl ? styles.textRtl : null,
              { color: palette.colorsText },
            ]}
          >
            {item.value}
          </Text>
          <Text
            style={[
              styles.metricMeta,
              isRtl ? styles.textRtl : null,
              { color: item.color },
            ]}
          >
            {item.meta}
          </Text>
        </Animated.View>
      ))}
      <Animated.View entering={FadeInUp.delay(180)} style={styles.metricCard}>
        <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={styles.health}>
          <Text style={[styles.healthLabel, isRtl ? styles.textRtl : null]}>
            {language === "ar" ? "الصحة المالية" : "Financial health"}
          </Text>
          <Text style={[styles.healthValue, isRtl ? styles.textRtl : null]}>
            {health.toFixed(1)}/10
          </Text>
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

type ControlsSectionProps = {
  categories: CategoryOption[];
  category: string;
  chart: ChartView;
  currencies: string[];
  currency: string;
  flow: FlowFilter;
  isRtl: boolean;
  language: SupportedLanguage;
  palette: Palette;
  setCategory: (value: string) => void;
  setChart: (value: ChartView) => void;
  setCurrency: (value: string) => void;
  setFlow: (value: FlowFilter) => void;
  setWindow: (value: TimeWindow) => void;
  window: TimeWindow;
};

export const ControlsSection = memo(function ControlsSection({
  categories,
  category,
  chart,
  currencies,
  currency,
  flow,
  isRtl,
  language,
  palette,
  setCategory,
  setChart,
  setCurrency,
  setFlow,
  setWindow,
  window,
}: ControlsSectionProps) {
  const [modalKey, setModalKey] = useState<
    "window" | "flow" | "currency" | "category" | null
  >(null);

  const modalTitle =
    modalKey === "window"
      ? language === "ar"
        ? "الفترة الزمنية"
        : "Time window"
      : modalKey === "flow"
        ? language === "ar"
          ? "نوع الحركة"
          : "Flow type"
        : modalKey === "currency"
          ? language === "ar"
            ? "العملة"
            : "Currency"
          : language === "ar"
            ? "الفئة"
            : "Category";

  const modalOptions = useMemo<ModalOption[]>(() => {
    if (modalKey === "window") {
      return WINDOWS.map((item) => ({
        key: item,
        label: item,
        color: palette.purple,
      }));
    }

    if (modalKey === "flow") {
      return [
        {
          key: "all",
          label: language === "ar" ? "الكل" : "All flow",
          color: palette.purple,
        },
        {
          key: "send",
          label: language === "ar" ? "الإنفاق" : "Spending",
          color: palette.orange,
        },
        {
          key: "receive",
          label: language === "ar" ? "الدخل" : "Income",
          color: palette.green,
        },
      ];
    }

    if (modalKey === "currency") {
      return [
        {
          key: "ALL",
          label: language === "ar" ? "الكل" : "All currencies",
          color: palette.blue,
        },
        ...currencies.map((item) => ({
          key: item,
          label: item,
          color: palette.blue,
        })),
      ];
    }

    return [
      {
        key: "ALL",
        label: language === "ar" ? "الكل" : "All categories",
        color: palette.orange,
      },
      ...categories.map((item) => ({
        key: item.key,
        label: item.label,
        color: item.color,
      })),
    ];
  }, [
    categories,
    currencies,
    language,
    modalKey,
    palette.blue,
    palette.green,
    palette.orange,
    palette.purple,
  ]);

  const selectedValue =
    modalKey === "window"
      ? window
      : modalKey === "flow"
        ? flow
        : modalKey === "currency"
          ? currency
          : category;

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          isRtl ? styles.textRtl : null,
          { color: palette.colorsText },
        ]}
      >
        {language === "ar"
          ? "عرض أبسط وتحكم أسرع"
          : "Simpler controls, faster reads"}
      </Text>
      <Text
        style={[
          styles.sectionSub,
          isRtl ? styles.textRtl : null,
          { color: palette.muted },
        ]}
      >
        {language === "ar"
          ? "اختر الفترة ونوع الحركة والتركيز الحالي بدون ازدحام بصري"
          : "Choose the time, flow, and focus without visual clutter"}
      </Text>
      <View style={styles.compactFilters}>
        <View
          style={[styles.selectorGrid, isRtl ? styles.selectorGridRtl : null]}
        >
          <FilterSelector
            accent={palette.purple}
            isRtl={isRtl}
            label={language === "ar" ? "الفترة" : "Period"}
            onPress={() => setModalKey("window")}
            palette={palette}
            value={window}
          />
          <FilterSelector
            accent={
              flow === "receive"
                ? palette.green
                : flow === "send"
                  ? palette.orange
                  : palette.purple
            }
            isRtl={isRtl}
            label={language === "ar" ? "الحركة" : "Flow"}
            onPress={() => setModalKey("flow")}
            palette={palette}
            value={
              flow === "all"
                ? language === "ar"
                  ? "الكل"
                  : "All flow"
                : flow === "send"
                  ? language === "ar"
                    ? "الإنفاق"
                    : "Spending"
                  : language === "ar"
                    ? "الدخل"
                    : "Income"
            }
          />
          <FilterSelector
            accent={palette.blue}
            isRtl={isRtl}
            label={language === "ar" ? "العملة" : "Currency"}
            onPress={() => setModalKey("currency")}
            palette={palette}
            value={
              currency === "ALL"
                ? language === "ar"
                  ? "الكل"
                  : "All currencies"
                : currency
            }
          />
          <FilterSelector
            accent={palette.orange}
            isRtl={isRtl}
            label={language === "ar" ? "الفئة" : "Category"}
            onPress={() => setModalKey("category")}
            palette={palette}
            value={
              category === "ALL"
                ? language === "ar"
                  ? "الكل"
                  : "All categories"
                : (categories.find((item) => item.key === category)?.label ??
                  category)
            }
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.row, isRtl ? styles.rowRtl : null]}
        >
          {[
            {
              key: "trend",
              label: language === "ar" ? "الاتجاه" : "Trend",
              icon: "analytics-outline" as const,
            },
            {
              key: "categories",
              label: language === "ar" ? "التوزيع" : "Breakdown",
              icon: "pie-chart-outline" as const,
            },
            {
              key: "rhythm",
              label: language === "ar" ? "الإيقاع" : "Rhythm",
              icon: "pulse-outline" as const,
            },
          ].map((item) => (
            <Chip
              key={item.key}
              active={chart === item.key}
              color={palette.purple}
              icon={item.icon}
              label={item.label}
              onPress={() => setChart(item.key as ChartView)}
              textColor={palette.colorsText}
            />
          ))}
        </ScrollView>
      </View>
      <SelectorModal
        onClose={() => setModalKey(null)}
        onSelect={(key) => {
          if (modalKey === "window") setWindow(key as TimeWindow);
          if (modalKey === "flow") setFlow(key as FlowFilter);
          if (modalKey === "currency") setCurrency(key);
          if (modalKey === "category") setCategory(key);
        }}
        options={modalOptions}
        palette={palette}
        selected={selectedValue}
        title={modalTitle}
        visible={modalKey !== null}
      />
    </View>
  );
});

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
  setChart: (value: ChartView) => void;
  spendTotal: number;
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
  spendTotal,
  topAmountBase,
  trend,
  weekday,
}: ChartsSectionProps) {
  const usableWidth = Math.max(chartWidth - 48, 1);
  const spendPoints = trend.map((item, index) => ({
    x:
      24 +
      (trend.length > 1 ? usableWidth / (trend.length - 1) : usableWidth) *
        index,
    y: 140 - (item.spend / maxTrend) * 110,
  }));
  const incomePoints = trend.map((item, index) => ({
    x:
      24 +
      (trend.length > 1 ? usableWidth / (trend.length - 1) : usableWidth) *
        index,
    y: 140 - (item.income / maxTrend) * 110,
  }));

  return (
    <View
      style={[styles.section, { backgroundColor: card, borderColor: border }]}
    >
      <Text
        style={[
          styles.sectionTitle,
          isRtl ? styles.textRtl : null,
          { color: colorsText },
        ]}
      >
        {language === "ar"
          ? "اقرأ بياناتك بأكثر من طريقة"
          : "Read your data in multiple ways"}
      </Text>
      <Text
        style={[
          styles.sectionSub,
          isRtl ? styles.textRtl : null,
          { color: muted },
        ]}
      >
        {language === "ar"
          ? "الاتجاهات، التوزيع، والإيقاع الأسبوعي"
          : "Trends, distribution, and weekly rhythm"}
      </Text>
      {chart === "trend" ? (
        <View
          onLayout={onChartLayout}
          style={[styles.chartCard, { borderColor: border }]}
        >
          <View style={[styles.legend, isRtl ? styles.legendRtl : null]}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: orange }]} />
              <Text style={[styles.legendText, { color: muted }]}>
                {language === "ar" ? "الإنفاق" : "Spending"}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: green }]} />
              <Text style={[styles.legendText, { color: muted }]}>
                {language === "ar" ? "الدخل" : "Income"}
              </Text>
            </View>
          </View>
          <View style={styles.chartArea}>
            {[0, 0.5, 1].map((ratio) => (
              <View
                key={ratio}
                style={[
                  styles.grid,
                  { top: 18 + (1 - ratio) * 110, borderColor: border },
                ]}
              />
            ))}
            {lineSegments(spendPoints, orange)}
            {lineSegments(incomePoints, green)}
            {spendPoints.map((point, index) => (
              <View
                key={`s-${index}`}
                style={[
                  styles.point,
                  {
                    left: point.x - 4,
                    top: point.y - 4,
                    backgroundColor: orange,
                  },
                ]}
              />
            ))}
            {incomePoints.map((point, index) => (
              <View
                key={`i-${index}`}
                style={[
                  styles.point,
                  {
                    left: point.x - 4,
                    top: point.y - 4,
                    backgroundColor: green,
                  },
                ]}
              />
            ))}
            {trend.map((item, index) => (
              <Text
                key={item.label}
                style={[
                  styles.xLabel,
                  { left: (spendPoints[index]?.x ?? 24) - 18, color: muted },
                ]}
              >
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
              {language === "ar"
                ? "لا توجد بيانات كافية للفئات"
                : "No category data for these filters"}
            </Text>
          ) : (
            breakdown.slice(0, 6).map((item, index) => (
              <Animated.View
                key={item.key}
                entering={FadeInRight.delay(index * 50)}
                style={styles.barRow}
              >
                <View
                  style={[styles.barHead, isRtl ? styles.barHeadRtl : null]}
                >
                  <View
                    style={[
                      styles.barTitleWrap,
                      isRtl ? styles.barTitleWrapRtl : null,
                    ]}
                  >
                    <View
                      style={[
                        styles.metricIcon,
                        { backgroundColor: `${item.color}18` },
                      ]}
                    >
                      <Ionicons name={item.icon} size={16} color={item.color} />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.barTitle,
                          isRtl ? styles.textRtl : null,
                          { color: colorsText },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.barMeta,
                          isRtl ? styles.textRtl : null,
                          { color: muted },
                        ]}
                      >
                        {Math.round(
                          (item.amount / Math.max(topAmountBase || 1, 1)) * 100,
                        )}
                        %
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.barAmount,
                      isRtl ? styles.textRtl : null,
                      { color: colorsText },
                    ]}
                  >
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
              <Text style={[styles.legendText, { color: muted }]}>
                {language === "ar" ? "إنفاق" : "Spend"}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: green }]} />
              <Text style={[styles.legendText, { color: muted }]}>
                {language === "ar" ? "دخل" : "Income"}
              </Text>
            </View>
          </View>
          <View style={styles.rhythm}>
            {weekday.map((item) => (
              <View key={item.day} style={styles.day}>
                <View style={styles.dayBars}>
                  <View
                    style={[
                      styles.dayBar,
                      {
                        height: `${(item.spend / maxWeekdayValue) * 100}%`,
                        backgroundColor: orange,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.dayBar,
                      {
                        height: `${(item.income / maxWeekdayValue) * 100}%`,
                        backgroundColor: green,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, { color: muted }]}>
                  {WEEKDAYS[language][item.day]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
});

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
  primaryCurrency: string;
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
  primaryCurrency,
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
      value: largestEntry
        ? `${largestEntry.title} · ${money(largestEntry.amount, largestEntry.currency)}`
        : "—",
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
          style={[
            styles.insight,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <View
            style={[styles.metricIcon, { backgroundColor: `${item.color}18` }]}
          >
            <Ionicons name={item.icon} size={18} color={item.color} />
          </View>
          <Text
            style={[
              styles.insightTitle,
              isRtl ? styles.textRtl : null,
              { color: muted },
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.insightValue,
              isRtl ? styles.textRtl : null,
              { color: colorsText },
            ]}
            numberOfLines={2}
          >
            {item.value}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
});

type HighlightsSectionProps = {
  colorsText: string;
  green: string;
  highlights: Entry[];
  isRtl: boolean;
  language: SupportedLanguage;
  muted: string;
  orange: string;
  palette: Palette;
  setSortMode: (value: SortMode) => void;
  sortMode: SortMode;
};

export const HighlightsSection = memo(function HighlightsSection({
  colorsText,
  green,
  highlights,
  isRtl,
  language,
  muted,
  orange,
  palette,
  setSortMode,
  sortMode,
}: HighlightsSectionProps) {
  return (
    <View>
      <View style={[styles.headerRow, isRtl ? styles.headerRowRtl : null]}>
        <View>
          <Text
            style={[
              styles.sectionTitle,
              isRtl ? styles.textRtl : null,
              { color: colorsText },
            ]}
          >
            {language === "ar" ? "أهم الحركات" : "Highlighted movements"}
          </Text>
          <Text
            style={[
              styles.sectionSub,
              isRtl ? styles.textRtl : null,
              { color: muted },
            ]}
          >
            {language === "ar"
              ? "الأحدث أو الأكبر قيمة"
              : "Latest or highest-value activity"}
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, isRtl ? styles.rowRtl : null]}
      >
        <Chip
          active={sortMode === "recent"}
          color={palette.purple}
          icon="time-outline"
          label={language === "ar" ? "الأحدث" : "Recent"}
          onPress={() => setSortMode("recent")}
          textColor={colorsText}
        />
        <Chip
          active={sortMode === "largest"}
          color={palette.purple}
          icon="trophy-outline"
          label={language === "ar" ? "الأكبر" : "Largest"}
          onPress={() => setSortMode("largest")}
          textColor={colorsText}
        />
      </ScrollView>
      {highlights.length === 0 ? (
        <View
          style={[
            styles.empty,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Ionicons name="wallet-outline" size={24} color={muted} />
          <Text style={[styles.emptyTitle, { color: colorsText }]}>
            {language === "ar"
              ? "لا توجد بيانات ضمن هذه الفلاتر"
              : "No data under the current filters"}
          </Text>
          <Text style={[styles.emptySub, { color: muted }]}>
            {language === "ar"
              ? "جرّب فترة أو عملة أو فئة مختلفة."
              : "Try a different period, currency, or category."}
          </Text>
        </View>
      ) : (
        highlights.map((item) => (
          <Animated.View
            key={`${item.source}-${item.id}`}
            entering={FadeInRight.duration(280)}
            style={[
              styles.move,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <View style={[styles.moveMain, isRtl ? styles.moveMainRtl : null]}>
              <View
                style={[
                  styles.metricIcon,
                  { backgroundColor: `${item.color}18` },
                ]}
              >
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.moveText}>
                <Text
                  style={[
                    styles.moveTitle,
                    isRtl ? styles.textRtl : null,
                    { color: colorsText },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.moveMeta,
                    isRtl ? styles.textRtl : null,
                    { color: muted },
                  ]}
                  numberOfLines={1}
                >
                  {item.categoryLabel} ·{" "}
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
                {item.note ? (
                  <Text
                    style={[
                      styles.moveMeta,
                      isRtl ? styles.textRtl : null,
                      { color: muted },
                    ]}
                    numberOfLines={1}
                  >
                    {item.note}
                  </Text>
                ) : null}
              </View>
            </View>
            <Text
              style={[
                styles.moveAmount,
                { color: item.type === "receive" ? green : orange },
              ]}
            >
              {item.type === "receive" ? "+" : "-"}
              {money(item.amount, item.currency)}
            </Text>
          </Animated.View>
        ))
      )}
    </View>
  );
});
