import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useThemeMode } from "@/src/providers/ThemeModeProvider";
import { CATEGORIES, Category } from "../types/index";

interface Props {
  label: string;
  selected: Category | null;
  onSelect: (category: Category) => void;
  isRtl?: boolean;
  language?: string;
}

export function CategoryPicker({
  label,
  selected,
  onSelect,
  isRtl = false,
  language = "en",
}: Props) {
  // visible opens the category bottom sheet when the user wants to pick a category.
  const [visible, setVisible] = useState(false);
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === "dark";

  // return the localized label that matches the current screen language.
  const getCategoryLabel = (cat: Category) =>
    language === "ar" ? cat.labelAr : cat.label;

  // close the modal immediately after the user selects a category.
  const handleSelect = (cat: Category) => {
    onSelect(cat);
    setVisible(false);
  };

  return (
    <>
      {/* Trigger */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[styles.trigger, isDark && styles.triggerDark]}
        activeOpacity={0.7}
      >
        {selected ? (
          <View style={styles.triggerSelected}>
            <View style={[styles.selectedEmoji, isDark && styles.selectedEmojiDark]}>
              <Text style={{ fontSize: 20 }}>{selected.emoji}</Text>
            </View>
            <Text style={[styles.selectedText, isDark && styles.selectedTextDark]}>
              {getCategoryLabel(selected)}
            </Text>
          </View>
        ) : (
          <View style={styles.triggerEmpty}>
            <Ionicons name="grid-outline" size={20} color={isDark ? "rgba(255,255,255,0.4)" : "#9CA3AF"} />
            <Text style={[styles.placeholderText, isDark && styles.placeholderTextDark]}>{label}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={isDark ? "rgba(255,255,255,0.4)" : "#9CA3AF"} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setVisible(false)}>
          <Pressable
            style={[styles.modalContent, isDark && styles.modalContentDark]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handleWrap}>
              <View style={[styles.handleBar, isDark && styles.handleBarDark]} />
            </View>

            <View style={styles.modalInner}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                {language === "ar" ? "اختر الفئة" : "Select Category"}
              </Text>

              <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item.key}
                numColumns={2}
                style={{ maxHeight: 400 }}
                columnWrapperStyle={styles.gridRow}
                renderItem={({ item }) => {
                  const isSelected = selected?.key === item.key;
                  return (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      style={[
                        styles.categoryItem,
                        isDark && styles.categoryItemDark,
                        isSelected && styles.categoryItemSelected,
                        isSelected && isDark && styles.categoryItemSelectedDark,
                      ]}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.categoryEmoji,
                          isDark && styles.categoryEmojiDark,
                          isSelected && styles.categoryEmojiSelected,
                        ]}
                      >
                        <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                      </View>
                      <Text
                        style={[
                          styles.categoryLabel,
                          isDark && styles.categoryLabelDark,
                          isSelected && styles.categoryLabelSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {getCategoryLabel(item)}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkMark}>
                          <Ionicons name="checkmark" size={12} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
              <View style={{ height: 24 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  trigger: {
    backgroundColor: "white",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 64,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.06)",
  },
  triggerDark: {
    backgroundColor: "#1C1F2A",
    borderColor: "rgba(255,255,255,0.07)",
  },
  triggerSelected: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  selectedEmoji: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "#F5F3FF", alignItems: "center", justifyContent: "center",
  },
  selectedEmojiDark: { backgroundColor: "rgba(124,58,237,0.2)" },
  selectedText: { color: "#1F2937", fontWeight: "600", fontSize: 15 },
  selectedTextDark: { color: "#E0E0E0" },
  triggerEmpty: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  placeholderText: { color: "#9CA3AF", fontSize: 15 },
  placeholderTextDark: { color: "rgba(255,255,255,0.3)" },
  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
  },
  modalContentDark: { backgroundColor: "#1C1F2A" },
  handleWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  handleBar: { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2 },
  handleBarDark: { backgroundColor: "rgba(255,255,255,0.15)" },
  modalInner: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 16 },
  modalTitleDark: { color: "#E0E0E0" },
  gridRow: { gap: 10, marginBottom: 10 },
  categoryItem: {
    flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 18, backgroundColor: "#F9FAFB", position: "relative",
  },
  categoryItemDark: { backgroundColor: "#252D3D" },
  categoryItemSelected: { backgroundColor: "#F5F3FF", borderWidth: 1.5, borderColor: "#C4B5FD" },
  categoryItemSelectedDark: { backgroundColor: "rgba(124,58,237,0.2)", borderColor: "#7C3AED" },
  categoryEmoji: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: "white",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  categoryEmojiDark: { backgroundColor: "rgba(255,255,255,0.08)" },
  categoryEmojiSelected: { backgroundColor: "#EDE9FE" },
  categoryLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", textAlign: "center" },
  categoryLabelDark: { color: "rgba(255,255,255,0.5)" },
  categoryLabelSelected: { color: "#7C3AED" },
  checkMark: {
    position: "absolute", top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#7C3AED", alignItems: "center", justifyContent: "center",
  },
});
