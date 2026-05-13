import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";

type CaptureHeaderProps = {
  isRtl: boolean;
  onBack: () => void;
  subtitle: string;
  textColor: string;
  title: string;
};

export function CaptureHeader({
  isRtl,
  onBack,
  subtitle,
  textColor,
  title,
}: CaptureHeaderProps) {
  return (
    <View style={styles.topText}>
      <View style={styles.topRow}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed ? styles.pressed : null]}
        >
          <MaterialIcons
            name={isRtl ? "arrow-forward" : "arrow-back"}
            size={22}
            color={textColor}
          />
        </Pressable>
      </View>

      <Animated.View entering={FadeInDown.duration(450)} style={styles.copy}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  topText: {
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  topRow: {
    marginBottom: 10,
  },
  backBtn: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  copy: {
    paddingRight: 8,
  },
  title: {
    fontSize: 22,
  },
  subtitle: {
    marginTop: 6,
    opacity: 0.7,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
});