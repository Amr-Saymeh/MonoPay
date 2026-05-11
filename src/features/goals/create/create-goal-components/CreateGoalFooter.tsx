import { GradientButton } from "@/components/ui/gradient-button";
import { View } from "react-native";

import { styles } from "../stylesheet";

type CreateGoalFooterProps = {
  label: string;
  isEditing: boolean;
  loading: boolean;
  onPress: () => void;
};

export function CreateGoalFooter({
  label,
  isEditing,
  loading,
  onPress,
}: CreateGoalFooterProps) {
  return (
    <View style={styles.footer}>
      <GradientButton
        label={label}
        iconName={isEditing ? "edit" : "add-circle-outline"}
        onPress={onPress}
        loading={loading}
      />
    </View>
  );
}

