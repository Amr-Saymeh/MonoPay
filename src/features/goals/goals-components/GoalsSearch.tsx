import { hapticSelection, hapticTap } from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

import {
  getGoalsAccentColor,
  getGoalsSearchClearIconColor,
} from "../constants";
import { styles } from "../stylesheet";

type GoalsSearchProps = {
  visible: boolean;
  value: string;
  placeholder: string;
  isDark: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  placeholderColor: string;
  onChange: (value: string) => void;
};

export function GoalsSearch({
  visible,
  value,
  placeholder,
  isDark,
  backgroundColor,
  borderColor,
  textColor,
  placeholderColor,
  onChange,
}: GoalsSearchProps) {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.searchWrap,
        { backgroundColor, borderColor },
      ]}
    >
      <MaterialIcons name="search" size={18} color={getGoalsAccentColor(isDark)} />
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[styles.searchInput, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        onFocus={hapticSelection}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => {
            hapticTap();
            onChange("");
          }}
          style={styles.searchClearBtn}
        >
          <MaterialIcons name="close" size={16} color={getGoalsSearchClearIconColor(isDark)} />
        </Pressable>
      ) : null}
    </View>
  );
}

