import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

// ─── Strings ─────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    yourQR: "Your QR Code",
    scanMe: "Let others scan this to send you money instantly",
  },
  ar: {
    yourQR: "رمز QR الخاص بك",
    scanMe: "اطلب من الآخرين مسحه لإرسال المال إليك فوراً",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  uid: string;
  userName?: string;
  size?: number;
  isRtl?: boolean;
  language?: "en" | "ar";
}

// ─── Component ────────────────────────────────────────────────────────────────
export function QRCodeDisplay({
  uid,
  userName,
  size = 220,
  isRtl = false,
  language = "en",
}: Props) {
  const s = STRINGS[language];

  return (
    <View style={styles.container}>
      {/* User info */}
      {userName ? (
        <View style={[styles.userRow, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { textAlign: isRtl ? "right" : "left" }]}>
              {userName}
            </Text>
            <Text style={[styles.userLabel, { textAlign: isRtl ? "right" : "left" }]}>
              {s.yourQR}
            </Text>
          </View>
        </View>
      ) : null}

      {/* QR Code */}
      <View style={styles.qrWrapper}>
        <View style={styles.qrInner}>
          <QRCode
            value={uid}
            size={size}
            color="#1F2937"
            backgroundColor="white"
          />
        </View>
        {/* Corner accents */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </View>

      {/* Hint */}
      <View style={styles.hintRow}>
        <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
        <Text style={styles.hint}>{s.scanMe}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  userRow: {
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    width: "100%",
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  userLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  qrWrapper: {
    position: "relative",
    padding: 16,
    marginBottom: 20,
  },
  qrInner: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#7C3AED",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
  },
  hint: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
    flex: 1,
  },
});
