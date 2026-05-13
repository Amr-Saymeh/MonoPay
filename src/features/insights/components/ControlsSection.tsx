import React, { memo, useMemo, useState } from "react";

import { ScrollView, Text, View } from "react-native";

import { styles } from "../styles";
import {
    CategoryOption,
    ChartView,
    FlowFilter,
    SupportedLanguage,
    TimeWindow,
    WINDOWS,
} from "../utils/insights";
import { Chip, FilterSelector, Palette, SelectorModal } from "./InsightsShared";

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
  const [modalKey, setModalKey] = useState<"window" | "flow" | "currency" | "category" | null>(null);

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

  const modalOptions = useMemo(() => {
    if (modalKey === "window") {
      return WINDOWS.map((item) => ({ key: item, label: item, color: palette.purple }));
    }

    if (modalKey === "flow") {
      return [
        { key: "all", label: language === "ar" ? "الكل" : "All flow", color: palette.purple },
        { key: "send", label: language === "ar" ? "الإنفاق" : "Spending", color: palette.orange },
        { key: "receive", label: language === "ar" ? "الدخل" : "Income", color: palette.green },
      ];
    }

    if (modalKey === "currency") {
      return [
        { key: "ALL", label: language === "ar" ? "الكل" : "All currencies", color: palette.blue },
        ...currencies.map((item) => ({ key: item, label: item, color: palette.blue })),
      ];
    }

    return [
      { key: "ALL", label: language === "ar" ? "الكل" : "All categories", color: palette.orange },
      ...categories.map((item) => ({ key: item.key, label: item.label, color: item.color })),
    ];
  }, [categories, currencies, language, modalKey, palette.blue, palette.green, palette.orange, palette.purple]);

  const selectedValue = modalKey === "window" ? window : modalKey === "flow" ? flow : modalKey === "currency" ? currency : category;

  return (
    <View style={[styles.section, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Text style={[styles.sectionTitle, isRtl ? styles.textRtl : null, { color: palette.colorsText }]}>
        {language === "ar" ? "عرض أبسط وتحكم أسرع" : "Simpler controls, faster reads"}
      </Text>
      <Text style={[styles.sectionSub, isRtl ? styles.textRtl : null, { color: palette.muted }]}>
        {language === "ar"
          ? "اختر الفترة ونوع الحركة والتركيز الحالي بدون ازدحام بصري"
          : "Choose the time, flow, and focus without visual clutter"}
      </Text>
      <View style={styles.compactFilters}>
        <View style={[styles.selectorGrid, isRtl ? styles.selectorGridRtl : null]}>
          <FilterSelector
            accent={palette.purple}
            isRtl={isRtl}
            label={language === "ar" ? "الفترة" : "Period"}
            onPress={() => setModalKey("window")}
            palette={palette}
            value={window}
          />
          <FilterSelector
            accent={flow === "receive" ? palette.green : flow === "send" ? palette.orange : palette.purple}
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
            value={currency === "ALL" ? (language === "ar" ? "الكل" : "All currencies") : currency}
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
                : categories.find((item) => item.key === category)?.label ?? category
            }
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, isRtl ? styles.rowRtl : null]}>
          {[
            { key: "trend", label: language === "ar" ? "الاتجاه" : "Trend", icon: "analytics-outline" as const },
            { key: "categories", label: language === "ar" ? "التوزيع" : "Breakdown", icon: "pie-chart-outline" as const },
            { key: "rhythm", label: language === "ar" ? "الإيقاع" : "Rhythm", icon: "pulse-outline" as const },
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