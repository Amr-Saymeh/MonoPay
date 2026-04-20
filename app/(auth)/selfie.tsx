import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    View
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { useSignup } from "@/hooks/use-signup-flow";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/src/providers/AuthProvider";

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
  } = useSignup();

  const cameraRef = useRef<CameraView | null>(null);
  const requestedPermissionRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();

  const [capturing, setCapturing] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(personalImageUri);

  const hasPermission = permission?.granted;

  const onCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        exif: false,
        skipProcessing: true,
        base64: false,
      });
      setPhotoUri(photo.uri);
    } catch {
      Alert.alert(t("error"), t("captureFailed"));
    } finally {
      setCapturing(false);
    }
  };

  const canUse = useMemo(
    () => typeof photoUri === "string" && photoUri.length > 0,
    [photoUri],
  );

  const askPermission = useCallback(async () => {
    requestedPermissionRef.current = true;
    await requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (!permission || permission.granted || !permission.canAskAgain) return;
    if (requestedPermissionRef.current) return;
    void askPermission();
  }, [askPermission, permission]);

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
      router.replace("/(auth)/welcome" as any);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("uploadFailed");
      Alert.alert(t("error"), msg || t("uploadFailed"));
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
      <ThemedView style={styles.permission}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.permissionCard}
        >
          <ActivityIndicator size="small" color={border} />
          <ThemedText style={styles.permissionText}>
            {t("cameraPermissionNeeded")}
          </ThemedText>
          <GradientButton label={t("continue")} onPress={() => void askPermission()} />
        </Animated.View>
      </ThemedView>
    );
  }

  if (!hasPermission) {
    return (
      <ThemedView style={styles.permission}>
        <Animated.View
          entering={FadeInDown.duration(450)}
          style={styles.permissionCard}
        >
          <ThemedText type="subtitle">{t("takeSelfie")}</ThemedText>
          <ThemedText style={styles.permissionText}>
            {t("cameraPermissionNeeded")}
          </ThemedText>
          <GradientButton
            label={t("continue")}
            onPress={() => void askPermission()}
          />
        </Animated.View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.topText}>
        <View style={styles.topRow}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <MaterialIcons
              name={isRtl ? "arrow-forward" : "arrow-back"}
              size={22}
              color={textColor}
            />
          </Pressable>
        </View>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.topCopy}>
          <ThemedText type="subtitle" style={styles.title}>
            {t("takeSelfie")}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{t("selfieHint")}</ThemedText>
        </Animated.View>
      </View>

      <View style={styles.cameraWrap}>
        {photoUri ? (
          <Animated.View
            entering={FadeIn.duration(250)}
            style={styles.previewWrap}
          >
            <Image
              source={{ uri: photoUri }}
              style={styles.preview}
              contentFit="cover"
            />
          </Animated.View>
        ) : (
          <CameraView
            ref={(r) => {
              cameraRef.current = r;
            }}
            active={!photoUri}
            style={styles.camera}
            facing="front"
          >
            <View style={styles.overlay}>
              <View style={styles.selfieOval} />
              <View style={styles.glow1} />
              <View style={styles.glow2} />
            </View>
          </CameraView>
        )}
      </View>

      <View style={[styles.actions, { paddingBottom: 30 + insets.bottom }]}>
        {photoUri ? (
          <View style={styles.row}>
            <Pressable
              onPress={() => setPhotoUri(null)}
              style={({ pressed }) => [
                styles.secondary,
                { backgroundColor: pressed ? surfacePressed : surface, borderColor: border },
                pressed ? styles.pressed : null,
              ]}
            >
              <MaterialIcons name="refresh" size={18} color={textColor} />
              <ThemedText
                type="defaultSemiBold"
                style={styles.secondaryLabel}
                numberOfLines={1}
              >
                {t("retake")}
              </ThemedText>
            </Pressable>
            <GradientButton
              label={t("usePhoto")}
              onPress={onUse}
              disabled={!canUse}
              loading={registering}
              iconName="check-circle"
              style={styles.inlinePrimary}
            />
          </View>
        ) : (
          <GradientButton
            label={t("capture")}
            onPress={onCapture}
            iconName="photo-camera"
            style={styles.capturePrimary}
            loading={capturing}
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
  topRow: {
    marginBottom: 10,
  },
  topCopy: {
    paddingRight: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
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
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selfieOval: {
    width: 240,
    height: 320,
    borderRadius: 160,
    borderWidth: 5,
    borderColor: "rgba(167, 139, 250, 0.95)",
  },
  glow1: {
    position: "absolute",
    width: 260,
    height: 340,
    borderRadius: 180,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.35)",
  },
  glow2: {
    position: "absolute",
    width: 285,
    height: 370,
    borderRadius: 190,
    borderWidth: 2,
    borderColor: "rgba(109, 40, 217, 0.18)",
  },
  actions: {
    padding: 16,
    paddingBottom: 30,
    alignItems: "center",
  },
  capturePrimary: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "stretch",
  },
  inlinePrimary: {
    flex: 1,
    minHeight: 58,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
    justifyContent: "center",
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  secondary: {
    flex: 1,
    minHeight: 58,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    gap: 8,
  },
  secondaryLabel: {
    textAlign: "center",
    flexShrink: 1,
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
    borderColor: "rgba(17, 24, 28, 0.08)",
    backgroundColor: "rgba(17, 24, 28, 0.03)",
  },
  permissionText: {
    opacity: 0.7,
    marginBottom: 6,
  },
});
