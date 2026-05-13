import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraView } from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/src/providers/AuthProvider";
import { useSignupFlow } from "@/src/providers/SignupFlowProvider";

import { CaptureHeader } from "@/src/features/auth/components/CaptureHeader";
import { CapturePermissionCard } from "@/src/features/auth/components/CapturePermissionCard";
import { useCameraCapture } from "@/src/features/auth/hooks/useCameraCapture";
import { captureScreenStyles } from "@/src/features/auth/styles/captureScreens";

export default function SelfieScreen() {
  const { t, isRtl } = useI18n();
  const router = useRouter();
  const { register, registering } = useAuth();
  const insets = useSafeAreaInsets();
  const surface = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");
  const surfacePressed = useThemeColor({}, "surfacePressed");
  const textColor = useThemeColor({}, "text");

  const {
    details,
    identityImageUri,
    categories,
    setPersonalImageUri,
    personalImageUri,
    clear,
  } = useSignupFlow();

  const { cameraRef, capturePhoto, capturing, permission, photoUri, requestPermission, setPhotoUri } =
    useCameraCapture({
      errorMessage: t("captureFailed"),
      errorTitle: t("error"),
      initialPhotoUri: personalImageUri,
    });

  const onUse = async () => {
    if (!details || !identityImageUri || !photoUri) {
      Alert.alert(t("error"), t("missingSignupData"));
      router.replace("/(auth)/signup-details" as any);
      return;
    }

    setPersonalImageUri(photoUri);

    try {
      await register({
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        pin: details.pin,
        phone: details.phone,
        address: details.address,
        identityNumber: Number(details.identityNumber),
        identityImageUri,
        personalImageUri: photoUri,
        categories,
      });

      clear();
      router.replace("/(auth)/pending" as any);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("uploadFailed");
      Alert.alert(t("error"), message || t("uploadFailed"));
    }
  };

  const onBack = () => {
    if ((router as any).canGoBack?.()) {
      router.back();
      return;
    }

    router.replace("/(auth)/id-scan" as any);
  };

  if (!permission) {
    return (
      <CapturePermissionCard
        actionLabel={t("continue")}
        activityColor={border}
        description={t("cameraPermissionNeeded")}
        loading
        onPress={() => void requestPermission()}
      />
    );
  }

  if (!permission.granted) {
    return (
      <CapturePermissionCard
        actionLabel={t("continue")}
        description={t("cameraPermissionNeeded")}
        onPress={() => void requestPermission()}
        title={t("takeSelfie")}
      />
    );
  }

  return (
    <ThemedView style={captureScreenStyles.screen}>
      <CaptureHeader
        isRtl={isRtl}
        onBack={onBack}
        subtitle={t("selfieHint")}
        textColor={textColor}
        title={t("takeSelfie")}
      />

      <View style={captureScreenStyles.cameraWrap}>
        {photoUri ? (
          <Animated.View entering={FadeIn.duration(250)} style={captureScreenStyles.previewWrap}>
            <Image
              source={{ uri: photoUri }}
              style={captureScreenStyles.preview}
              contentFit="cover"
            />
          </Animated.View>
        ) : (
          <CameraView
            ref={(value) => {
              cameraRef.current = value;
            }}
            active
            facing="front"
            style={captureScreenStyles.camera}
          >
            <View style={captureScreenStyles.overlay}>
              <View style={captureScreenStyles.selfieOval} />
              <View style={captureScreenStyles.glow1} />
              <View style={captureScreenStyles.glow2} />
            </View>
          </CameraView>
        )}
      </View>

      <View style={[captureScreenStyles.actions, { paddingBottom: 30 + insets.bottom }]}>
        {photoUri ? (
          <View style={captureScreenStyles.row}>
            <Pressable
              onPress={() => setPhotoUri(null)}
              style={({ pressed }) => [
                captureScreenStyles.secondary,
                captureScreenStyles.secondaryWithIcon,
                { backgroundColor: pressed ? surfacePressed : surface, borderColor: border },
                pressed ? captureScreenStyles.pressed : null,
              ]}
            >
              <MaterialIcons name="refresh" size={18} color={textColor} />
              <ThemedText
                type="defaultSemiBold"
                style={captureScreenStyles.secondaryLabel}
                numberOfLines={1}
              >
                {t("retake")}
              </ThemedText>
            </Pressable>
            <GradientButton
              label={t("usePhoto")}
              onPress={() => void onUse()}
              disabled={!photoUri}
              loading={registering}
              iconName="check-circle"
              style={captureScreenStyles.inlinePrimary}
            />
          </View>
        ) : (
          <GradientButton
            label={t("capture")}
            onPress={() => void capturePhoto()}
            iconName="photo-camera"
            style={captureScreenStyles.capturePrimary}
            loading={capturing}
          />
        )}
      </View>
    </ThemedView>
  );
}
