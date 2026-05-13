import React, { useMemo, useRef, useState } from "react";

import { useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Alert, View, type TextInput } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSignupFlow } from "@/src/providers/SignupFlowProvider";

import { AuthFooterLink } from "@/src/features/auth/components/AuthFooterLink";
import { AuthScreenHeader } from "@/src/features/auth/components/AuthScreenHeader";
import { AuthScreenShell } from "@/src/features/auth/components/AuthScreenShell";
import { useAuthFormScreen } from "@/src/features/auth/hooks/useAuthFormScreen";
import { authFormStyles } from "@/src/features/auth/styles/formScreens";
import {
    getSignupValidationError,
    isValidEmail,
    type SignupValues,
} from "@/src/features/auth/utils/signupValidation";

export default function SignupDetailsScreen() {
  const { t, isRtl } = useI18n();
  const router = useRouter();
  const { details, setDetails, clear } = useSignupFlow();
  const insets = useSafeAreaInsets();
  const tint = useThemeColor({}, "tint");

  const [securePin, setSecurePin] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [continuing, setContinuing] = useState(false);

  const { scrollRef, scrollToField } = useAuthFormScreen();
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const pinRef = useRef<TextInput>(null);
  const confirmPinRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const identityNumberRef = useRef<TextInput>(null);

  const defaultValues = useMemo<SignupValues>(
    () => ({
      address: details?.address ?? "",
      confirmPin: details?.pin ?? "",
      email: details?.email ?? "",
      firstName: details?.firstName ?? "",
      identityNumber: details?.identityNumber ?? "",
      lastName: details?.lastName ?? "",
      phone: details?.phone ?? "",
      pin: details?.pin ?? "",
    }),
    [details],
  );

  const { control, formState, handleSubmit } = useForm<SignupValues>({
    defaultValues,
    mode: "onChange",
  });

  const pinValue = useWatch({ control, name: "pin" });
  const canContinue = formState.isValid && !continuing;

  const onContinue = handleSubmit((values) => {
    if (continuing) return;

    const error = getSignupValidationError(
      {
        address: values.address,
        confirmPin: values.confirmPin,
        email: values.email,
        firstName: values.firstName,
        identityNumber: values.identityNumber,
        lastName: values.lastName,
        phone: values.phone,
        pin: values.pin,
      },
      t,
    );

    if (error) {
      Alert.alert(t("error"), error);
      return;
    }

    clear();
    setDetails({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      pin: values.pin,
      phone: values.phone.trim(),
      address: values.address.trim(),
      identityNumber: values.identityNumber.trim(),
    });

    setContinuing(true);
    router.push("/(tabs)/settings/category-suggestions" as any);
  });

  return (
    <AuthScreenShell
      scrollRef={scrollRef}
      bottomInset={insets.bottom}
      contentStyle={authFormStyles.signupContent}
    >
      <AuthScreenHeader title={t("signUp")} />

      <Animated.View entering={FadeInUp.duration(450).delay(80)} style={authFormStyles.form}>
        <Controller
          control={control}
          name="firstName"
          rules={{ required: true, validate: (value) => value.trim().length > 0 }}
          render={({ field: { onChange, value } }) => (
            <AuthInput
              ref={firstNameRef}
              value={value}
              onChangeText={onChange}
              placeholder={t("firstName")}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(firstNameRef)}
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          rules={{ required: true, validate: (value) => value.trim().length > 0 }}
          render={({ field: { onChange, value } }) => (
            <AuthInput
              ref={lastNameRef}
              value={value}
              onChangeText={onChange}
              placeholder={t("lastName")}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(lastNameRef)}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          rules={{ required: true, validate: (value) => isValidEmail(value) }}
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
              onFocus={() => scrollToField(emailRef)}
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          rules={{ required: true, validate: (value) => value.trim().length > 0 }}
          render={({ field: { onChange, value } }) => (
            <AuthInput
              ref={phoneRef}
              value={value}
              onChangeText={onChange}
              placeholder={t("phone")}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(phoneRef)}
              onSubmitEditing={() => pinRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="pin"
          rules={{ required: true, validate: (value) => value.trim().length >= 6 }}
          render={({ field: { onChange, value } }) => (
            <AuthInput
              ref={pinRef}
              value={value}
              onChangeText={onChange}
              placeholder={t("pin")}
              secureTextEntry={securePin}
              onToggleSecure={() => setSecurePin((current) => !current)}
              keyboardType="number-pad"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(pinRef)}
              onSubmitEditing={() => confirmPinRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPin"
          rules={{
            required: true,
            validate: (value) => value.trim().length > 0 && value === pinValue,
          }}
          render={({ field: { onChange, value } }) => (
            <AuthInput
              ref={confirmPinRef}
              value={value}
              onChangeText={onChange}
              placeholder={t("confirmPin")}
              secureTextEntry={secureConfirm}
              onToggleSecure={() => setSecureConfirm((current) => !current)}
              keyboardType="number-pad"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(confirmPinRef)}
              onSubmitEditing={() => addressRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="address"
          rules={{ required: true, validate: (value) => value.trim().length > 0 }}
          render={({ field: { onChange, value } }) => (
            <AuthInput
              ref={addressRef}
              value={value}
              onChangeText={onChange}
              placeholder={t("address")}
              autoCapitalize="sentences"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(addressRef)}
              onSubmitEditing={() => identityNumberRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="identityNumber"
          rules={{
            required: true,
            validate: (value) => value.trim().length > 0 && Number.isFinite(Number(value)),
          }}
          render={({ field: { onChange, value } }) => (
            <AuthInput
              ref={identityNumberRef}
              value={value}
              onChangeText={onChange}
              placeholder={t("idNumber")}
              keyboardType="number-pad"
              returnKeyType="done"
              onFocus={() => scrollToField(identityNumberRef)}
              onSubmitEditing={() => void onContinue()}
            />
          )}
        />

        <GradientButton
          label={t("continue")}
          onPress={() => void onContinue()}
          disabled={!canContinue}
          style={!canContinue ? { opacity: 0.6 } : undefined}
        />
      </Animated.View>

      <View style={authFormStyles.signupFooter}>
        <AuthFooterLink
          href={"/(auth)/login" as any}
          isRtl={isRtl}
          label={t("signIn")}
          prompt={t("alreadyHaveAccount")}
          tint={tint}
        />
      </View>
    </AuthScreenShell>
  );
}
