import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { INCOME_WHITE_ICON } from "../constants";
import { styles } from "../stylesheet";
import { useIncomeSavingsScreen } from "./IncomeSavingsScreenProvider";

export function IncomeSavingsCreateButton() {
  const { actions, labels, view } = useIncomeSavingsScreen();

  return (
    <Pressable
      style={[styles.fabAddButton, { bottom: view.floatingButtonBottom }]}
      onPress={actions.onCreateSource}
      accessibilityRole="button"
      accessibilityLabel={labels.add}
    >
      <MaterialIcons name="add" size={28} color={INCOME_WHITE_ICON} />
    </Pressable>
  );
}
