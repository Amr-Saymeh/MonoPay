import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import { LayoutChangeEvent, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
import { useInsightsScreenState } from "@/src/features/insights/hooks/useInsightsScreenState";
import { useSpendingInsightsData } from "@/src/features/insights/hooks/useSpendingInsightsData";
import { styles } from "@/src/features/insights/styles";
import { useAuth } from "@/src/providers/AuthProvider";

export default function SpendingInsightsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const scheme = useColorScheme() ?? "light";
  const { user, profile } = useAuth();
  const { t, language, isRtl } = useI18n();
  const colors = Colors[scheme];

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      const actionType = event.data.action?.type;

      if (actionType !== "GO_BACK" && actionType !== "POP" && actionType !== "POP_TO_TOP") {
        return;
      }

      event.preventDefault();
      router.back();
    });

    return unsubscribe;
  }, [navigation, router]);

  const {
    category,
    chart,
    chartWidth,
    currency,
    flow,
    setCategory,
    setChart,
    setChartWidth,
    setCurrency,
    setFlow,
    setSortMode,
    setWindow,
    sortMode,
    window,
  } = useInsightsScreenState();

  const palette = {
    bg: colors.background,
    blue: "#38BDF8",
    card: scheme === "dark" ? "#12171E" : "#FFFFFF",
    border: colors.border,
    colorsText: colors.text,
    green: "#22C55E",
    muted: scheme === "dark" ? "rgba(236,237,238,0.65)" : "rgba(17,24,28,0.55)",
    orange: "#F97316",
    purple: "#A855F7",
    scheme,
  } as const;

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

  const primaryCurrency = currency !== "ALL" ? currency : (currencies[0] ?? "USD");

  if (!loaded) {
    return (
      <InsightsLoading
        backgroundColor={palette.bg}
        loadingColor={palette.purple}
        mutedColor={palette.muted}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.bg }]}> 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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
    </SafeAreaView>
  );
}