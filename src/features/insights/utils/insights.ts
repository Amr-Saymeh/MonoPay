import { Ionicons } from "@expo/vector-icons";

import { localizeCategoryList } from "@/src/features/categories/data";

export type SupportedLanguage = "en" | "ar";
export type IconName = keyof typeof Ionicons.glyphMap;

export type TimeWindow = "7D" | "30D" | "90D" | "1Y" | "ALL";
export type FlowFilter = "all" | "send" | "receive";
export type ChartView = "trend" | "categories" | "rhythm";
export type SortMode = "recent" | "largest";

export type Entry = {
  id: string;
  source: "transaction" | "purchase";
  amount: number;
  currency: string;
  type: "send" | "receive";
  title: string;
  note: string;
  categoryKey: string;
  categoryLabel: string;
  color: string;
  icon: IconName;
  timestamp: number;
};

export type CategoryOption = {
  key: string;
  label: string;
  color: string;
};

export type BreakdownItem = {
  key: string;
  label: string;
  amount: number;
  color: string;
  icon: IconName;
};

export type WeekdayItem = {
  day: number;
  spend: number;
  income: number;
  count: number;
};

export type TrendItem = {
  label: string;
  spend: number;
  income: number;
};

export const WINDOWS: TimeWindow[] = ["7D", "30D", "90D", "1Y", "ALL"];

export const WEEKDAYS: Record<SupportedLanguage, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ar: ["ح", "ن", "ث", "ر", "خ", "ج", "س"],
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  NIS: "₪",
  ILS: "₪",
  JOD: "JD",
  EUR: "€",
  EGP: "E£",
};

const CATEGORY_META: Record<
  string,
  {
    en: string;
    ar: string;
    color: string;
    icon: IconName;
  }
> = {
  shopping: {
    en: "Shopping",
    ar: "التسوق",
    color: "#EC4899",
    icon: "bag-handle-outline",
  },
  fooddrinks: {
    en: "Food & Drink",
    ar: "الطعام والمشروبات",
    color: "#F59E0B",
    icon: "restaurant-outline",
  },
  food: {
    en: "Food",
    ar: "الطعام",
    color: "#F59E0B",
    icon: "fast-food-outline",
  },
  groceries: {
    en: "Groceries",
    ar: "البقالة",
    color: "#14B8A6",
    icon: "basket-outline",
  },
  bills: {
    en: "Bills",
    ar: "الفواتير",
    color: "#2DD4BF",
    icon: "receipt-outline",
  },
  transport: {
    en: "Transport",
    ar: "المواصلات",
    color: "#6366F1",
    icon: "car-sport-outline",
  },
  health: {
    en: "Health",
    ar: "الصحة",
    color: "#EF4444",
    icon: "medkit-outline",
  },
  education: {
    en: "Education",
    ar: "التعليم",
    color: "#8B5CF6",
    icon: "school-outline",
  },
  family: {
    en: "Family",
    ar: "العائلة",
    color: "#F97316",
    icon: "people-outline",
  },
  salary: {
    en: "Salary",
    ar: "الراتب",
    color: "#22C55E",
    icon: "cash-outline",
  },
  savings: {
    en: "Savings",
    ar: "المدخرات",
    color: "#06B6D4",
    icon: "wallet-outline",
  },
  goal: {
    en: "Goals",
    ar: "الأهداف",
    color: "#A855F7",
    icon: "flag-outline",
  },
  other: {
    en: "Other",
    ar: "أخرى",
    color: "#94A3B8",
    icon: "apps-outline",
  },
  default: {
    en: "General",
    ar: "عام",
    color: "#64748B",
    icon: "ellipse-outline",
  },
};

const CATEGORY_ALIASES = Object.entries(CATEGORY_META).reduce<
  Record<string, string>
>((acc, [key, meta]) => {
  acc[normalizeCategoryToken(key)] = key;
  acc[normalizeCategoryToken(meta.en)] = key;
  acc[normalizeCategoryToken(meta.ar)] = key;
  return acc;
}, {});

function normalizeCategoryToken(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s|&|\//g, "");
}

export function normalizeCurrency(value: unknown) {
  return String(value ?? "USD")
    .trim()
    .toUpperCase();
}

export function normalizeCategory(raw: unknown, language: SupportedLanguage) {
  const rawLabel = String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ");
  const alias = normalizeCategoryToken(raw);
  const key = (CATEGORY_ALIASES[alias] ?? alias) || "other";
  const meta = CATEGORY_META[key] ?? CATEGORY_META.other;
  return {
    key,
    label: CATEGORY_META[key] ? meta[language] : rawLabel || meta[language],
    color: meta.color,
    icon: meta.icon,
  };
}

