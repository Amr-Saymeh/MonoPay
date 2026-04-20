import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "../styles";
import type { WalletType } from "../types";

type WalletTypeOption = {
  key: WalletType;
  icon: any;
  label: string;
};

type WalletTypeSelectorProps = {
  options: WalletTypeOption[];
  selectedType: WalletType;
  onSelect: (type: WalletType) => void;
};

export function WalletTypeSelector({
  options,
  selectedType,
  onSelect,
}: WalletTypeSelectorProps) {
  return (
    <View style={styles.typeRow}>
      {options.map((option) => {
        const selected = option.key === selectedType;

        return (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={({ pressed }) => [
              styles.typeCard,
              selected ? styles.typeCardSelected : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <MaterialIcons
              name={option.icon}
              size={22}
              color={selected ? "#7C3AED" : "rgba(17,24,28,0.55)"}
            />
            <ThemedText type="defaultSemiBold">{option.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
