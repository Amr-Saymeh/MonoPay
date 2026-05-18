import {
  FlowFilter,
  SortMode,
  SupportedLanguage,
  TimeWindow,
} from "../utils/insights";
import { useInsightCalculations } from "./useInsightCalculations";
import { useInsightEntries } from "./useInsightEntries";
import { useNisRates } from "./useNisRates";

type Params = {
  category: string;
  currency: string;
  flow: FlowFilter;
  language: SupportedLanguage;
  selectedCategories?: readonly string[];
  sortMode: SortMode;
  uid?: string;
  window: TimeWindow;
};

export function useSpendingInsightsData({
  category,
  currency,
  flow,
  language,
  selectedCategories,
  sortMode,
  uid,
  window,
}: Params) {
  const { entries, loaded } = useInsightEntries(uid, language);
  const { currencies, nisRates, conversionLoaded } = useNisRates(entries);
  const calculations = useInsightCalculations({
    entries,
    nisRates,
    category,
    currency,
    flow,
    language,
    selectedCategories,
    sortMode,
    timeWindow: window,
  });

  return {
    ...calculations,
    conversionLoaded,
    currencies,
    entries,
    loaded,
  };
}
