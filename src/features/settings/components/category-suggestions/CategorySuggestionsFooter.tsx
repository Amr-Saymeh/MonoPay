import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Keyboard, Pressable, TextInput, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";

import { styles } from "./styles";

type CategorySuggestionsFooterProps = {
  adding: boolean;
  bottomPadding: number;
  closeBg: string;
  ctaDisabled: boolean;
  ctaLabel: string;
  ctaShadow: string;
  customName: string;
  inputBg: string;
  isDark: boolean;
  isRtl: boolean;
  mutedColor: string;
  onCancelAdd: () => void;
  onChangeCustomName: (value: string) => void;
  onPrimaryPress: () => void;
  placeholder: string;
  placeholderColor: string;
  saving: boolean;
  textColor: string;
  tintBorder: string;
};

export function CategorySuggestionsFooter({
  adding,
  bottomPadding,
  closeBg,
  ctaDisabled,
  ctaLabel,
  ctaShadow,
  customName,
  inputBg,
  isDark,
  isRtl,
  mutedColor,
  onCancelAdd,
  onChangeCustomName,
  onPrimaryPress,
  placeholder,
  placeholderColor,
  saving,
  textColor,
  tintBorder,
}: CategorySuggestionsFooterProps) {
  return (
    <View pointerEvents="box-none" style={[styles.bottomArea, { paddingBottom: bottomPadding }]}>
      <LinearGradient
        colors={
          isDark
            ? ["rgba(15,13,19,0)", "rgba(15,13,19,0.95)", "#0F0D13"]
            : ["rgba(248,245,252,0)", "rgba(248,245,252,0.95)", "#F8F5FC"]
        }
        style={styles.bottomGradient}
      />

      {adding ? (
        <Animated.View
          entering={FadeInUp.duration(200)}
          style={[styles.customInputRow, { backgroundColor: inputBg, borderColor: tintBorder }]}
        >
          <TextInput
            value={customName}
            onChangeText={onChangeCustomName}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={onPrimaryPress}
            style={[styles.customInput, { color: textColor, textAlign: isRtl ? "right" : "left" }]}
          />
          <Pressable
            onPress={() => {
              onCancelAdd();
              Keyboard.dismiss();
            }}
            style={({ pressed }) => [
              styles.closeBtn,
              { backgroundColor: closeBg },
              pressed ? styles.pressed : null,
            ]}
          >
            <MaterialIcons name="close" size={20} color={mutedColor} />
          </Pressable>
        </Animated.View>
      ) : null}

      <Pressable
        disabled={adding ? ctaDisabled : saving}
        onPress={onPrimaryPress}
        style={({ pressed }) => [
          styles.ctaWrap,
          { shadowColor: ctaShadow },
          (adding ? ctaDisabled : saving) ? styles.disabled : null,
          pressed && !(adding ? ctaDisabled : saving) ? styles.pressed : null,
        ]}
      >
        <LinearGradient
          colors={isDark ? ["#8B5CF6", "#6D28D9"] : ["#6200EE", "#5000D0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.ctaBtn, isRtl ? styles.ctaBtnRtl : null]}
        >
          <ThemedText style={styles.ctaLabel}>{ctaLabel}</ThemedText>
        </LinearGradient>
      </Pressable>
    </View>
  );
}