import React, { useCallback, useRef, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, View, type ScrollView, type TextInput } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/src/providers/AuthProvider";

import { AuthFooterLink } from "@/src/features/auth/components/AuthFooterLink";
import { AuthScreenHeader } from "@/src/features/auth/components/AuthScreenHeader";
import { AuthScreenShell } from "@/src/features/auth/components/AuthScreenShell";
import { authFormStyles } from "@/src/features/auth/styles/formScreens";
import { isValidEmail } from "@/src/features/auth/utils/signupValidation";

type LoginFormValues = {
  email: string;
  pin: string;
};

export default function LoginScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { signIn, signingIn } = useAuth();
  const insets = useSafeAreaInsets();
  const tint = useThemeColor({}, "tint");

  const [secure, setSecure] = useState(true);

  const scrollRef = useRef<ScrollView>(null);
  const emailRef = useRef<TextInput>(null);
  const pinRef = useRef<TextInput>(null);

  const { control, handleSubmit, reset, watch } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      pin: "",
    },
  });

  const emailValue = watch("email");
  const pinValue = watch("pin");
  const canSubmit = emailValue.trim().length > 0 && pinValue.trim().length > 0 && !signingIn;

  useFocusEffect(
    useCallback(() => {
      reset({ email: "", pin: "" });
      setSecure(true);
    }, [reset]),
  );

  const onLogin = handleSubmit(async ({ email, pin }) => {
    try {
      await signIn(email.trim(), pin.trim());
      router.replace("/" as any);
    } catch {
      Alert.alert(t("error"), t("failedToSignIn"));
    }
  });

  return (
    <AuthScreenShell
      scrollRef={scrollRef}
      bottomInset={insets.bottom}
      contentStyle={authFormStyles.centeredContent}
    >
      <View style={authFormStyles.body}>
        <AuthScreenHeader title={t("signIn")} delay={50} />

        <Animated.View entering={FadeInUp.duration(500).delay(80)} style={authFormStyles.form}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: true,
              validate: (value) => isValidEmail(value),
            }}
            render={({ field: { onChange, value } }) => (
              <AuthInput
                ref={emailRef}
                value={value}
                onChangeText={onChange}
                placeholder={t("email")}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => pinRef.current?.focus()}
              />
            )}
          />
          <Controller
            control={control}
            name="pin"
            rules={{
              required: true,
              validate: (value) => value.trim().length >= 6,
            }}
            render={({ field: { onChange, value } }) => (
              <AuthInput
                ref={pinRef}
                value={value}
                onChangeText={onChange}
                placeholder={t("pin")}
                secureTextEntry={secure}
                onToggleSecure={() => setSecure((current) => !current)}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (!canSubmit) return;
                  void onLogin();
                }}
              />
            )}
          />

          <GradientButton
            label={t("login")}
            onPress={() => void onLogin()}
            disabled={!canSubmit}
            loading={signingIn}
          />
        </Animated.View>
      </View>

      <View style={authFormStyles.footer}>
        <ThemedText style={authFormStyles.footerBrand}>{t("appName")}</ThemedText>
        <AuthFooterLink
          href={"/(auth)/signup-details" as any}
          label={t("signUp")}
          prompt={t("noAccount")}
          tint={tint}
        />
      </View>
    </AuthScreenShell>
  );
}
