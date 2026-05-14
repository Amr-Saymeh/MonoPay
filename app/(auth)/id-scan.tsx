
import { CameraView } from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSignupFlow } from "@/src/providers/SignupFlowProvider";

import { CaptureHeader } from "@/src/features/auth/components/CaptureHeader";
import { CapturePermissionCard } from "@/src/features/auth/components/CapturePermissionCard";
import { useCameraCapture } from "@/src/features/auth/hooks/useCameraCapture";
import { captureScreenStyles } from "@/src/features/auth/styles/captureScreens";

export default function IdScanScreen() {
  const { t, isRtl } = useI18n();
  const router = useRouter();
  const { setIdentityImageUri } = useSignupFlow();
  const insets = useSafeAreaInsets();
  const border = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  const { cameraRef, capturePhoto, capturing, permission, photoUri, requestPermission, setPhotoUri } =
    useCameraCapture({
      errorMessage: t("captureFailed"),
      errorTitle: t("error"),
    });

  const onUse = () => {
    if (!photoUri) return;
    setIdentityImageUri(photoUri);
    router.push("/(auth)/selfie" as any);
  };

  const onBack = () => {
    if ((router as any).canGoBack?.()) {
      router.back();
      return;
    }

    router.replace("/(auth)/signup-details" as any);
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
        title={t("scanYourId")}
      />
    );
  }

  return (
    <ThemedView style={captureScreenStyles.screen}>
      <CaptureHeader
        isRtl={isRtl}
        onBack={onBack}
        subtitle={t("idScanHint")}
        textColor={textColor}
        title={t("scanYourId")}
      />

      <View style={captureScreenStyles.cameraWrap}>
        {photoUri ? (
          <Animated.View entering={FadeIn.duration(250)} style={captureScreenStyles.previewWrap}>
            <Image source={{ uri: photoUri }} style={captureScreenStyles.preview} contentFit="cover" />
          </Animated.View>
        ) : (
          <CameraView
            ref={(value) => {
              cameraRef.current = value;
            }}
            active
            facing="back"
            style={captureScreenStyles.camera}
          >
            <View style={captureScreenStyles.overlay}>
              <View style={captureScreenStyles.idFrame}>
                <View style={[captureScreenStyles.corner, captureScreenStyles.tl]} />
                <View style={[captureScreenStyles.corner, captureScreenStyles.tr]} />
                <View style={[captureScreenStyles.corner, captureScreenStyles.bl]} />
                <View style={[captureScreenStyles.corner, captureScreenStyles.br]} />
              </View>
            </View>
          </CameraView>
        )}
      </View>

      <View style={[captureScreenStyles.actions, { paddingBottom: 30 + insets.bottom }]}>
        {photoUri ? (
          <View style={captureScreenStyles.row}>
            <GradientButton
              label={t("retake")}
              onPress={() => setPhotoUri(null)}
              iconName="refresh"
              variant="secondary"
              style={captureScreenStyles.inlinePrimary}
            />
            <GradientButton
              label={t("usePhoto")}
              onPress={onUse}
              disabled={!photoUri}
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
