import {
  DEFAULT_PRESELECTED,
  localizeCategoryList,
} from "@/src/features/settings/components/category-suggestions/data";

type Language = "en" | "ar";

export function normalizeCategoryName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getUniqueCategories(values: string[]) {
  const seen = new Set<string>();
  const nextValues: string[] = [];

  for (const value of values) {
    const clean = value.trim().replace(/\s+/g, " ");
    if (!clean) continue;

    const key = normalizeCategoryName(clean);
    if (seen.has(key)) continue;

    seen.add(key);
    nextValues.push(clean);
  }

  return nextValues;
}

function areSameCategories(current: string[], next: string[]) {
  const currentValues = getUniqueCategories(current);
  const nextValues = getUniqueCategories(next);

  if (currentValues.length !== nextValues.length) {
    return false;
  }

  return currentValues.every((value, index) =>
    normalizeCategoryName(value) === normalizeCategoryName(nextValues[index]),
  );
}

export function getInitialSelectedCategories({
  isSettingsMode,
  language,
  profileCategories,
  signupCategories,
}: {
  isSettingsMode: boolean;
  language: Language;
  profileCategories: string[];
  signupCategories: string[];
}) {
  const seeded = isSettingsMode
    ? profileCategories
    : signupCategories.length
      ? signupCategories
      : DEFAULT_PRESELECTED;

  return localizeCategoryList(seeded, language);
}

export function buildCategorySuggestionState({
  customCategories,
  language,
  localizedDefaults,
  profileCategories,
  query,
  selected,
  showSelectedOnly,
  signupCategories,
}: {
  customCategories: string[];
  language: Language;
  localizedDefaults: string[];
  profileCategories: string[];
  query: string;
  selected: string[];
  showSelectedOnly: boolean;
  signupCategories: string[];
}) {
  const allCategories = getUniqueCategories([
    ...localizedDefaults,
    ...localizeCategoryList(profileCategories, language),
    ...localizeCategoryList(signupCategories, language),
    ...customCategories,
    ...selected,
  ]);
  const sortedCategories = getUniqueCategories([...localizedDefaults, ...allCategories]);
  const normalizedQuery = normalizeCategoryName(query);

  let filteredCategories = showSelectedOnly
    ? sortedCategories.filter((category) =>
        selected.some((item) => normalizeCategoryName(item) === normalizeCategoryName(category)),
      )
    : sortedCategories;

  if (normalizedQuery) {
    filteredCategories = filteredCategories.filter((category) =>
      normalizeCategoryName(category).includes(normalizedQuery),
    );
  }

  return {
    allCategories,
    filteredCategories,
    selectedSet: new Set(selected.map((item) => normalizeCategoryName(item))),
    sortedCategories,
  };
}

export function syncCategoryValues(current: string[], next: string[]) {
  return areSameCategories(current, next) ? current : next;
}

export function syncLocalizedCategoryValues(values: string[], language: Language) {
  return syncCategoryValues(values, localizeCategoryList(values, language));
}

export function toggleSelectedCategory(selected: string[], name: string) {
  const normalized = normalizeCategoryName(name);

  return selected.some((item) => normalizeCategoryName(item) === normalized)
    ? selected.filter((item) => normalizeCategoryName(item) !== normalized)
    : getUniqueCategories([...selected, name]);
}

export function getPreparedCustomCategory({
  allCategories,
  customCategories,
  customName,
  selected,
}: {
  allCategories: string[];
  customCategories: string[];
  customName: string;
  selected: string[];
}) {
  const clean = customName.trim().replace(/\s+/g, " ");
  if (!clean) {
    return null;
  }

  const normalized = normalizeCategoryName(clean);
  const existing = allCategories.find(
    (category) => normalizeCategoryName(category) === normalized,
  );

  if (existing) {
    return {
      customCategories,
      focusCategory: existing,
      selected: selected.some((item) => normalizeCategoryName(item) === normalized)
        ? selected
        : getUniqueCategories([...selected, existing]),
    };
  }

  return {
    customCategories: getUniqueCategories([...customCategories, clean]),
    focusCategory: clean,
    selected: getUniqueCategories([...selected, clean]),
  };
}

export function getCategoryScrollPosition(targetIndex: number, cloudHeight: number) {
  const rowIndex = Math.floor(targetIndex / 4);
  return Math.max(0, rowIndex * 56 - cloudHeight / 2 + 28);
}
