import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { styles } from "./styles";

type CategorySuggestionsSearchBarProps = {
  accent: string;
  accentStrong: string;
  backgroundColor: string;
  borderColor: string;
  isDark: boolean;
  isRtl: boolean;
  onChangeQuery: (value: string) => void;
  placeholder: string;
  placeholderColor: string;
  query: string;
  textColor: string;
  toggleSelectedOnly: () => void;
};

export function CategorySuggestionsSearchBar({
  accent,
  accentStrong,
  backgroundColor,
  borderColor,
  isDark,
  isRtl,
  onChangeQuery,
  placeholder,
  placeholderColor,
  query,
  textColor,
  toggleSelectedOnly,
}: CategorySuggestionsSearchBarProps) {
  return (
    <Animated.View entering={FadeInDown.delay(80).duration(300)} style={styles.searchWrap}>
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor,
            borderColor,
            shadowColor: isDark ? "transparent" : "rgba(0,0,0,0.06)",
          },
        ]}
      >
        <MaterialIcons name="search" size={22} color={accent} />
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          style={[styles.searchInput, { color: textColor, textAlign: isRtl ? "right" : "left" }]}
          returnKeyType="search"
        />
        <Pressable
          onPress={toggleSelectedOnly}
          style={({ pressed }) => [
            styles.filterBtn,
            { backgroundColor: accentStrong },
            pressed ? styles.pressed : null,
          ]}
        >
          <MaterialIcons name="tune" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}