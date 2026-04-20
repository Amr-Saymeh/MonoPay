import React, { forwardRef, useMemo } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";

export type AuthInputProps = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  onToggleSecure?: () => void;
} & Omit<TextInputProps, "value" | "onChangeText" | "placeholder">;

export const AuthInput = forwardRef<TextInput, AuthInputProps>(function AuthInput(
  {
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    onToggleSecure,
    autoCapitalize,
    style,
    ...rest
  },
  ref,
) {
  const { isRtl } = useI18n();
  const backgroundColor = useThemeColor({}, "inputBackground");
  const borderColor = useThemeColor({}, "inputBorder");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");
  const iconColor = useThemeColor({}, "icon");

  const showEye = useMemo(
    () => typeof onToggleSecure === "function",
    [onToggleSecure],
  );

  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        style={[
          styles.input,
          isRtl ? styles.rtl : null,
          showEye ? styles.withIcon : null,
          { backgroundColor, borderColor, color: textColor },
          style,
        ]}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? "none"}
        {...rest}
      />

      {showEye ? (
        <Pressable onPress={onToggleSecure} style={styles.eye}>
          <MaterialIcons
            name={secureTextEntry ? "visibility-off" : "visibility"}
            size={20}
            color={iconColor}
          />
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: Fonts.sans,
  },
  withIcon: {
    paddingRight: 46,
  },
  eye: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  rtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
