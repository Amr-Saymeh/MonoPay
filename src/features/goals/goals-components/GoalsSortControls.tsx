import { ThemedText } from "@/components/themed-text";
import { hapticSelection } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, View } from "react-native";

import {
  getGoalsAccentColor,
  GOALS_WHITE_ICON,
  SORT_OPTIONS,
  type SortDir,
  type SortKey,
} from "../constants";
import { styles } from "../stylesheet";

type GoalsSortControlsProps = {
  isDark: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  title: string;
  activeLabel: string;
  ascLabel: string;
  descLabel: string;
  getLabel: (key: SortKey) => string;
  onSortSelect: (key: SortKey) => void;
  onDirectionChange: (dir: SortDir) => void;
};

export function GoalsSortControls({
  isDark,
  sortKey,
  sortDir,
  backgroundColor,
  borderColor,
  textColor,
  title,
  activeLabel,
  ascLabel,
  descLabel,
  getLabel,
  onSortSelect,
  onDirectionChange,
}: GoalsSortControlsProps) {
  return (
    <View style={[styles.sortSection, { backgroundColor, borderColor }]}>
      <View style={styles.sortHeaderRow}>
        <View style={styles.sortHeaderLeft}>
          <MaterialIcons name="tune" size={16} color={getGoalsAccentColor(isDark)} />
          <ThemedText style={styles.sortHeaderTitle}>{title}</ThemedText>
        </View>
        <ThemedText style={[styles.sortHeaderMeta, { color: textColor }]}>
          {activeLabel}
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortChipsRow}
      >
        {SORT_OPTIONS.map((opt) => {
          const isActive = opt.key === sortKey;
          return (
            <Pressable
              key={opt.key}
              style={[styles.sortChip, isActive && styles.sortChipActive]}
              onPress={() => onSortSelect(opt.key)}
            >
              <MaterialIcons
                name={opt.icon}
                size={14}
                color={isActive ? GOALS_WHITE_ICON : getGoalsAccentColor(isDark)}
              />
              <ThemedText
                style={[
                  styles.sortChipText,
                  isActive && styles.sortChipTextActive,
                ]}
              >
                {getLabel(opt.key)}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sortDirWrap}>
        {(["asc", "desc"] as SortDir[]).map((dir) => {
          const isActive = sortDir === dir;
          return (
            <Pressable
              key={dir}
              style={[
                styles.sortDirOption,
                isActive && styles.sortDirOptionActive,
              ]}
              onPress={() => {
                hapticSelection();
                onDirectionChange(dir);
              }}
            >
              <MaterialIcons
                name={dir === "asc" ? "north" : "south"}
                size={14}
                color={isActive ? GOALS_WHITE_ICON : getGoalsAccentColor(isDark)}
              />
              <ThemedText
                style={[
                  styles.sortDirOptionText,
                  isActive && styles.sortDirOptionTextActive,
                ]}
              >
                {dir === "asc" ? ascLabel : descLabel}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

