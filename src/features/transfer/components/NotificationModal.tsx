import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useThemeMode } from "@/src/providers/ThemeModeProvider";

interface Props {
  visible: boolean;
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
  language?: "en" | "ar";
}

export function NotificationModal({
  visible,
  type,
  message,
  onDismiss,
  language = "en",
}: Props) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const isSuccess = type === "success";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            isDark && styles.cardDark,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <Ionicons
            name={isSuccess ? "checkmark-circle" : "alert-circle"}
            size={72}
            color={isSuccess ? "#22C55E" : "#EF4444"}
            style={styles.icon}
          />

          <Text
            style={[
              styles.message,
              isDark && styles.messageDark,
              { textAlign: language === "ar" ? "right" : "center" },
            ]}
          >
            {message}
          </Text>

          <TouchableOpacity onPress={onDismiss} activeOpacity={0.85} style={styles.btnOuter}>
            <LinearGradient
              colors={["#7C3AED", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              <Text style={styles.btnText}>
                {language === "ar" ? "حسناً" : "OK"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  cardDark: { backgroundColor: "#1C1F2A" },
  icon: { marginBottom: 16 },
  message: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: 28,
    textAlign: "center",
  },
  messageDark: { color: "#E0E0E0" },
  btnOuter: { width: "100%", borderRadius: 16, overflow: "hidden" },
  btn: { height: 52, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16, letterSpacing: 0.3 },
});
