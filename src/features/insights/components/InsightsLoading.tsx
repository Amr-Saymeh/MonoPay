import React from "react";

import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "../styles";

type InsightsLoadingProps = {
  backgroundColor: string;
  loadingColor: string;
  mutedColor: string;
};

export function InsightsLoading({
  backgroundColor,
  loadingColor,
  mutedColor,
}: InsightsLoadingProps) {
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor }]}>
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={loadingColor} />
        <Text style={[styles.loadingText, { color: mutedColor }]}>Preparing your insights…</Text>
      </View>
    </SafeAreaView>
  );
}