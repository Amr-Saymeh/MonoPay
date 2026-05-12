import type { useI18n } from "@/hooks/use-i18n";

type I18nT = ReturnType<typeof useI18n>["t"];

export function buildGoalsLabels(t: I18nT) {
  return {
    title: t("goals.title"),
    totalSaved: t("goals.totalSaved"),
    add: t("common.add"),
    progress: t("goals.overallProgress"),
    remaining: t("goals.remainingToReachAllGoals"),
    searchPlaceholder: t("goals.searchPlaceholder"),
    sortTitle: t("goals.sortGoals"),
    sortAsc: t("goals.sort.ascending"),
    sortDesc: t("goals.sort.descending"),
    emptyTitle: t("goals.emptyTitle"),
    emptySubtext: t("goals.emptySubtext"),
    emptySearchTitle: t("goals.emptySearchTitle"),
    emptySearchSubtext: t("goals.emptySearchSubtext"),
    deleteTitle: t("goals.deleteTitle"),
    deleteConfirm: t("goals.deleteConfirm"),
    cancel: t("common.cancel"),
    delete: t("common.delete"),
    confirm: t("common.confirm"),
  };
}
