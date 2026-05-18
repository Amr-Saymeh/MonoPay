import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { EnrichedTransaction } from "../hooks/useTransactionHistory";
import { CATEGORIES, CURRENCY_SYMBOLS } from "../types";

interface Props {
  transaction: EnrichedTransaction;
  language: "en" | "ar";
  isRtl: boolean;
  isDark?: boolean;
}

export function TransactionCard({ transaction, language, isRtl, isDark = false }: Props) {
  // Color and label depend solely on whether money came in or went out.
  const isReceive = transaction.type === "receive";
  const color = isReceive ? "#22C55E" : "#EF4444";
  const bgColor = isReceive ? "#DCFCE7" : "#FEE2E2";
  const icon = isReceive ? "arrow-down" : "arrow-up";
  const label =
    isReceive
      ? language === "ar" ? "أموال استُلِمت" : "Money Received"
      : language === "ar" ? "أموال أُرسِلت" : "Money Sent";

  const symbol = CURRENCY_SYMBOLS[transaction.currancy] ?? transaction.currancy.toUpperCase();
  const amountStr = `${isReceive ? "+" : "-"}${transaction.amount.toFixed(2)} ${symbol}`;

  const cat = CATEGORIES.find((c) => c.key === transaction.category);
  const categoryEmoji = cat?.emoji ?? "📦";
  const categoryLabel = cat
    ? language === "ar" ? cat.labelAr : cat.label
    : transaction.category;

  const date = new Date(transaction["transaction date"]);
  const dateStr = date.toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-US",
    { day: "numeric", month: "short", year: "numeric" },
  );

  // open the detail screen and forward everything it needs through route params.
  const handlePress = () => {
    router.push({
      pathname: "/transaction-detail",
      params: {
        id: transaction.id,
        type: transaction.type,
        amount: String(transaction.amount),
        currancy: transaction.currancy,
        category: transaction.category,
        notes: transaction.notes ?? "",
        transactionDate: String(transaction["transaction date"]),
        otherPartyName: transaction.otherPartyName,
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.card, { flexDirection: isRtl ? "row-reverse" : "row" }]}
    >
      <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <View style={[styles.info, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
        <Text style={[styles.sub, isDark && styles.subDark]}>
          {categoryEmoji} {categoryLabel} · {dateStr}
        </Text>
        {!!transaction.otherPartyName && (
          <Text style={[styles.name, isDark && styles.nameDark]}>{transaction.otherPartyName}</Text>
        )}
      </View>

      <Text style={[styles.amount, { color }]}>{amountStr}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  sub: {
    fontSize: 12,
    color: "#6B7280",
  },
  name: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
  labelDark: { color: "#E0E0E0" },
  subDark: { color: "rgba(255,255,255,0.5)" },
  nameDark: { color: "rgba(255,255,255,0.35)" },
});
