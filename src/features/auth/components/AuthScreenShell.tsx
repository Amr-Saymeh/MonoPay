import React from "react";

import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { LanguageSwitch } from "@/components/language-switch";
import { ThemedView } from "@/components/themed-view";

type AuthScreenShellProps = {
  bottomInset: number;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scrollRef: React.RefObject<ScrollView | null>;
};

export function AuthScreenShell({
  bottomInset,
  children,
  contentStyle,
  scrollRef,
}: AuthScreenShellProps) {
  return (
    <ThemedView style={styles.screen}>
      <LanguageSwitch />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(60, bottomInset + 24) },
            contentStyle,
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 88,
  },
});