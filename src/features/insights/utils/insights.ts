import { Ionicons } from "@expo/vector-icons";

import {
  localizeCategoryList,
  localizeKnownCategoryName,
} from "@/src/features/settings/components/category-suggestions/data";

export type SupportedLanguage = "en" | "ar";
export type IconName = keyof typeof Ionicons.glyphMap;

export type TimeWindow = "7D" | "30D" | "90D" | "1Y" | "ALL";
export type FlowFilter = "all" | "send" | "receive";
export type ChartView = "trend" | "categories" | "rhythm";
export type SortMode = "recent" | "largest";

export type Entry = {
  id: string;
  source: "transaction" | "purchase" | "income";
  amount: number;
  aggregateAmount?: number;
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
  ar: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  NIS: "₪",
  ILS: "₪",
  JOD: "JD",
  EUR: "€",
  EGP: "E£",
};

type CategoryStyleRule = {
  color: string;
  icon: IconName;
  key: string;
  label: Record<SupportedLanguage, string>;
  matches: string[];
};

const CATEGORY_STYLE_RULES: CategoryStyleRule[] = [
  {
    key: "shopping",
    color: "#EC4899",
    icon: "bag-handle-outline",
    label: { en: "Shopping", ar: "التسوق" },
    matches: [
      "shopping",
      "shop",
      "clothing",
      "beauty",
      "gifts",
      "electronics",
      "التسوق",
      "الملابس",
      "الجمال",
      "الهدايا",
      "الإلكترونيات",
    ],
  },
  {
    key: "fooddrinks",
    color: "#F59E0B",
    icon: "restaurant-outline",
    label: { en: "Food & Drinks", ar: "الطعام والمشروبات" },
    matches: [
      "food",
      "drinks",
      "dining",
      "restaurant",
      "coffee",
      "snacks",
      "bakery",
      "breakfast",
      "lunch",
      "dinner",
      "fastfood",
      "seafood",
      "الطعام",
      "المطاعم",
      "القهوة",
      "الوجبات",
      "المخبوزات",
      "الإفطار",
      "الغداء",
      "العشاء",
    ],
  },
  {
    key: "groceries",
    color: "#14B8A6",
    icon: "basket-outline",
    label: { en: "Groceries", ar: "البقالة" },
    matches: ["groceries", "grocery", "البقالة"],
  },
  {
    key: "bills",
    color: "#2DD4BF",
    icon: "receipt-outline",
    label: { en: "Bills", ar: "الفواتير" },
    matches: [
      "bills",
      "bill",
      "rent",
      "utilities",
      "utility",
      "internet",
      "mobile",
      "insurance",
      "taxes",
      "fees",
      "housing",
      "electricity",
      "water",
      "gasbill",
      "phonebill",
      "فاتورة",
      "الفواتير",
      "الإيجار",
      "المرافق",
      "الإنترنت",
      "الهاتف",
      "التأمين",
      "الضرائب",
      "الرسوم",
      "الكهرباء",
      "المياه",
    ],
  },
  {
    key: "transport",
    color: "#6366F1",
    icon: "car-sport-outline",
    label: { en: "Transport", ar: "المواصلات" },
    matches: [
      "transport",
      "travel",
      "taxi",
      "bus",
      "metro",
      "parking",
      "gas",
      "fuel",
      "tolls",
      "carpayment",
      "carinsurance",
      "maintenance",
      "ridehailing",
      "flights",
      "hotels",
      "visa",
      "vacation",
      "المواصلات",
      "السفر",
      "تاكسي",
      "الحافلة",
      "المترو",
      "الوقود",
      "الصيانة",
      "الرحلات",
      "الفنادق",
      "التأشيرة",
      "الإجازة",
    ],
  },
  {
    key: "health",
    color: "#EF4444",
    icon: "medkit-outline",
    label: { en: "Health", ar: "الصحة" },
    matches: [
      "health",
      "wellness",
      "fitness",
      "pharmacy",
      "medical",
      "dental",
      "vision",
      "medicine",
      "hospital",
      "therapy",
      "gym",
      "sports",
      "yoga",
      "spa",
      "الصحة",
      "العافية",
      "اللياقة",
      "الصيدلية",
      "المستشفى",
      "العلاج",
      "النادي",
      "الرياضة",
      "اليوغا",
      "السبا",
    ],
  },
  {
    key: "education",
    color: "#8B5CF6",
    icon: "school-outline",
    label: { en: "Education", ar: "التعليم" },
    matches: [
      "education",
      "school",
      "university",
      "tuition",
      "courses",
      "books",
      "stationery",
      "التعليم",
      "المدرسة",
      "الجامعة",
      "الدورات",
      "الكتب",
      "القرطاسية",
    ],
  },
  {
    key: "family",
    color: "#F97316",
    icon: "people-outline",
    label: { en: "Family", ar: "العائلة" },
    matches: [
      "family",
      "kids",
      "childcare",
      "baby",
      "pets",
      "petfood",
      "vet",
      "العائلة",
      "الأطفال",
      "رعاية",
      "مستلزمات",
      "الحيوانات",
      "البيطري",
    ],
  },
  {
    key: "salary",
    color: "#22C55E",
    icon: "cash-outline",
    label: { en: "Salary", ar: "الراتب" },
    matches: [
      "salary",
      "bonus",
      "commissions",
      "refunds",
      "atm",
      "banktransfer",
      "الراتب",
      "المكافأة",
      "العمولات",
      "الاسترجاع",
      "الصراف",
      "تحويل",
    ],
  },
  {
    key: "freelance",
    color: "#10B981",
    icon: "briefcase-outline",
    label: { en: "Freelance", ar: "العمل الحر" },
    matches: [
      "freelance",
      "software",
      "services",
      "legal",
      "office",
      "supplies",
      "العملالحر",
      "البرمجيات",
      "الخدمات",
      "القانونية",
      "المكتب",
      "المستلزمات",
    ],
  },
  {
    key: "investment",
    color: "#0EA5E9",
    icon: "trending-up-outline",
    label: { en: "Investment", ar: "الاستثمار" },
    matches: [
      "investment",
      "investments",
      "savings",
      "mortgage",
      "debtpayment",
      "creditcardpayment",
      "donations",
      "charity",
      "الاستثمار",
      "الاستثمارات",
      "الادخار",
      "التبرعات",
      "الخيرية",
    ],
  },
  {
    key: "loan",
    color: "#F97316",
    icon: "card-outline",
    label: { en: "Loan", ar: "قرض" },
    matches: ["loan", "emergency", "قرض", "الطوارئ"],
  },
  {
    key: "goal",
    color: "#A855F7",
    icon: "flag-outline",
    label: { en: "Goals", ar: "الأهداف" },
    matches: ["goal", "goals", "الأهداف", "هدف"],
  },
];

