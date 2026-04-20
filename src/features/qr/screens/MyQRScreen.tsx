import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/src/providers/AuthProvider";
import { QRCodeDisplay } from "../components/QRCodeDisplay";

// ─── Strings ─────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    title: "My QR Code",
    scanQR: "Scan a QR Code",
    shareHint: "Show this code to receive payments instantly",
  },
  ar: {
    title: "رمز QR الخاص بي",
    scanQR: "مسح رمز QR",
    shareHint: "أظهر هذا الرمز لاستلام المدفوعات فوراً",
  },
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MyQRScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { language, isRtl } = useI18n();
  const s = STRINGS[language as "en" | "ar"] ?? STRINGS.en;

  const uid = user?.uid ?? "";
  const userName = profile?.name ?? "";

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={["#7C3AED", "#6D28D9", "#5B21B6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View
          style={[
            styles.headerRow,
            { flexDirection: isRtl ? "row-reverse" : "row" },
          ]}
        >
          <Ionicons
            name={isRtl ? "arrow-forward" : "arrow-back"}
            size={24}
            color="white"
            onPress={() => router.back()}
          />
          <Text
            style={[
              styles.headerTitle,
              {
                flex: 1,
                marginLeft: isRtl ? 0 : 10,
                marginRight: isRtl ? 10 : 0,
              },
            ]}
          >
            {s.title}
          </Text>
        </View>
      </LinearGradient>

      {/* ── Content ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* QR Card */}
        <View style={styles.qrCard}>
          <QRCodeDisplay
            uid={uid}
            userName={userName}
            size={220}
            isRtl={isRtl}
            language={language as "en" | "ar"}
          />
        </View>

        {/* Hint */}
        <Text style={styles.shareHint}>{s.shareHint}</Text>

        {/* ── Scan Button ── */}
        <TouchableOpacity
          onPress={() => router.push("/scan-qr")}
          activeOpacity={0.8}
          style={styles.scanBtnOuter}
        >
          <LinearGradient
            colors={["#7C3AED", "#6D28D9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanBtnGradient}
          >
            <Ionicons name="scan-outline" size={22} color="white" />
            <Text style={styles.scanBtnText}>{s.scanQR}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F5FF",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 56 : 44,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  headerRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: "center",
  },
  qrCard: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.08)",
  },
  shareHint: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 28,
    lineHeight: 20,
  },
  scanBtnOuter: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  scanBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 58,
    borderRadius: 18,
  },
  scanBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
