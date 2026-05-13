import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";

import { styles } from "./styles";

type CategorySuggestionsHeaderProps = {
  accent: string;
  borderColor: string;
  isRtl: boolean;
  onBack: () => void;
  onOpenAdd: () => void;
  surfaceColor: string;
  textColor: string;
  title: string;
  topPadding: number;
};

export function CategorySuggestionsHeader({
  accent,
  borderColor,
  isRtl,
  onBack,
  onOpenAdd,
  surfaceColor,
  textColor,
  title,
  topPadding,
}: CategorySuggestionsHeaderProps) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.header, { paddingTop: topPadding }]}>
      <View style={[styles.headerRow, isRtl ? styles.headerRowRtl : null]}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.iconBtn,
            { borderWidth: 1, borderColor, backgroundColor: surfaceColor },
            pressed ? styles.pressed : null,
          ]}
        >
          <MaterialIcons
            name={isRtl ? "arrow-forward" : "arrow-back"}
            size={24}
            color={textColor}
          />
        </Pressable>

        <ThemedText
          numberOfLines={1}
          style={[styles.headerTitle, { color: textColor, flex: 1, textAlign: "center" }]}
        >
          {title}
        </ThemedText>

        <Pressable
          onPress={onOpenAdd}
          style={({ pressed }) => [
            styles.avatarBtn,
            { borderWidth: 1, borderColor, backgroundColor: surfaceColor },
            pressed ? styles.pressed : null,
          ]}
        >
          <MaterialIcons name="add" size={24} color={accent} />
        </Pressable>
      </View>
    </Animated.View>
  );
}