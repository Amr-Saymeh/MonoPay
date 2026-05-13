import type { useI18n } from "@/hooks/use-i18n";

type I18nT = ReturnType<typeof useI18n>["t"];

export function buildIncomeSavingsLabels(t: I18nT) {
  return {
    title: t("incomeSavings.title"),
    add: t("common.add"),
    source: t("incomeSavings.source"),
    all: t("common.all"),
    emptyTitle: t("incomeSavings.emptyTitle"),
    emptySubtext: t("incomeSavings.emptySubtext"),
    emptySearchTitle: t("incomeSavings.emptySearchTitle"),
    emptySearchSubtext: t("incomeSavings.emptySearchSubtext"),
    deleteTitle: t("incomeSavings.deleteTitle"),
    deletePrompt: t("incomeSavings.deletePrompt"),
    deletePromptGeneric: t("incomeSavings.deletePromptGeneric"),
    cancel: t("common.cancel"),
    delete: t("common.delete"),
    confirm: t("common.confirm"),
  };
}