export function normalizeCategoryKey(value: string) {
  const alias = normalizeCategoryToken(value);
  return CATEGORY_ALIASES[alias] ?? alias;
}

export function mapSelectedCategoryOptions(
  values: readonly string[],
  language: SupportedLanguage,
) {
  return localizeCategoryList(values, language).map((value) => {
    const meta = normalizeCategory(value, language);
    return {
      key: normalizeCategoryKey(value) || meta.key,
      label: value,
      color: meta.color,
    } satisfies CategoryOption;
  });
}

export function parseTimestamp(raw: any) {
  const numeric = Number(
    raw?.["transaction date"] ?? raw?.timestamp ?? raw?.createdAt ?? 0,
  );
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parsed = Date.parse(String(raw?.createdAt ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function money(amount: number, currency: string) {
  const code = normalizeCurrency(currency);
  const symbol = CURRENCY_SYMBOLS[code] ?? code;
  return `${symbol}${amount.toLocaleString(undefined, {
    maximumFractionDigits: amount >= 1000 ? 0 : 2,
  })}`;
}

export function startWindow(window: TimeWindow) {
  if (window === "ALL") return 0;
  const day = 24 * 60 * 60 * 1000;
  const map = { "7D": 7, "30D": 30, "90D": 90, "1Y": 365 };
  return Date.now() - map[window] * day;
}

export function belongsToUserPurchase(raw: any, uid: string) {
  const keys = [
    "uid",
    "userId",
    "ownerUid",
    "createdByUid",
    "creatorUid",
    "buyerUid",
    "purchaserUid",
    "senderUid",
    "receiverUid",
  ];

  return (
    keys.some((key) => String(raw?.[key] ?? "") === uid) ||
    Boolean(raw?.members?.[uid]) ||
    (Array.isArray(raw?.participants) && raw.participants.includes(uid))
  );
}

export function buildBreakdown(entries: Entry[]) {
  const map = new Map<string, BreakdownItem>();

  entries.forEach((item) => {
    map.set(item.categoryKey, {
      key: item.categoryKey,
      label: item.categoryLabel,
      amount: (map.get(item.categoryKey)?.amount ?? 0) + item.amount,
      color: item.color,
      icon: item.icon,
    });
  });

  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

export function buildWeekday(entries: Entry[]) {
  const weekday = Array.from({ length: 7 }, (_, day) => ({
    day,
    spend: 0,
    income: 0,
    count: 0,
  }));

  entries.forEach((item) => {
    const day = new Date(item.timestamp).getDay();
    weekday[day].count += 1;
    if (item.type === "send") weekday[day].spend += item.amount;
    else weekday[day].income += item.amount;
  });

  return weekday;
}

export function buildTrend(
  entries: Entry[],
  window: TimeWindow,
  language: SupportedLanguage,
  windowStart: number,
) {
  const bucketCount = window === "7D" ? 7 : 6;
  const start =
    windowStart ||
    Math.min(...entries.map((item) => item.timestamp), Date.now());
  const step =
    bucketCount === 7
      ? 24 * 60 * 60 * 1000
      : Math.max(Math.floor((Date.now() - start) / bucketCount), 1);

  return Array.from({ length: bucketCount }, (_, index) => {
    const from = start + index * step;
    const to = index === bucketCount - 1 ? Date.now() + 1 : from + step;
    const items = entries.filter(
      (entry) => entry.timestamp >= from && entry.timestamp < to,
    );

    return {
      label:
        window === "7D"
          ? WEEKDAYS[language][new Date(from).getDay()]
          : `${new Date(from).getDate()}/${new Date(from).getMonth() + 1}`,
      spend: items
        .filter((item) => item.type === "send")
        .reduce((sum, item) => sum + item.amount, 0),
      income: items
        .filter((item) => item.type === "receive")
        .reduce((sum, item) => sum + item.amount, 0),
    } satisfies TrendItem;
  });
}

export function getHealthScore(args: {
  incomeTotal: number;
  net: number;
  topCategoryAmount: number;
  spendTotal: number;
  activityCount: number;
}) {
  const { incomeTotal, net, topCategoryAmount, spendTotal, activityCount } =
    args;

  return Math.max(
    0,
    Math.min(
      10,
      6 +
        (incomeTotal ? (net / incomeTotal) * 3 : 0) -
        (topCategoryAmount / Math.max(spendTotal, 1)) * 1.5 +
        Math.min(activityCount / 12, 1.5),
    ),
  );
}
