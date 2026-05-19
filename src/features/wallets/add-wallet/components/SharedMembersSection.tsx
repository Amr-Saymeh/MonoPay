import type { Ref } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, View, type TextInput } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AuthInput } from "@/components/ui/auth-input";
import { useThemeColor } from "@/hooks/use-theme-color";

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
  searchInputRef?: Ref<TextInput>;
  onSearchFocus?: () => void;
  onSearchSubmit?: () => void;
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
  searchInputRef,
  onSearchFocus,
  onSearchSubmit,
}: SharedMembersSectionProps) {
  const surfaceColor = useThemeColor({}, "surface");
  const surfacePressedColor = useThemeColor({}, "surfacePressed");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>

      <AuthInput
        ref={searchInputRef}
        value={searchValue}
        onChangeText={onSearchChange}
        placeholder={placeholder}
        autoCapitalize="none"
        returnKeyType="next"
        blurOnSubmit={false}
        onFocus={onSearchFocus}
        onSubmitEditing={onSearchSubmit}
      />

      {selectedMemberUids.length > 0 ? (
        <View style={styles.selectedMembersWrap}>
          {selectedMemberUids.map((uid) => (
            <Pressable
              key={uid}
              onPress={() => onRemoveMember(uid)}
              style={({ pressed }) => [
                styles.memberChip,
                {
                  backgroundColor: pressed ? surfacePressedColor : surfaceColor,
                  borderColor,
                },
              ]}
            >
              <ThemedText type="defaultSemiBold" style={[styles.memberChipText, { color: textColor }]}>
                {allUsers[uid]?.name ?? uid}
              </ThemedText>
              <MaterialIcons name="close" size={14} color={iconColor} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {suggestions.length > 0 ? (
        <View style={[styles.suggestionsBox, { borderColor }]}>
          {suggestions.map(({ uid, profile }, index) => {
            const isLast = index === suggestions.length - 1;

            return (
            <Pressable
              key={uid}
              onPress={() => onAddMember(uid)}
              style={({ pressed }) => [
                styles.suggestionRow,
                {
                  backgroundColor: pressed ? surfacePressedColor : surfaceColor,
                  borderBottomColor: borderColor,
                },
                isLast ? { borderBottomWidth: 0 } : null,
              ]}
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
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
