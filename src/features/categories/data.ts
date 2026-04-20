export type SupportedCategoryLanguage = "en" | "ar";

type LocalizedCategory = {
  en: string;
  ar: string;
};

const LOCALIZED_SUGGESTIONS: ReadonlyArray<LocalizedCategory> = [
  { en: "Shopping", ar: "التسوق" },
  { en: "Dining", ar: "المطاعم" },
  { en: "Groceries", ar: "البقالة" },
  { en: "Transport", ar: "المواصلات" },
  { en: "Rent", ar: "الإيجار" },
  { en: "Utilities", ar: "المرافق" },
  { en: "Coffee", ar: "القهوة" },
  { en: "Fitness", ar: "اللياقة" },
  { en: "Lifestyle", ar: "نمط الحياة" },
  { en: "Travel", ar: "السفر" },
  { en: "Health", ar: "الصحة" },
  { en: "Wellness", ar: "العافية" },
  { en: "Entertainment", ar: "الترفيه" },
  { en: "Pets", ar: "الحيوانات الأليفة" },
  { en: "Gifts", ar: "الهدايا" },
  { en: "Events", ar: "المناسبات" },
  { en: "Subscriptions", ar: "الاشتراكات" },
  { en: "Education", ar: "التعليم" },
  { en: "Insurance", ar: "التأمين" },
  { en: "Investments", ar: "الاستثمارات" },
  { en: "Housing", ar: "السكن" },
  { en: "Parking", ar: "مواقف السيارات" },
  { en: "Hardware", ar: "العتاد" },
  { en: "Hobbies", ar: "الهوايات" },
  { en: "Food & Drinks", ar: "الطعام والمشروبات" },
  { en: "Internet", ar: "الإنترنت" },
  { en: "Mobile", ar: "الهاتف" },
  { en: "Gas", ar: "الوقود" },
  { en: "Tolls", ar: "رسوم الطرق" },
  { en: "Car Payment", ar: "قسط السيارة" },
  { en: "Car Insurance", ar: "تأمين السيارة" },
  { en: "Maintenance", ar: "الصيانة" },
  { en: "Clothing", ar: "الملابس" },
  { en: "Beauty", ar: "الجمال" },
  { en: "Personal Care", ar: "العناية الشخصية" },
  { en: "Pharmacy", ar: "الصيدلية" },
  { en: "Medical", ar: "الطبي" },
  { en: "Dental", ar: "الأسنان" },
  { en: "Vision", ar: "البصر" },
  { en: "Cinema", ar: "السينما" },
  { en: "Concerts", ar: "الحفلات" },
  { en: "Games", ar: "الألعاب" },
  { en: "Books", ar: "الكتب" },
  { en: "Music", ar: "الموسيقى" },
  { en: "Art", ar: "الفن" },
  { en: "Photography", ar: "التصوير" },
  { en: "Courses", ar: "الدورات" },
  { en: "Streaming", ar: "البث" },
  { en: "Software", ar: "البرمجيات" },
  { en: "Electronics", ar: "الإلكترونيات" },
  { en: "Home", ar: "المنزل" },
  { en: "Decor", ar: "الديكور" },
  { en: "Gardening", ar: "الحديقة" },
  { en: "Home Improvement", ar: "تحسين المنزل" },
  { en: "Repairs", ar: "الإصلاحات" },
  { en: "Services", ar: "الخدمات" },
  { en: "Legal", ar: "القانونية" },
  { en: "Life Insurance", ar: "تأمين الحياة" },
  { en: "Taxes", ar: "الضرائب" },
  { en: "Fees", ar: "الرسوم" },
  { en: "Debt Payment", ar: "سداد الديون" },
  { en: "Credit Card Payment", ar: "سداد بطاقة الائتمان" },
  { en: "Savings", ar: "الادخار" },
  { en: "Donations", ar: "التبرعات" },
  { en: "Charity", ar: "الأعمال الخيرية" },
  { en: "Family", ar: "العائلة" },
  { en: "Childcare", ar: "رعاية الأطفال" },
  { en: "Kids", ar: "الأطفال" },
  { en: "Snacks", ar: "الوجبات الخفيفة" },
  { en: "Bakery", ar: "المخبوزات" },
  { en: "Liquor", ar: "المشروبات" },
  { en: "Office", ar: "المكتب" },
  { en: "Supplies", ar: "المستلزمات" },
  { en: "Salary", ar: "الراتب" },
  { en: "Freelance", ar: "العمل الحر" },
  { en: "Bonus", ar: "المكافأة" },
  { en: "Commissions", ar: "العمولات" },
  { en: "Refunds", ar: "الاسترجاع" },
  { en: "ATM", ar: "الصراف" },
  { en: "Bank Transfer", ar: "تحويل بنكي" },
  { en: "Loan", ar: "قرض" },
  { en: "Mortgage", ar: "الرهن العقاري" },
  { en: "Emergency", ar: "الطوارئ" },
  { en: "Medicine", ar: "الأدوية" },
  { en: "Hospital", ar: "المستشفى" },
  { en: "Therapy", ar: "العلاج" },
  { en: "Gym", ar: "النادي" },
  { en: "Sports", ar: "الرياضة" },
  { en: "Cycling", ar: "ركوب الدراجات" },
  { en: "Running", ar: "الجري" },
  { en: "Yoga", ar: "اليوغا" },
  { en: "Spa", ar: "السبا" },
  { en: "Skincare", ar: "العناية بالبشرة" },
  { en: "Haircare", ar: "العناية بالشعر" },
  { en: "Baby", ar: "مستلزمات الأطفال" },
  { en: "School", ar: "المدرسة" },
  { en: "University", ar: "الجامعة" },
  { en: "Tuition", ar: "الرسوم الدراسية" },
  { en: "Stationery", ar: "القرطاسية" },
  { en: "Fuel", ar: "الوقود" },
  { en: "Taxi", ar: "تاكسي" },
  { en: "Ride Hailing", ar: "التوصيل" },
  { en: "Bus", ar: "الحافلة" },
  { en: "Metro", ar: "المترو" },
  { en: "Flights", ar: "الرحلات الجوية" },
  { en: "Hotels", ar: "الفنادق" },
  { en: "Visa", ar: "التأشيرة" },
  { en: "Vacation", ar: "الإجازة" },
  { en: "Camping", ar: "التخييم" },
  { en: "Outdoor", ar: "الأنشطة الخارجية" },
  { en: "Restaurant", ar: "المطعم" },
  { en: "Fast Food", ar: "الوجبات السريعة" },
  { en: "Seafood", ar: "المأكولات البحرية" },
  { en: "Breakfast", ar: "الإفطار" },
  { en: "Lunch", ar: "الغداء" },
  { en: "Dinner", ar: "العشاء" },
  { en: "Laundry", ar: "الغسيل" },
  { en: "Cleaning", ar: "التنظيف" },
  { en: "Security", ar: "الأمن" },
  { en: "Water", ar: "المياه" },
  { en: "Electricity", ar: "الكهرباء" },
  { en: "Gas Bill", ar: "فاتورة الغاز" },
  { en: "Phone Bill", ar: "فاتورة الهاتف" },
  { en: "Internet Bill", ar: "فاتورة الإنترنت" },
  { en: "Appliances", ar: "الأجهزة المنزلية" },
  { en: "Furniture", ar: "الأثاث" },
  { en: "Kitchen", ar: "المطبخ" },
  { en: "Tools", ar: "الأدوات" },
  { en: "Pet Food", ar: "طعام الحيوانات" },
  { en: "Vet", ar: "البيطري" },
  { en: "Pet Grooming", ar: "عناية الحيوانات" },
  { en: "Other", ar: "أخرى" },
];

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export const DEFAULT_SUGGESTIONS = LOCALIZED_SUGGESTIONS.map((item) => item.en) as readonly string[];

