import { useI18n } from "@/hooks/use-i18n";
import { InsightsLoading } from "@/src/features/insights/components/InsightsLoading";
import {
  ChartsSection,
  ControlsSection,
  HeroSection,
  HighlightsSection,
  InsightsGrid,
  MetricsSection,
} from "@/src/features/insights/components/InsightsSections";
import { useInsightsPalette } from "@/src/features/insights/hooks/useInsightsPalette";
import { useSpendingInsightsData } from "@/src/features/insights/hooks/useSpendingInsightsData";
import { styles } from "@/src/features/insights/styles";
import { ChartView, FlowFilter, SortMode, TimeWindow } from "@/src/features/insights/utils/insights";
import { useAuth } from "@/src/providers/AuthProvider";
import { useState } from "react";
import { LayoutChangeEvent, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SpendingInsightsScreen() {
  const { user, profile } = useAuth();
  const { t, language, isRtl } = useI18n();
  const palette = useInsightsPalette();
  const insets = useSafeAreaInsets();
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("30D");
  const [flow, setFlow] = useState<FlowFilter>("all");
  const [currency, setCurrency] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [chart, setChart] = useState<ChartView>("categories");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [chartWidth, setChartWidth] = useState(0);

  const {
    avg,
    breakdown,
    busiestDay,
    categories,
    categoryBaseTotal,
    conversionLoaded,
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
    window: timeWindow,
  });

  const primaryCurrency = currency !== "ALL" ? currency : "NIS";

  if (!loaded || (currency === "ALL" && !conversionLoaded)) {
    return (
      <InsightsLoading
        backgroundColor={palette.bg}
        loadingColor={palette.purple}
        mutedColor={palette.muted}
      />
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}> 
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 18,
            paddingBottom: Math.max(30, insets.bottom + 30),
          },
        ]}
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
          setWindow={setTimeWindow}
          window={timeWindow}
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
          onChartLayout={(event: LayoutChangeEvent) => setChartWidth(event.nativeEvent.layout.width)}
          orange={palette.orange}
          primaryCurrency={primaryCurrency}
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
    </View>
  );
}