import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SharedLog, UserProfile } from "../types";
import { HistoryRow } from "./HistoryRow";

interface HistorySectionProps {
  logs: SharedLog[];
  loading: boolean;
  allUsers: Record<string, UserProfile>;
}

export function HistorySection({ logs, loading, allUsers }: HistorySectionProps) {
  const { t } = useI18n();
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView style={[styles.sectionCard, { borderColor, backgroundColor: surfaceColor }]}>
      <View style={[styles.pillHeader, { backgroundColor: surfaceColor }]}>
        <ThemedText style={styles.pillHeaderText}>{t("history") ?? "History"}</ThemedText>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : logs.length === 0 ? (
        <ThemedText style={styles.emptyText}>{t("noHistory") ?? "No activity yet."}</ThemedText>
      ) : (
        <View style={[styles.leftBorder, { borderLeftColor: borderColor }]}>
          {logs.map((item, index) => {
            const actor = allUsers[item.userUid];
            const actorLabel = actor?.name?.trim() || actor?.email?.trim() || item.userUid || "—";
            return (
              <HistoryRow
                key={item.id}
                item={item}
                index={index}
                isLast={index === logs.length - 1}
                actorLabel={actorLabel}
              />
            );
          })}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  pillHeader: {
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillHeaderText: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    letterSpacing: 0.3
  },
  leftBorder: {
    borderLeftWidth: 2.5,
    paddingLeft: 14,
  },
  center: {
    paddingVertical: 32,
    alignItems: "center"
  },
  emptyText: {
    opacity: 0.65
  },
});
