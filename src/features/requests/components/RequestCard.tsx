import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CURRENCY_SYMBOLS } from "@/src/features/transfer/types";
import { MoneyRequestItem, RequestStatus } from "../hooks/useMoneyRequests";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; labelAr: string; color: string; bg: string; icon: string }
> = {
  pending: {
    label: "Pending",
    labelAr: "انتظار",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: "time-outline",
  },
  approved: {
    label: "Approved",
    labelAr: "مكتمل",
    color: "#059669",
    bg: "#D1FAE5",
    icon: "checkmark-circle-outline",
  },
  rejected: {
    label: "Rejected",
    labelAr: "مرفوض",
    color: "#DC2626",
    bg: "#FEE2E2",
    icon: "close-circle-outline",
  },
  cancelled: {
    label: "Cancelled",
    labelAr: "ملغي",
    color: "#6B7280",
    bg: "#F3F4F6",
    icon: "ban-outline",
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  food: "fast-food-outline",
  transport: "car-outline",
  shopping: "bag-outline",
  bills: "document-text-outline",
  health: "medkit-outline",
  education: "school-outline",
  entertainment: "film-outline",
  family: "people-outline",
  savings: "wallet-outline",
  other: "cash-outline",
};

interface Props {
  item: MoneyRequestItem;
  mode: "received" | "sent";
  language: "en" | "ar";
  isRtl: boolean;
  onApprove?: (item: MoneyRequestItem) => void;
  onReject?: (item: MoneyRequestItem) => void;
  onCancel?: (item: MoneyRequestItem) => void;
}

export function RequestCard({
  item,
  mode,
  language,
  isRtl,
  onApprove,
  onReject,
  onCancel,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const status = STATUS_CONFIG[item.status];
  const symbol = CURRENCY_SYMBOLS[item.currancy] ?? item.currancy.toUpperCase();
  const categoryIcon = CATEGORY_ICONS[item.category] ?? "cash-outline";
  const initials = (item.otherPartyName ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const date = new Date(item.createdAt).toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );

  const avatarColors = ["#7C3AED", "#0EA5E9", "#059669", "#D97706", "#DC2626"];
  const avatarColor =
    avatarColors[initials.charCodeAt(0) % avatarColors.length];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={styles.card}>
        {/* ── Status accent ── */}
        <View style={[styles.accent, { backgroundColor: status.color }]} />

        <View style={styles.cardContent}>
          {/* ── Header row ── */}
          <View
            style={[
              styles.headerRow,
              { flexDirection: isRtl ? "row-reverse" : "row" },
            ]}
          >
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            {/* Name + number */}
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.nameText,
                  { textAlign: isRtl ? "right" : "left" },
                ]}
              >
                {item.otherPartyName ?? "—"}
              </Text>
              {item.otherPartyNumber && (
                <Text
                  style={[
                    styles.numberText,
                    { textAlign: isRtl ? "right" : "left" },
                  ]}
                >
                  {item.otherPartyNumber}
                </Text>
              )}
            </View>

            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons
                name={status.icon as any}
                size={12}
                color={status.color}
              />
              <Text style={[styles.statusText, { color: status.color }]}>
                {language === "ar" ? status.labelAr : status.label}
              </Text>
            </View>
          </View>

          {/* ── Amount ── */}
          <View
            style={[
              styles.amountRow,
              { flexDirection: isRtl ? "row-reverse" : "row" },
            ]}
          >
            <Text style={styles.amountText}>
              {symbol}
              {item.amount.toFixed(2)}
            </Text>
            <Text style={styles.currencyLabel}>
              {item.currancy.toUpperCase()}
            </Text>
            <View style={{ flex: 1 }} />
            <View style={styles.categoryIcon}>
              <Ionicons
                name={categoryIcon as any}
                size={18}
                color="#7C3AED"
              />
            </View>
          </View>

          {/* ── Note ── */}
          {!!item.note && (
            <Text
              style={[
                styles.noteText,
                { textAlign: isRtl ? "right" : "left" },
              ]}
            >
              {`"${item.note}"`}
            </Text>
          )}

          {/* ── Date ── */}
          <View
            style={[
              styles.dateRow,
              { flexDirection: isRtl ? "row-reverse" : "row" },
            ]}
          >
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text style={styles.dateText}>{date}</Text>
          </View>

          {/* ── Action Buttons ── */}
          {item.status === "pending" && mode === "received" && (
            <View
              style={[
                styles.actionRow,
                { flexDirection: isRtl ? "row-reverse" : "row" },
              ]}
            >
              <TouchableOpacity
                onPress={() => onReject?.(item)}
                style={styles.rejectBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={16} color="#DC2626" />
                <Text style={styles.rejectBtnText}>
                  {language === "ar" ? "رفض" : "Reject"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onApprove?.(item)}
                activeOpacity={0.7}
                style={styles.approveBtnOuter}
              >
                <LinearGradient
                  colors={["#7C3AED", "#6D28D9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.approveBtnGradient}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={styles.approveBtnText}>
                    {language === "ar" ? "موافقة" : "Approve"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {item.status === "pending" && mode === "sent" && (
            <TouchableOpacity
              onPress={() => onCancel?.(item)}
              style={styles.cancelBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.cancelBtnText}>
                {language === "ar" ? "إلغاء الطلب" : "Cancel Request"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: "hidden",
  },
  accent: {
    height: 3,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginLeft: 0,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  nameText: {
    color: "#1F2937",
    fontWeight: "700",
    fontSize: 15,
  },
  numberText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  amountRow: {
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  amountText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  currencyLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  noteText: {
    color: "#6B7280",
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 10,
    lineHeight: 20,
  },
  dateRow: {
    alignItems: "center",
    gap: 4,
    marginBottom: 0,
  },
  dateText: {
    color: "#9CA3AF",
    fontSize: 11,
  },
  actionRow: {
    gap: 8,
    marginTop: 14,
  },
  rejectBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  rejectBtnText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
  },
  approveBtnOuter: {
    flex: 2,
    borderRadius: 14,
    overflow: "hidden",
  },
  approveBtnGradient: {
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  approveBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelBtn: {
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 14,
  },
  cancelBtnText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 14,
  },
});
