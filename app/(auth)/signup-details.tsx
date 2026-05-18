import { useMemo, useRef, useState } from "react";

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
  cleanEmailInput,
  getSignupValidationError,
  isValidEmail,
  type SignupValues,
} from "@/src/features/auth/utils/signupValidation";
import { isEmailAlreadyInUseError, isEmailInUse } from "@/src/services/auth.service";
import { isUserEmailRegistered } from "@/src/services/user.service";

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
    delayError: 350,
  });

  const formValues = useWatch({ control });
  const pinValue = formValues.pin;
  const currentValidationError = getSignupValidationError(
    {
      address: formValues.address ?? "",
      confirmPin: formValues.confirmPin ?? "",
      email: formValues.email ?? "",
      firstName: formValues.firstName ?? "",
      identityNumber: formValues.identityNumber ?? "",
      lastName: formValues.lastName ?? "",
      phone: formValues.phone ?? "",
      pin: formValues.pin ?? "",
    },
    t,
  );
  const canContinue = !currentValidationError && !formState.errors.email && !continuing;

  const onContinue = handleSubmit(async (values) => {
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

    const nextDetails = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      pin: values.pin,
      phone: values.phone.trim(),
      address: values.address.trim(),
      identityNumber: values.identityNumber.trim(),
    };

    setContinuing(true);

    try {
      const [registeredEmail, authReservedEmail] = await Promise.all([
        isUserEmailRegistered(nextDetails.email),
        isEmailInUse(nextDetails.email).catch(() => false),
      ]);

      const emailTaken = registeredEmail || authReservedEmail;

      if (emailTaken) {
        Alert.alert(t("error"), t("emailAlreadyRegistered"));
        setContinuing(false);
        return;
      }

      clear();
      setDetails(nextDetails);

      requestAnimationFrame(() => {
        router.push("/(tabs)/settings/category-suggestions" as any);
      });
    } catch (error) {
      const message = isEmailAlreadyInUseError(error)
        ? t("emailAlreadyRegistered")
        : error instanceof Error
          ? error.message
          : t("uploadFailed");

      Alert.alert(t("error"), message || t("uploadFailed"));
      setContinuing(false);
    }
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
          rules={{
            required: t("required"),
            validate: (value) => value.trim().length > 0 || t("required"),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <AuthInput
              ref={firstNameRef}
              value={value}
              onChangeText={onChange}
              errorMessage={error?.message}
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
          rules={{
            required: t("required"),
            validate: (value) => value.trim().length > 0 || t("required"),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <AuthInput
              ref={lastNameRef}
              value={value}
              onChangeText={onChange}
              errorMessage={error?.message}
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
          rules={{
            required: t("required"),
            validate: (value) => isValidEmail(value) || t("invalidEmail"),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <AuthInput
              ref={emailRef}
              value={value}
              onChangeText={(text) => onChange(cleanEmailInput(text))}
              errorMessage={error?.message}
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
          rules={{
            required: t("required"),
            validate: (value) => value.trim().length > 0 || t("required"),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <AuthInput
              ref={phoneRef}
              value={value}
              onChangeText={onChange}
              errorMessage={error?.message}
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
          rules={{
            required: t("required"),
            validate: (value) => value.trim().length >= 6 || t("pinTooShort"),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <AuthInput
              ref={pinRef}
              value={value}
              onChangeText={onChange}
              errorMessage={error?.message}
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
            deps: ["pin"],
            required: t("required"),
            validate: (value) => {
              if (value.trim().length === 0) return t("required");
              return value === pinValue || t("pinMismatch");
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <AuthInput
              ref={confirmPinRef}
              value={value}
              onChangeText={onChange}
              errorMessage={error?.message}
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
          rules={{
            required: t("required"),
            validate: (value) => value.trim().length > 0 || t("required"),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <AuthInput
              ref={addressRef}
              value={value}
              onChangeText={onChange}
              errorMessage={error?.message}
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
            required: t("required"),
            validate: (value) => {
              if (value.trim().length === 0) return t("required");
              return Number.isFinite(Number(value)) || t("invalidIdNumber");
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <AuthInput
              ref={identityNumberRef}
              value={value}
              onChangeText={onChange}
              errorMessage={error?.message}
              placeholder={t("idNumber")}
              keyboardType="number-pad"
              returnKeyType="done"
              onFocus={() => scrollToField(identityNumberRef)}
              onSubmitEditing={() => {
                if (!canContinue) return;
                void onContinue();
              }}
            />
          )}
        />

        <GradientButton
          label={t("continue")}
          onPress={() => {
            if (!canContinue) return;
            void onContinue();
          }}
          disabled={!canContinue}
          loading={continuing}
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
