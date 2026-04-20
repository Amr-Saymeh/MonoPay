import React, { useState } from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/src/providers/AuthProvider";
import {
    ActivityIndicator,
    LayoutChangeEvent,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    ChartsSection,
    ControlsSection,
    HeroSection,
    HighlightsSection,
    InsightsGrid,
    MetricsSection,
} from "../components/InsightsSections";
import { useSpendingInsightsData } from "../hooks/useSpendingInsightsData";
import { styles } from "../styles";
import { ChartView, FlowFilter, SortMode, TimeWindow } from "../utils/insights";

export default function SpendingInsightsScreen() {
  const scheme = useColorScheme() ?? "light";
  const { user, profile } = useAuth();
  const { t, language, isRtl } = useI18n();
  const colors = Colors[scheme];

  const palette = {
    bg: colors.background,
    card: scheme === "dark" ? "#12171E" : "#FFFFFF",
    border: colors.border,
    muted: scheme === "dark" ? "rgba(236,237,238,0.65)" : "rgba(17,24,28,0.55)",
    purple: "#A855F7",
    green: "#22C55E",
    orange: "#F97316",
    blue: "#38BDF8",
    colorsText: colors.text,
    scheme,
  } as const;

  const [window, setWindow] = useState<TimeWindow>("30D");
  const [flow, setFlow] = useState<FlowFilter>("all");
  const [currency, setCurrency] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [chart, setChart] = useState<ChartView>("trend");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [chartWidth, setChartWidth] = useState(0);

  const {
    avg,
    breakdown,
    busiestDay,
    categories,
    categoryBaseTotal,
    currencies,
    filtered,
    health,
    highlights,
    incomeTotal,
    largestEntry,
    loaded,
    maxTrend,
    maxWeekdayValue,
    net,
    spendTotal,
    top,
    trend,
    weekday,
  } = useSpendingInsightsData({
    category,
    currency,
    flow,
    language,
    selectedCategories: profile?.categories ?? [],
    sortMode,
    uid: user?.uid,
    window,
  });

  const primaryCurrency =
    currency !== "ALL" ? currency : (currencies[0] ?? "USD");

  if (!loaded) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: palette.bg }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.purple} />
          <Text style={[styles.loadingText, { color: palette.muted }]}>
            Preparing your insights…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HeroSection
          avg={avg}
          filteredLength={filtered.length}
          isRtl={isRtl}
          language={language}
          palette={palette}
          primaryCurrency={primaryCurrency}
          profileName={profile?.name}
          title={t("spendingInsights")}
        />

        <MetricsSection
          health={health}
          incomeTotal={incomeTotal}
          isRtl={isRtl}
          language={language}
          net={net}
          palette={palette}
          primaryCurrency={primaryCurrency}
          spendTotal={spendTotal}
        />

        <ControlsSection
          categories={categories}
          category={category}
          chart={chart}
          currencies={currencies}
          currency={currency}
          flow={flow}
          isRtl={isRtl}
          language={language}
          palette={palette}
          setCategory={setCategory}
          setChart={setChart}
          setCurrency={setCurrency}
          setFlow={setFlow}
          setWindow={setWindow}
          window={window}
        />

        <ChartsSection
          border={palette.border}
          breakdown={breakdown}
          card={palette.card}
          chart={chart}
          chartWidth={chartWidth}
          colorsText={palette.colorsText}
          green={palette.green}
          isRtl={isRtl}
          language={language}
          maxTrend={maxTrend}
          maxWeekdayValue={maxWeekdayValue}
          muted={palette.muted}
          onChartLayout={(event: LayoutChangeEvent) =>
            setChartWidth(event.nativeEvent.layout.width)
          }
          orange={palette.orange}
          primaryCurrency={primaryCurrency}
          setChart={setChart}
          spendTotal={spendTotal}
          topAmountBase={categoryBaseTotal}
          trend={trend}
          weekday={weekday}
        />

        <InsightsGrid
          busiestDay={busiestDay?.day ?? 0}
          categoryBaseTotal={categoryBaseTotal}
          colorsText={palette.colorsText}
          filteredLength={filtered.length}
          isRtl={isRtl}
          language={language}
          largestEntry={largestEntry}
          muted={palette.muted}
          palette={palette}
          primaryCurrency={primaryCurrency}
          top={top}
        />

        <HighlightsSection
          colorsText={palette.colorsText}
          green={palette.green}
          highlights={highlights}
          isRtl={isRtl}
          language={language}
          muted={palette.muted}
          orange={palette.orange}
          palette={palette}
          setSortMode={setSortMode}
          sortMode={sortMode}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
