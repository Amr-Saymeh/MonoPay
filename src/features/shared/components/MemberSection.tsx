import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthInput } from "@/components/ui/auth-input";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { UserProfile } from "../types";
import { UserRow } from "./UserRow";

interface MemberSectionProps {
  isOwner: boolean;
  search: string;
  onSearchChange: (text: string) => void;
  suggestions: Array<{ uid: string; profile: UserProfile }>;
  onAddMember: (uid: string) => void;
  memberProfiles: Array<{ uid: string; profile?: UserProfile }>;
  ownerUid: string | undefined;
  onRemoveMember: (uid: string) => void;
}

export function MemberSection({
  isOwner,
  search,
  onSearchChange,
  suggestions,
  onAddMember,
  memberProfiles,
  ownerUid,
  onRemoveMember,
}: MemberSectionProps) {
  const { t } = useI18n();
  const surfaceColor = useThemeColor({}, 'surface');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <ThemedView style={[styles.sectionCard, { borderColor, backgroundColor: surfaceColor }]}>
      <View style={[styles.pillHeader, { backgroundColor: surfaceColor }]}>
        <ThemedText style={styles.pillHeaderText}>{t("members") ?? "Members"}</ThemedText>
      </View>

      {isOwner && (
        <View style={styles.memberSearchSection}>
          <View style={styles.divider} />

          <AuthInput
            value={search}
            onChangeText={onSearchChange}
            placeholder={t("searchByNameOrNumber") ?? "Search by name, phone or email"}
          />
          {suggestions.length > 0 && (
            <View style={[styles.suggestionsBox, { borderColor, backgroundColor }]}>
              {suggestions.map(({ uid, profile }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={uid}
                  onPress={() => onAddMember(uid)}
                  style={[styles.suggestionRow, { borderBottomColor: borderColor }]}
                >
                  <LinearGradient
                    colors={["#a78bfa", "#7c3aed"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.suggestionAvatar}
                  >
                    <MaterialIcons name="person-add-alt-1" size={14} color="#fff" />
                  </LinearGradient>
                  <View style={styles.suggestionInfo}>
                    <ThemedText style={{ fontFamily: Fonts.sansBold }} numberOfLines={1}>
                      {profile?.name ?? "Unnamed"}
                    </ThemedText>
                    <ThemedText style={styles.suggestionSub} numberOfLines={1}>
                      {profile?.email ?? profile?.number ?? uid}
                    </ThemedText>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={iconColor} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {search.trim().length > 0 && suggestions.length === 0 && (
            <ThemedText style={styles.helperText}>{t("noResults") ?? "No matching users found."}</ThemedText>
          )}
        </View>
      )}

      <View style={[styles.leftBorder, { borderLeftColor: borderColor }]}>
        {memberProfiles.length === 0 ? (
          <ThemedText style={styles.emptyText}>No members yet.</ThemedText>
        ) : (
          memberProfiles.map(({ uid, profile }, index) => (
            <UserRow
              key={uid}
              uid={uid}
              profile={profile}
              isOwnerMember={uid === ownerUid}
              canRemove={isOwner}
              onRemove={() => onRemoveMember(uid)}
              index={index}
              isLast={index === memberProfiles.length - 1}
            />
          ))
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: borderColor }]} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  pillHeader: {
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillHeaderText: { fontSize: 13, fontFamily: Fonts.sansBold, letterSpacing: 0.3 },
  leftBorder: {
    borderLeftWidth: 2.5,
    paddingLeft: 14,
  },
  divider: { height: 1 },
  memberSearchSection: { gap: 10 },
  suggestionsBox: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  suggestionAvatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  suggestionInfo: {
    flex: 1
  },
  suggestionSub: {
    opacity: 0.6,
    marginTop: 2,
    fontSize: 13
  },
  helperText: {
    opacity: 0.65,
    fontSize: 13
  },
  emptyText: {
    opacity: 0.65
  },
});
