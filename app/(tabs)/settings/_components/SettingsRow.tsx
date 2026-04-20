import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Switch, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { styles } from "../_styles";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

type SettingsRowProps = {
  icon: IconName;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  isRtl: boolean;
  labelColor: string;
  valueColor: string;
  cardBg: string;
  chevronColor: string;
  type?: "link" | "toggle";
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  switchTrackOn: string;
  switchTrackOff: string;
  switchThumbOn: string;
  switchThumbOff: string;
};

export function SettingsRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  isRtl,
  labelColor,
  valueColor,
  cardBg,
  chevronColor,
  type = "link",
  toggleValue,
  onToggle,
  onPress,
  switchTrackOn,
  switchTrackOff,
  switchThumbOn,
  switchThumbOff,
}: SettingsRowProps) {
  const isToggle = type === "toggle";

  return (
    <View style={[styles.rowCard, { backgroundColor: cardBg }]}>
      <Pressable
        onPress={isToggle ? undefined : onPress}
        style={[styles.row, isRtl ? styles.rowRtl : null]}
      >
        <View style={[styles.rowIconWrap, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={22} color={iconColor} />
        </View>

        <View style={[styles.rowContent, isRtl ? styles.rowContentRtl : null]}>
          <ThemedText
            style={[
              styles.rowLabel,
              { color: labelColor },
              isRtl ? styles.textRtl : null,
            ]}
          >
            {label}
          </ThemedText>
          {value ? (
            <ThemedText
              style={[
                styles.rowValue,
                { color: valueColor },
                isRtl ? styles.textRtl : null,
              ]}
            >
              {value}
            </ThemedText>
          ) : null}
        </View>

        {isToggle ? (
          <Switch
            value={Boolean(toggleValue)}
            onValueChange={onToggle}
            trackColor={{ false: switchTrackOff, true: switchTrackOn }}
            thumbColor={toggleValue ? switchThumbOn : switchThumbOff}
          />
        ) : (
          <MaterialIcons
            name={isRtl ? "chevron-left" : "chevron-right"}
            size={24}
            color={chevronColor}
            style={styles.rowChevron}
          />
        )}
      </Pressable>
    </View>
  );
}
