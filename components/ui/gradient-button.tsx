
import { useThemeColor } from "@/hooks/use-theme-color";

import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { hapticTap } from '@/src/utils/haptics';

export function GradientButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  iconName,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  variant?: "primary" | "secondary";
}) {
  const secondaryBackground = useThemeColor(
    { light: "#FFFFFF", dark: "rgba(255,255,255,0.08)" },
    "inputBackground",
  );
  const secondaryDisabledBackground = useThemeColor(
    { light: "#E2E8F0", dark: "rgba(255,255,255,0.06)" },
    "surface",
  );
  const secondaryBorderColor = useThemeColor(
    { light: "rgba(109,40,217,0.16)", dark: "rgba(167,139,250,0.34)" },
    "border",
  );
  const secondaryLabelColor = useThemeColor(
    { light: "#5B21B6", dark: "#E9D5FF" },
    "text",
  );
  const isDisabled = Boolean(disabled || loading);
  const isSecondary = variant === "secondary";
  const colors = isSecondary
    ? ([
        isDisabled ? secondaryDisabledBackground : secondaryBackground,
        isDisabled ? secondaryDisabledBackground : secondaryBackground,
      ] as const)
    : (isDisabled
        ? (["#b595ff", "#9d7bd5"] as const)
        : (["#8B5CF6", "#6D28D9"] as const));
  const contentColor = isSecondary ? secondaryLabelColor : "#FFFFFF";

  return (
    <Pressable
      disabled={isDisabled}
      onPressIn={() => {
        if (!isDisabled) hapticTap();
      }}
      onPress={onPress}
      style={({ pressed }) => [style, isDisabled ? styles.disabled : null, pressed ? styles.pressed : null]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          isSecondary ? { borderWidth: 1, borderColor: secondaryBorderColor } : null,
        ]}>
        {loading ? (
          <ActivityIndicator color={contentColor} />
        ) : (
          <View style={styles.contentRow}>
            {iconName ? <MaterialIcons name={iconName} size={18} color={contentColor} /> : null}
            <ThemedText
              type="defaultSemiBold"
              style={[styles.label, { color: contentColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {label}
            </ThemedText>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingHorizontal: 8,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.9,
  },
});
