import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { GOALS_WHITE_ICON } from "../constants";
import { styles } from "../stylesheet";
import { useGoalsScreen } from "./GoalsScreenProvider";

export function GoalsCreateButton() {
  const { actions, labels, view } = useGoalsScreen();

  return (
    <Pressable
      style={[styles.fabAddButton, { bottom: view.floatingButtonBottom }]}
      onPress={actions.onCreateGoal}
      accessibilityRole="button"
      accessibilityLabel={labels.add}
    >
      <MaterialIcons name="add" size={28} color={GOALS_WHITE_ICON} />
    </Pressable>
  );
}
