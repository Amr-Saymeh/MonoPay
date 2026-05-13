import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "../styles";

type SettingsProfileCardProps = {
  avatarUri?: string;
  editLabel: string;
  email: string;
  name: string;
  onEditProfile: () => void;
};

export function SettingsProfileCard({
  avatarUri,
  editLabel,
  email,
  name,
  onEditProfile,
}: SettingsProfileCardProps) {
  return (
    <LinearGradient
      colors={["#9B7DFF", "#7C3AED"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.profileCard}
    >
      <View style={styles.profileAvatar}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.profileAvatarImage} contentFit="cover" />
        ) : (
          <View style={styles.profileAvatarPlaceholder}>
            <MaterialIcons name="person" size={32} color="#FFFFFF" />
          </View>
        )}
      </View>

      <ThemedText style={styles.profileName}>{name}</ThemedText>
      <ThemedText style={styles.profileEmail}>{email}</ThemedText>

      <Pressable style={styles.editProfileBtn} onPress={onEditProfile}>
        <ThemedText style={styles.editProfileText}>{editLabel}</ThemedText>
      </Pressable>
    </LinearGradient>
  );
}