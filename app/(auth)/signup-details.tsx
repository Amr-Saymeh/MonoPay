import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { useSignup } from "@/hooks/use-signup-flow";
import { useThemeColor } from "@/hooks/use-theme-color";

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

export default function SignupDetailsScreen() {
  const { t, isRtl } = useI18n();
  const router = useRouter();
  const { setDetails, clear } = useSignup();
  const insets = useSafeAreaInsets();

  const tint = useThemeColor({}, "tint");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");

  const [securePin, setSecurePin] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [continuing, setContinuing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const continueLockRef = useRef(false);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const pinRef = useRef<TextInput>(null);
  const confirmPinRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const identityNumberRef = useRef<TextInput>(null);

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

  const canContinue = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      isValidEmail(email) &&
      phone.trim().length > 0 &&
      pin.trim().length >= 6 &&
      pin === confirmPin &&
      address.trim().length > 0 &&
      identityNumber.trim().length > 0
    );
  }, [
    firstName,
    lastName,
    email,
    phone,
    pin,
    confirmPin,
    address,
    identityNumber,
  ]);

  const onContinue = () => {
    if (continueLockRef.current || continuing) return;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !pin.trim() ||
      !confirmPin.trim() ||
      !address.trim() ||
      !identityNumber.trim()
    ) {
      Alert.alert(t("error"), t("fillAllFields"));
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(t("error"), t("invalidEmail"));
      return;
    }

    if (pin.trim().length < 6) {
      Alert.alert(t("error"), t("pinTooShort"));
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert(t("error"), t("pinMismatch"));
      return;
    }

    const idValue = Number(identityNumber);
    if (!Number.isFinite(idValue)) {
      Alert.alert(t("error"), t("invalidIdNumber"));
      return;
    }

    clear();
    setDetails({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      pin,
      phone: phone.trim(),
      address: address.trim(),
      identityNumber: identityNumber.trim(),
    });

    continueLockRef.current = true;
    setContinuing(true);
    router.push("/category-suggestions" as any);
  };

  useEffect(() => {
    if (!continuing) return;
    const timer = setTimeout(() => {
      continueLockRef.current = false;
      setContinuing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [continuing]);

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
          <Animated.View
            entering={FadeInDown.duration(450)}
            style={styles.header}
          >
            <ThemedText style={styles.title}>{t("signUp")}</ThemedText>
            <ThemedText style={styles.brand}>
              {t("appName").toUpperCase()}
            </ThemedText>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(450).delay(80)}
            style={styles.form}
          >
            <AuthInput
              ref={firstNameRef}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t("firstName")}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(firstNameRef)}
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
            <AuthInput
              ref={lastNameRef}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t("lastName")}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(lastNameRef)}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
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
              onSubmitEditing={() => phoneRef.current?.focus()}
            />

            <AuthInput
              ref={phoneRef}
              value={phone}
              onChangeText={setPhone}
              placeholder={t("phone")}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(phoneRef)}
              onSubmitEditing={() => pinRef.current?.focus()}
            />

            <AuthInput
              ref={pinRef}
              value={pin}
              onChangeText={setPin}
              placeholder={t("pin")}
              secureTextEntry={securePin}
              onToggleSecure={() => setSecurePin((s) => !s)}
              keyboardType="number-pad"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(pinRef)}
              onSubmitEditing={() => confirmPinRef.current?.focus()}
            />

            <AuthInput
              ref={confirmPinRef}
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder={t("confirmPin")}
              secureTextEntry={secureConfirm}
              onToggleSecure={() => setSecureConfirm((s) => !s)}
              keyboardType="number-pad"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(confirmPinRef)}
              onSubmitEditing={() => addressRef.current?.focus()}
            />

            <AuthInput
              ref={addressRef}
              value={address}
              onChangeText={setAddress}
              placeholder={t("address")}
              autoCapitalize="sentences"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(addressRef)}
              onSubmitEditing={() => identityNumberRef.current?.focus()}
            />
            <AuthInput
              ref={identityNumberRef}
              value={identityNumber}
              onChangeText={setIdentityNumber}
              placeholder={t("idNumber")}
              keyboardType="number-pad"
              returnKeyType="done"
              onFocus={() => scrollToField(identityNumberRef)}
              onSubmitEditing={onContinue}
            />

            <GradientButton
              label={t("continue")}
              onPress={onContinue}
              disabled={continuing}
              style={
                !canContinue || continuing
                  ? { opacity: 0.6 }
                  : undefined
              }
            />
          </Animated.View>

          <View style={styles.footer}>
            <View
              style={[styles.footerRow, isRtl ? styles.footerRowRtl : null]}
            >
              <ThemedText style={styles.footerMuted}>
                {t("alreadyHaveAccount")}{" "}
              </ThemedText>
              <Link href={"/(auth)/login" as any} style={styles.link}>
                <ThemedText style={[styles.linkText, { color: tint }]}>
                  {t("signIn")}
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
    paddingHorizontal: 24,
    paddingTop: 88,
    paddingBottom: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 22,
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
    marginTop: 22,
    alignItems: "center",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerRowRtl: {
    flexDirection: "row-reverse",
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
