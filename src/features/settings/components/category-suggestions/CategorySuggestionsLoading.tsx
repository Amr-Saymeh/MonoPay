import { ActivityIndicator, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "./styles";

type CategorySuggestionsLoadingProps = {
  accent: string;
  borderColor: string;
  mutedColor: string;
  surfaceColor: string;
  textColor: string;
  title: string;
};

export function CategorySuggestionsLoading({
  accent,
  borderColor,
  mutedColor,
  surfaceColor,
  textColor,
  title,
}: CategorySuggestionsLoadingProps) {
  return (
    <View style={styles.loadingWrap}>
      <View style={[styles.loadingCard, { backgroundColor: surfaceColor, borderColor }]}> 
        <ActivityIndicator size="large" color={accent} />
        <ThemedText style={[styles.loadingTitle, { color: textColor }]}>{title}</ThemedText>
        <ThemedText style={[styles.loadingSubtitle, { color: mutedColor }]}>Preparing your categories…</ThemedText>
      </View>
    </View>
  );
}