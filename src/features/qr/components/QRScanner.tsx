import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Strings ─────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    noPermission: "Camera access is required to scan QR codes.",
    grantAccess: "Grant Camera Access",
    scanning: "Align the QR code within the frame",
    loading: "Starting camera...",
  },
  ar: {
    noPermission: "يجب السماح بالوصول للكاميرا لمسح رموز QR.",
    grantAccess: "السماح للكاميرا",
    scanning: "ضع رمز QR داخل الإطار",
    loading: "جاري تشغيل الكاميرا...",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onScanned: (value: string) => void;
  isRtl?: boolean;
  language?: "en" | "ar";
}

const FRAME_SIZE = 260;

// ─── Component ────────────────────────────────────────────────────────────────
export function QRScanner({ onScanned, isRtl = false, language = "en" }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const s = STRINGS[language];

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#7C3AED" size="large" />
        <Text style={styles.loadingText}>{s.loading}</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconWrap}>
            <Ionicons name="camera-outline" size={48} color="#7C3AED" />
          </View>
          <Text style={[styles.permissionText, { textAlign: isRtl ? "right" : "left" }]}>
            {s.noPermission}
          </Text>
          <TouchableOpacity style={styles.permissionBtnOuter} onPress={requestPermission}>
            <LinearGradient
              colors={["#7C3AED", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.permissionBtnGradient}
            >
              <Ionicons name="lock-open-outline" size={18} color="white" />
              <Text style={styles.permissionBtnText}>{s.grantAccess}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.scannerContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => {
                setScanned(true);
                onScanned(data);
              }
        }
      />

      {/* Dimmed overlay with transparent frame */}
      <View style={styles.overlay}>
        {/* Frame */}
        <View style={styles.frameContainer}>
          {/* Corner pieces */}
          <View style={[styles.scanCorner, styles.scanCornerTL]} />
          <View style={[styles.scanCorner, styles.scanCornerTR]} />
          <View style={[styles.scanCorner, styles.scanCornerBL]} />
          <View style={[styles.scanCorner, styles.scanCornerBR]} />
        </View>

        {/* Scan hint */}
        <View style={styles.hintBadge}>
          <Ionicons name="scan-outline" size={16} color="white" />
          <Text style={styles.scanHint}>{s.scanning}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#F8F5FF",
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 12,
  },
  permissionCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  permissionIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  permissionText: {
    color: "#374151",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionBtnOuter: {
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
  },
  permissionBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
  },
  permissionBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  scannerContainer: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  frameContainer: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: "relative",
    backgroundColor: "transparent",
  },
  scanCorner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#7C3AED",
  },
  scanCornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  scanCornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  scanCornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  scanCornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  hintBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 32,
    backgroundColor: "rgba(124,58,237,0.85)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  scanHint: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
});
