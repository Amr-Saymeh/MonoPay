import { ThemedText } from "@/components/themed-text";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { getGoalsAccentColor } from "../constants";
import { styles } from "../stylesheet";

type GoalsHeaderProps = {
  title: string;
  isDark: boolean;
  backgroundColor: string;
  borderColor: string;
  onBack: () => void;
};

export function GoalsHeader({
  title,
  isDark,
  backgroundColor,
  borderColor,
  onBack,
}: GoalsHeaderProps) {
  return (
    <View
      style={[
        styles.headerSection,
        { backgroundColor, borderBottomColor: borderColor },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={[
              styles.backButton,
              isDark ? styles.backButtonDark : styles.backButtonLight,
            ]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to home"
          >
            <MaterialIcons
              name="arrow-back"
              size={18}
              color={getGoalsAccentColor(isDark)}
            />
          </Pressable>
          <ThemedText style={styles.pageTitle}>{title}</ThemedText>
        </View>
      </View>
    </View>
  );
}

