import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAnimatedListItem } from "../hooks";
import { UserProfile } from "../types";

interface UserRowProps {
  uid: string;
  profile?: UserProfile;
  isOwnerMember: boolean;
  canRemove: boolean;
  onRemove: () => void;
  index: number;
  isLast: boolean;
}

export function UserRow({
  uid,
  profile,
  isOwnerMember,
  canRemove,
  onRemove,
  index,
  isLast,
}: UserRowProps) {
  const anim = useAnimatedListItem(index * 55 + 60);
  const label = profile?.name?.trim() || profile?.email?.trim() || uid;

  return (
    <Animated.View style={[styles.userRow, !isLast && styles.userRowBorder, anim]}>
      <View style={styles.userInfo}>
        <LinearGradient
          colors={["#a78bfa", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userAvatar}
        >
          <MaterialIcons name="person" size={14} color="#fff" />
        </LinearGradient>
        <ThemedText style={styles.username} numberOfLines={1}>{label}</ThemedText>
      </View>

      {isOwnerMember ? (
        <View style={styles.ownerTag}>
          <ThemedText style={styles.ownerTagText}>OWNER</ThemedText>
        </View>
      ) : canRemove ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRemove}
          style={styles.removeBtn}
        >
          <MaterialIcons name="person-remove" size={16} color="#DC2626" />
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  userRowBorder: { 
    borderBottomWidth: 1, 
    borderBottomColor: "#e2dff0" 
  },
  userInfo: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10, 
    flex: 1 
  },
  userAvatar: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  username: { 
    fontSize: 14, 
    flex: 1 
  },
  ownerTag: {
    backgroundColor: "#c084fc",
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  ownerTagText: { 
    color: "#fff", 
    fontSize: 10, 
    fontFamily: Fonts.sansBold, 
    letterSpacing: 0.5 
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(220,38,38,0.10)",
  },
});