export const DEFAULT_PRESELECTED = [
  "Shopping",
  "Groceries",
  "Travel",
  "Utilities",
  "Health",
  "Entertainment",
  "Subscriptions",
  "Transport",
] as const;

const EN_TO_AR = new Map(
  LOCALIZED_SUGGESTIONS.map((item) => [normalizeName(item.en), item.ar]),
);

const AR_TO_EN = new Map(
  LOCALIZED_SUGGESTIONS.map((item) => [normalizeName(item.ar), item.en]),
);

export function getLocalizedSuggestions(language: SupportedCategoryLanguage) {
  return LOCALIZED_SUGGESTIONS.map((item) =>
    language === "ar" ? item.ar : item.en,
  );
}

export function localizeKnownCategoryName(
  value: string,
  language: SupportedCategoryLanguage,
) {
  const key = normalizeName(value);
  if (!key) return value;

  if (language === "ar") {
    return EN_TO_AR.get(key) ?? value;
  }

  return AR_TO_EN.get(key) ?? value;
}

export function localizeCategoryList(
  values: readonly string[],
  language: SupportedCategoryLanguage,
) {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    const localized = localizeKnownCategoryName(value, language);
    const normalized = normalizeName(localized);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(localized.trim().replace(/\s+/g, " "));
  }

  return out;
}
