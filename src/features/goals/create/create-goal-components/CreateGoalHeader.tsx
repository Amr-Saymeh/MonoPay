import { ThemedText } from "@/components/themed-text";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { getGoalsAccentColor } from "../../constants";
import { styles } from "../stylesheet";

type CreateGoalHeaderProps = {
  title: string;
  isDark: boolean;
  backgroundColor: string;
  borderColor: string;
  onBack: () => void;
};

export function CreateGoalHeader({
  title,
  isDark,
  backgroundColor,
  borderColor,
  onBack,
}: CreateGoalHeaderProps) {
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
            onPress={onBack}
            style={[
              styles.backButton,
              isDark ? styles.backButtonDark : styles.backButtonLight,
            ]}
          >
            <MaterialIcons
              name="arrow-back"
              size={18}
              color={getGoalsAccentColor(isDark)}
            />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{title}</ThemedText>
        </View>
      </View>
    </View>
  );
}