const FALLBACK_COLORS = ["#64748B", "#8B5CF6", "#06B6D4", "#F97316", "#22C55E", "#EC4899"];

const FALLBACK_ICONS: IconName[] = [
  "ellipse-outline",
  "apps-outline",
  "wallet-outline",
  "grid-outline",
  "pricetag-outline",
  "star-outline",
];

function normalizeCategoryToken(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s&/._-]/g, "");
}

function hashValue(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getCategoryRule(value: unknown) {
  const normalized = normalizeCategoryToken(value);
  if (!normalized) return null;

  return (
    CATEGORY_STYLE_RULES.find((rule) =>
      rule.matches.some((match) => normalized.includes(normalizeCategoryToken(match))),
    ) ?? null
  );
}

function getFallbackStyle(key: string) {
  const seed = hashValue(key || "other");
  return {
    key: key || "other",
    color: FALLBACK_COLORS[seed % FALLBACK_COLORS.length],
    icon: FALLBACK_ICONS[seed % FALLBACK_ICONS.length],
  };
}

export function normalizeCurrency(value: unknown) {
  const normalized = String(value ?? "USD")
    .trim()
    .toUpperCase();

  if (normalized === "ILS") return "NIS";
  if (normalized === "JOS") return "JOD";

  return normalized;
}

export function normalizeCategory(raw: unknown, language: SupportedLanguage) {
  const rawLabel = String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ");
  const rule = getCategoryRule(rawLabel);
  const fallback = getFallbackStyle(normalizeCategoryToken(rawLabel));

  return {
    key: rule?.key ?? fallback.key,
    label: rawLabel
      ? localizeKnownCategoryName(rawLabel, language)
      : rule?.label[language] ?? (language === "ar" ? "أخرى" : "Other"),
    color: rule?.color ?? fallback.color,
    icon: rule?.icon ?? fallback.icon,
  };
}

export function normalizeCategoryKey(value: string) {
  const normalized = normalizeCategoryToken(value);
  return getCategoryRule(normalized)?.key ?? normalized;
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

export function getEntryAggregateAmount(entry: Entry) {
  return Number.isFinite(entry.aggregateAmount) ? Number(entry.aggregateAmount) : entry.amount;
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
    "userUid",
    "userUID",
    "userId",
    "ownerUid",
    "createdByUid",
    "createdByUID",
    "creatorUid",
    "buyerUid",
    "purchaserUid",
    "senderUid",
    "receiverUid",
  ];

  const hasExplicitOwner =
    keys.some((key) => String(raw?.[key] ?? "").trim().length > 0) ||
    Boolean(raw?.members && Object.keys(raw.members).length) ||
    (Array.isArray(raw?.participants) && raw.participants.length > 0);

  return (
    keys.some((key) => String(raw?.[key] ?? "") === uid) ||
    Boolean(raw?.members?.[uid]) ||
    (Array.isArray(raw?.participants) && raw.participants.includes(uid)));
}

export function buildBreakdown(entries: Entry[]) {
  const map = new Map<string, BreakdownItem>();

  entries.forEach((item) => {
    const amount = getEntryAggregateAmount(item);
    map.set(item.categoryKey, {
      key: item.categoryKey,
      label: item.categoryLabel,
      amount: (map.get(item.categoryKey)?.amount ?? 0) + amount,
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
    const amount = getEntryAggregateAmount(item);
    weekday[day].count += 1;
    if (item.type === "send") weekday[day].spend += amount;
    else weekday[day].income += amount;
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
        .reduce((sum, item) => sum + getEntryAggregateAmount(item), 0),
      income: items
        .filter((item) => item.type === "receive")
        .reduce((sum, item) => sum + getEntryAggregateAmount(item), 0),
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
