import { DEFAULT_SUGGESTIONS } from "@/src/features/categories/data";

export function normalizeCategoryName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function uniqByNormalized(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    const clean = value.trim().replace(/\s+/g, " ");
    if (!clean) continue;

    const key = normalizeCategoryName(clean);
    if (seen.has(key)) continue;

    seen.add(key);
    out.push(clean);
  }

  return out;
}

export function sameNormalizedSet(a: string[], b: string[]) {
  const aa = uniqByNormalized(a);
  const bb = uniqByNormalized(b);

  if (aa.length !== bb.length) return false;

  const setA = new Set(aa.map((value) => normalizeCategoryName(value)));
  for (const value of bb) {
    if (!setA.has(normalizeCategoryName(value))) return false;
  }

  return true;
}

export function getFirstMatch(categories: string[], query: string) {
  const q = normalizeCategoryName(query);
  if (!q) return null;

  return (
    categories.find((value) => normalizeCategoryName(value).startsWith(q)) ??
    categories.find((value) => normalizeCategoryName(value).includes(q)) ??
    null
  );
}

export function sortCloudCategories(
  values: string[],
  defaultSuggestions: readonly string[] = DEFAULT_SUGGESTIONS,
) {
  const uniqueValues = uniqByNormalized(values);
  const defaultNorm = new Set(
    defaultSuggestions.map((value) => normalizeCategoryName(value)),
  );

  const custom = uniqueValues.filter(
    (value) => !defaultNorm.has(normalizeCategoryName(value)),
  );

  return uniqByNormalized([...defaultSuggestions, ...custom]);
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
