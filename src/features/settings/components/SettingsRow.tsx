import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Switch, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "../styles";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

type SettingsRowProps = {
  cardBg: string;
  chevronColor: string;
  icon: IconName;
  iconBg: string;
  iconColor: string;
  isRtl: boolean;
  label: string;
  labelColor: string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  switchThumbOff: string;
  switchThumbOn: string;
  switchTrackOff: string;
  switchTrackOn: string;
  toggleValue?: boolean;
  type?: "link" | "toggle";
  value?: string;
  valueColor: string;
};

export function SettingsRow({
  cardBg,
  chevronColor,
  icon,
  iconBg,
  iconColor,
  isRtl,
  label,
  labelColor,
  onPress,
  onToggle,
  switchThumbOff,
  switchThumbOn,
  switchTrackOff,
  switchTrackOn,
  toggleValue,
  type = "link",
  value,
  valueColor,
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
            style={[styles.rowLabel, { color: labelColor }, isRtl ? styles.textRtl : null]}
          >
            {label}
          </ThemedText>
          {value ? (
            <ThemedText
              style={[styles.rowValue, { color: valueColor }, isRtl ? styles.textRtl : null]}
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