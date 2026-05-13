import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "../styles";

type SettingsHeaderProps = {
  avatarPlaceholderBg: string;
  avatarUri?: string;
  iconColor: string;
  iconPurpleBg: string;
  isRtl: boolean;
  onBack: () => void;
  textColor: string;
  title: string;
};

export function SettingsHeader({
  avatarPlaceholderBg,
  avatarUri,
  iconColor,
  iconPurpleBg,
  isRtl,
  onBack,
  textColor,
  title,
}: SettingsHeaderProps) {
  return (
    <View style={[styles.header, isRtl ? styles.headerRtl : null]}>
      <Pressable
        style={({ pressed }) => [
          styles.backBtn,
          { backgroundColor: iconPurpleBg },
          pressed ? styles.backBtnPressed : null,
        ]}
        onPress={onBack}
      >
        <MaterialIcons
          name={isRtl ? "arrow-forward" : "arrow-back"}
          size={20}
          color={iconColor}
        />
      </Pressable>

      <ThemedText style={[styles.headerTitle, { color: textColor }]}>{title}</ThemedText>

      <View style={[styles.headerAvatar, { backgroundColor: avatarPlaceholderBg }]}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.headerAvatarImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.headerAvatarPlaceholder}>
            <MaterialIcons name="person" size={20} color={iconColor} />
          </View>
        )}
      </View>
    </View>
  );
}