import { useCallback, useEffect, useRef, useState } from "react";

import { CameraView, useCameraPermissions } from "expo-camera";
import { Alert } from "react-native";

type UseCameraCaptureParams = {
  errorMessage: string;
  errorTitle: string;
  initialPhotoUri?: string | null;
};

export function useCameraCapture({
  errorMessage,
  errorTitle,
  initialPhotoUri = null,
}: UseCameraCaptureParams) {
  const cameraRef = useRef<CameraView | null>(null);
  const requestedPermissionRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(initialPhotoUri);

  useEffect(() => {
    if (!permission || permission.granted || !permission.canAskAgain) return;
    if (requestedPermissionRef.current) return;

    requestedPermissionRef.current = true;
    void requestPermission();
  }, [permission, requestPermission]);

  const capturePhoto = useCallback(async () => {
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
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setCapturing(false);
    }
  }, [capturing, errorMessage, errorTitle]);

  return {
    cameraRef,
    capturePhoto,
    capturing,
    permission,
    photoUri,
    requestPermission,
    setPhotoUri,
  };
}