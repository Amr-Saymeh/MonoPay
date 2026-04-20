import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AuthInput } from "@/components/ui/auth-input";

import { styles } from "../styles";
import type { SharedSuggestion, UserProfile } from "../types";

type SharedMembersSectionProps = {
  title: string;
  placeholder: string;
  searchValue: string;
  selectedMemberUids: string[];
  allUsers: Record<string, UserProfile>;
  suggestions: SharedSuggestion[];
  onSearchChange: (value: string) => void;
  onRemoveMember: (uid: string) => void;
  onAddMember: (uid: string) => void;
};

export function SharedMembersSection({
  title,
  placeholder,
  searchValue,
  selectedMemberUids,
  allUsers,
  suggestions,
  onSearchChange,
  onRemoveMember,
  onAddMember,
}: SharedMembersSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>

      <AuthInput
        value={searchValue}
        onChangeText={onSearchChange}
        placeholder={placeholder}
        autoCapitalize="none"
      />

      {selectedMemberUids.length > 0 ? (
        <View style={styles.selectedMembersWrap}>
          {selectedMemberUids.map((uid) => (
            <Pressable
              key={uid}
              onPress={() => onRemoveMember(uid)}
              style={({ pressed }) => [styles.memberChip, pressed ? styles.pressed : null]}
            >
              <ThemedText type="defaultSemiBold" style={styles.memberChipText}>
                {allUsers[uid]?.name ?? uid}
              </ThemedText>
              <MaterialIcons name="close" size={14} color="rgba(17,24,28,0.6)" />
            </Pressable>
          ))}
        </View>
      ) : null}

      {suggestions.length > 0 ? (
        <View style={styles.suggestionsBox}>
          {suggestions.map(({ uid, profile }) => (
            <Pressable
              key={uid}
              onPress={() => onAddMember(uid)}
              style={({ pressed }) => [styles.suggestionRow, pressed ? styles.pressed : null]}
            >
              <View style={styles.suggestionInfo}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {profile?.name ?? "Unnamed"}
                </ThemedText>
                <ThemedText style={styles.suggestionSub} numberOfLines={1}>
                  {profile?.number ?? uid}
                </ThemedText>
              </View>
              <MaterialIcons name="add" size={18} color="#7C3AED" />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
