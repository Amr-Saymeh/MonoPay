import React, { memo } from "react";

import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { styles } from "../styles";
import { Entry, SortMode, SupportedLanguage, money } from "../utils/insights";
import { Chip, Palette } from "./InsightsShared";

type HighlightsSectionProps = {
  colorsText: string;
  green: string;
  highlights: Entry[];
  isRtl: boolean;
  language: SupportedLanguage;
  muted: string;
  orange: string;
  palette: Palette;
  setSortMode: (value: SortMode) => void;
  sortMode: SortMode;
};

export const HighlightsSection = memo(function HighlightsSection({
  colorsText,
  green,
  highlights,
  isRtl,
  language,
  muted,
  orange,
  palette,
  setSortMode,
  sortMode,
}: HighlightsSectionProps) {
  return (
    <View>
      <View style={[styles.headerRow, isRtl ? styles.headerRowRtl : null]}>
        <View>
          <Text style={[styles.sectionTitle, isRtl ? styles.textRtl : null, { color: colorsText }]}>
            {language === "ar" ? "أهم الحركات" : "Highlighted movements"}
          </Text>
          <Text style={[styles.sectionSub, isRtl ? styles.textRtl : null, { color: muted }]}>
            {language === "ar" ? "الأحدث أو الأكبر قيمة" : "Latest or highest-value activity"}
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, isRtl ? styles.rowRtl : null]}>
        <Chip
          active={sortMode === "recent"}
          color={palette.purple}
          icon="time-outline"
          label={language === "ar" ? "الأحدث" : "Recent"}
          onPress={() => setSortMode("recent")}
          textColor={colorsText}
        />
        <Chip
          active={sortMode === "largest"}
          color={palette.purple}
          icon="trophy-outline"
          label={language === "ar" ? "الأكبر" : "Largest"}
          onPress={() => setSortMode("largest")}
          textColor={colorsText}
        />
      </ScrollView>

      {highlights.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Ionicons name="wallet-outline" size={24} color={muted} />
          <Text style={[styles.emptyTitle, { color: colorsText }]}>
            {language === "ar" ? "لا توجد بيانات ضمن هذه الفلاتر" : "No data under the current filters"}
          </Text>
          <Text style={[styles.emptySub, { color: muted }]}>
            {language === "ar" ? "جرّب فترة أو عملة أو فئة مختلفة." : "Try a different period, currency, or category."}
          </Text>
        </View>
      ) : (
        highlights.map((item) => (
          <Animated.View
            key={`${item.source}-${item.id}`}
            entering={FadeInRight.duration(280)}
            style={[styles.move, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={[styles.moveMain, isRtl ? styles.moveMainRtl : null]}>
              <View style={[styles.metricIcon, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.moveText}>
                <Text style={[styles.moveTitle, isRtl ? styles.textRtl : null, { color: colorsText }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.moveMeta, isRtl ? styles.textRtl : null, { color: muted }]} numberOfLines={1}>
                  {item.categoryLabel} · {new Date(item.timestamp).toLocaleDateString()}
                </Text>
                {item.note ? (
                  <Text style={[styles.moveMeta, isRtl ? styles.textRtl : null, { color: muted }]} numberOfLines={1}>
                    {item.note}
                  </Text>
                ) : null}
              </View>
            </View>
            <Text style={[styles.moveAmount, { color: item.type === "receive" ? green : orange }]}>
              {item.type === "receive" ? "+" : "-"}
              {money(item.amount, item.currency)}
            </Text>
          </Animated.View>
        ))
      )}
    </View>
  );
});