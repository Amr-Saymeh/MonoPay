import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import { useThemeMode } from "@/src/providers/ThemeModeProvider";

import { CATEGORIES, CURRENCY_SYMBOLS } from "../types";

const STRINGS = {
  en: {
    titleSent: "Money Sent",
    titleReceived: "Money Received",
    from: "From",
    to: "To",
    category: "Category",
    date: "Date",
    time: "Time",
    note: "Note",
  },
  ar: {
    titleSent: "أموال أُرسِلت",
    titleReceived: "أموال استُلِمت",
    from: "من",
    to: "إلى",
    category: "الفئة",
    date: "التاريخ",
    time: "الوقت",
    note: "ملاحظة",
  },
};

export default function TransactionDetailScreen() {
  const { language, isRtl } = useI18n();
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === "dark";
  const s = STRINGS[language as "en" | "ar"] ?? STRINGS.en;
  const params = useLocalSearchParams();

  // All data is passed as URL params from TransactionHistoryScreen — no extra Firebase read needed.
  const type = params.type as "send" | "receive";
  const amount = parseFloat(params.amount as string);
  const currancy = params.currancy as string;
  const category = params.category as string;
  const notes = params.notes as string;
  const transactionDate = parseInt(params.transactionDate as string);
  const otherPartyName = params.otherPartyName as string;

  const isReceive = type === "receive";
  const color = isReceive ? "#22C55E" : "#EF4444";
  const bgColor = isReceive ? "#DCFCE7" : "#FEE2E2";
  const symbol = CURRENCY_SYMBOLS[currancy] ?? currancy.toUpperCase();
  const amountStr = `${isReceive ? "+" : "-"}${amount.toFixed(2)} ${symbol}`;

  const cat = CATEGORIES.find((c) => c.key === category);
  const categoryEmoji = cat?.emoji ?? "📦";
  const categoryLabel = cat
    ? language === "ar" ? cat.labelAr : cat.label
    : category;

  const date = new Date(transactionDate);
  const dateStr = date.toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-US",
    { day: "numeric", month: "long", year: "numeric" },
  );
  const timeStr = date.toLocaleTimeString(
    language === "ar" ? "ar-EG" : "en-US",
    { hour: "2-digit", minute: "2-digit" },
  );

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
          <Text style={styles.headerTitle}>
            {isReceive ? s.titleReceived : s.titleSent}
          </Text>
        </View>

        <View style={styles.amountBlock}>
          <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
            <Ionicons
              name={isReceive ? "arrow-down" : "arrow-up"}
              size={32}
              color={color}
            />
          </View>
          <Text style={styles.amountText}>{amountStr}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Row label={isReceive ? s.from : s.to} value={otherPartyName} isRtl={isRtl} isDark={isDark} />
          <Divider isDark={isDark} />
          <Row label={s.category} value={`${categoryEmoji} ${categoryLabel}`} isRtl={isRtl} isDark={isDark} />
          <Divider isDark={isDark} />
          <Row label={s.date} value={dateStr} isRtl={isRtl} isDark={isDark} />
          <Divider isDark={isDark} />
          <Row label={s.time} value={timeStr} isRtl={isRtl} isDark={isDark} />
          {!!notes && (
            <>
              <Divider isDark={isDark} />
              <Row label={s.note} value={notes} isRtl={isRtl} isDark={isDark} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  value,
  isRtl,
  isDark,
}: {
  label: string;
  value: string;
  isRtl: boolean;
  isDark: boolean;
}) {
  return (
    <View style={[styles.row, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
      <Text style={[styles.rowLabel, isDark && styles.rowLabelDark, { textAlign: isRtl ? "right" : "left" }]}>
        {label}
      </Text>
      <Text style={[styles.rowValue, isDark && styles.rowValueDark, { textAlign: isRtl ? "left" : "right" }]}>
        {value}
      </Text>
    </View>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <View style={[styles.divider, isDark && styles.dividerDark]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F5FF",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 44,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    alignItems: "center",
    gap: 24,
  },
  headerRow: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  amountBlock: {
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  amountText: {
    fontSize: 34,
    fontWeight: "800",
    color: "white",
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    paddingHorizontal: 20,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  row: {
    paddingVertical: 18,
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(124,58,237,0.06)",
  },
  rootDark: { backgroundColor: "#0E1118" },
  cardDark: { backgroundColor: "#1C1F2A" },
  rowLabelDark: { color: "rgba(255,255,255,0.5)" },
  rowValueDark: { color: "#E0E0E0" },
  dividerDark: { backgroundColor: "rgba(255,255,255,0.07)" },
});
