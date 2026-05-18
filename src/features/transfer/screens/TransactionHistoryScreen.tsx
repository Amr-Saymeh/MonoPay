import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/src/providers/AuthProvider";
import { useThemeMode } from "@/src/providers/ThemeModeProvider";

import { TransactionCard } from "../components/TransactionCard";
import { useTransactionHistory } from "../hooks/useTransactionHistory";

const STRINGS = {
  en: {
    title: "My Transactions",
    empty: "No transactions yet",
    emptySub: "Your sent and received transfers will appear here.",
  },
  ar: {
    title: "معاملاتي",
    empty: "لا توجد معاملات بعد",
    emptySub: "ستظهر هنا تحويلاتك المرسلة والمستلمة.",
  },
};

export default function TransactionHistoryScreen() {
  const { user } = useAuth();
  const { language, isRtl } = useI18n();
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === "dark";
  const s = STRINGS[language as "en" | "ar"] ?? STRINGS.en;
  // useTransactionHistory handles fetching, enriching names, and sorting.
  const { transactions, loading } = useTransactionHistory(user?.uid ?? "");

  return (
    <View style={[styles.root, isDark && styles.rootDark]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#7C3AED", "#6D28D9", "#5B21B6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.headerRow, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
          <Ionicons
            name={isRtl ? "arrow-forward" : "arrow-back"}
            size={24}
            color="white"
            onPress={() => router.back()}
          />
          <Text style={styles.headerTitle}>{s.title}</Text>
        </View>
      </LinearGradient>

      {/* Three states only: loading, empty, or the actual transaction list. */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="receipt-outline"
            size={64}
            color={isDark ? "rgba(255,255,255,0.2)" : "#D1D5DB"}
          />
          <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>{s.empty}</Text>
          <Text style={[styles.emptySub, isDark && styles.emptySubDark]}>{s.emptySub}</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              language={language as "en" | "ar"}
              isRtl={isRtl}
              isDark={isDark}
            />
          )}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, isDark && styles.separatorDark]} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F5FF",
  },
  header: {
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
    gap: 12,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(124,58,237,0.06)",
    marginVertical: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  emptySub: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  // ── Dark variants ──────────────────────────────────────────────────────────
  rootDark: { backgroundColor: "#0E1118" },
  emptyTitleDark: { color: "#E0E0E0" },
  emptySubDark: { color: "rgba(255,255,255,0.35)" },
  separatorDark: { backgroundColor: "rgba(255,255,255,0.07)" },
});
