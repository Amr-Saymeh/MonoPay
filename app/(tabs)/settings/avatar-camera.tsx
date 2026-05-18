import { useState } from "react";

import { CameraView } from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Alert,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useCameraCapture } from "@/src/features/auth/hooks/useCameraCapture";
import { useAuth } from "@/src/providers/AuthProvider";
import { uploadImageToCloudinary } from "@/src/services/cloudinary.service";
import { updateUserProfile } from "@/src/services/user.service";

export default function AvatarCameraScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();
  const surface = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");

  const [saving, setSaving] = useState(false);
  const { cameraRef, capturePhoto, capturing, permission, photoUri, requestPermission, setPhotoUri } =
    useCameraCapture({
      errorMessage: t("captureFailed"),
      errorTitle: t("error"),
      initialPhotoUri: null,
    });

  const onUse = async () => {
    if (!user || !photoUri) return;

    setSaving(true);
    try {
      const stamp = Date.now();
      const url = await uploadImageToCloudinary({
        uri: photoUri,
        folder: "monopay/personal",
        fileName: `${user.uid}-avatar-${stamp}`,
      });

      await updateUserProfile(user.uid, { personalImage: url });
      router.back();
    } catch (error) {
      Alert.alert(t("error"), error instanceof Error ? error.message : t("uploadFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.permission}>
        <Animated.View
          entering={FadeInDown.duration(450)}
          style={[styles.permissionCard, { borderColor: border, backgroundColor: surface }]}
        >
          <ThemedText type="subtitle">{t("takeSelfie")}</ThemedText>
          <ThemedText style={styles.permissionText}>{t("cameraPermissionNeeded")}</ThemedText>
          <GradientButton label={t("continue")} onPress={() => void requestPermission()} />
        </Animated.View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.topText}>
        <Animated.View entering={FadeInDown.duration(450)}>
          <ThemedText type="subtitle" style={styles.title}>
            {profile?.name ?? t("takeSelfie")}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{t("selfieHint")}</ThemedText>
        </Animated.View>
      </View>

      <View style={styles.cameraWrap}>
        {photoUri ? (
          <Animated.View entering={FadeIn.duration(250)} style={styles.previewWrap}>
            <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />
          </Animated.View>
        ) : (
          <CameraView
            ref={(value) => {
              cameraRef.current = value;
            }}
            style={styles.camera}
            active
            facing="front"
          />
        )}
      </View>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom + 20, 24) }]}>
        {photoUri ? (
          <View style={styles.row}>
            <GradientButton
              label={t("retake")}
              onPress={() => setPhotoUri(null)}
              iconName="refresh"
              variant="secondary"
              style={styles.inlineButton}
            />
            <GradientButton
              label={t("usePhoto")}
              onPress={() => void onUse()}
              disabled={!photoUri}
              loading={saving}
              style={styles.inlineButton}
            />
          </View>
        ) : (
          <GradientButton
            label={t("capture")}
            onPress={() => void capturePhoto()}
            iconName="photo-camera"
            loading={capturing}
            style={styles.captureButton}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topText: {
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 6,
  },
  cameraWrap: {
    flex: 1,
    padding: 16,
  },
  camera: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  actions: {
    padding: 16,
    alignItems: "center",
  },
  captureButton: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  pressed: {
    opacity: 0.88,
  },
  row: {
    gap: 12,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  inlineButton: {
    width: "100%",
  },
  previewWrap: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  permission: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  permissionCard: {
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
  },
  permissionText: {
    opacity: 0.7,
    marginBottom: 6,
  },
});
