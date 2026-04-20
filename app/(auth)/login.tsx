import React, { useCallback, useMemo, useRef, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import * as ScreenCapture from "expo-screen-capture";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  findNodeHandle,
  type TextInput,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LanguageSwitch } from "@/components/language-switch";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/src/providers/AuthProvider";

export default function LoginScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { signIn, signingIn } = useAuth();
  const insets = useSafeAreaInsets();

  const tint = useThemeColor({}, "tint");

  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [secure, setSecure] = useState(true);

  const scrollRef = useRef<ScrollView>(null);
  const emailRef = useRef<TextInput>(null);
  const pinRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "web") return;
      void ScreenCapture.allowScreenCaptureAsync();
    }, []),
  );

  const scrollToField = (fieldRef: React.RefObject<TextInput | null>) => {
    const node = findNodeHandle(fieldRef.current);
    if (!node) return;

    setTimeout(() => {
      (scrollRef.current as any)?.scrollResponderScrollNativeHandleToKeyboard?.(
        node,
        96,
        true,
      );
    }, Platform.OS === "android" ? 80 : 0);
  };

  const canSubmit = useMemo(
    () => email.trim().length > 0 && pin.trim().length > 0,
    [email, pin],
  );

  const onLogin = async () => {
    try {
      await signIn(email, pin);
      router.replace("/" as any);
    } catch {
      Alert.alert(t("error"), t("failedToSignIn"));
    }
  };

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
            { paddingBottom: Math.max(60, insets.bottom + 24) },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.body}>
            <Animated.View
              entering={FadeInDown.duration(500)}
              style={styles.titleBlock}
            >
              <ThemedText style={styles.title}>{t("signIn")}</ThemedText>
              <ThemedText style={styles.brand}>
                {t("appName").toUpperCase()}
              </ThemedText>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.duration(500).delay(80)}
              style={styles.form}
            >
              <AuthInput
                ref={emailRef}
                value={email}
                onChangeText={setEmail}
                placeholder={t("email")}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => scrollToField(emailRef)}
                onSubmitEditing={() => pinRef.current?.focus()}
              />
              <AuthInput
                ref={pinRef}
                value={pin}
                onChangeText={setPin}
                placeholder={t("pin")}
                secureTextEntry={secure}
                onToggleSecure={() => setSecure((s) => !s)}
                keyboardType="number-pad"
                returnKeyType="done"
                onFocus={() => scrollToField(pinRef)}
                onSubmitEditing={() => {
                  if (!canSubmit || signingIn) return;
                  onLogin();
                }}
              />

              <GradientButton
                label={t("login")}
                onPress={onLogin}
                disabled={!canSubmit}
                loading={signingIn}
              />
            </Animated.View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerBrand}>{t("appName")}</ThemedText>
            <View style={styles.footerRow}>
              <ThemedText style={styles.footerMuted}>
                {t("noAccount")} {" "}
              </ThemedText>
              <Link href={"/(auth)/signup-details" as any} style={styles.link}>
                <ThemedText style={[styles.linkText, { color: tint }]}>
                  {t("signUp")}
                </ThemedText>
              </Link>
            </View>
          </View>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 88,
  },
  body: {
    flex: 1,
    justifyContent: "center",
  },
  titleBlock: {
    alignItems: "center",
    marginBottom: 28,
    gap: 10,
  },
  title: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: Fonts.rounded,
    includeFontPadding: false,
  },
  brand: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 1.5,
    color: "#8B5CF6",
    fontFamily: Fonts.rounded,
    includeFontPadding: false,
  },
  form: {
    gap: 14,
  },
  footer: {
    alignItems: "center",
    gap: 12,
    marginTop: 22,
  },
  footerBrand: {
    opacity: 0.7,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerMuted: {
    opacity: 0.7,
  },
  link: {
    paddingHorizontal: 2,
  },
  linkText: {
    fontFamily: Fonts.sansBold,
  },
});
