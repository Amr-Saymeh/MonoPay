
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={loadingColor} />
        <Text style={[styles.loadingText, { color: mutedColor }]}>Preparing your insights…</Text>
      </View>
    </View>
  );
}