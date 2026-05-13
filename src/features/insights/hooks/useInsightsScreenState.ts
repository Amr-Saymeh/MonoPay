import { useState } from "react";

import { ChartView, FlowFilter, SortMode, TimeWindow } from "../utils/insights";

export function useInsightsScreenState() {
  const [window, setWindow] = useState<TimeWindow>("30D");
  const [flow, setFlow] = useState<FlowFilter>("all");
  const [currency, setCurrency] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [chart, setChart] = useState<ChartView>("trend");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [chartWidth, setChartWidth] = useState(0);

  return {
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
  };
}