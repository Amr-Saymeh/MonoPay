import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CURRENCY_SYMBOLS } from "../types";
import { EnrichedWalletSlot } from "../hooks/useUserWallets";
import { AppUser, Category, TransactionMode } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  mode: TransactionMode;
  amount: string;
  currency: string;
  recipient: AppUser | null;
  walletSlot: EnrichedWalletSlot | null;
  category: Category | null;
  note: string;
  loading: boolean;
  isRtl?: boolean;
  language?: "en" | "ar";
  onConfirm: () => void;
  onCancel: () => void;
}

// ─── Strings ──────────────────────────────────────────────────────────────────
const S = {
  en: {
    confirmSend: "Confirm Sending Money",
    confirmRequest: "Confirm Money Request",
    to: "To",
    from: "From Wallet",
    amount: "Amount",
    category: "Category",
    note: "Note",
    noNote: "No note",
    confirm: "Confirm",
    cancel: "Cancel",
    processing: "Processing...",
  },
  ar: {
    confirmSend: "تأكيد إرسال المال",
    confirmRequest: "تأكيد طلب المال",
    to: "إلى",
    from: "من محفظة",
    amount: "المبلغ",
    category: "الفئة",
    note: "ملاحظة",
    noNote: "لا توجد ملاحظة",
    confirm: "تأكيد",
    cancel: "إلغاء",
    processing: "جاري المعالجة...",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ConfirmBottomSheet({
  visible,
  mode,
  amount,
  currency,
  recipient,
  walletSlot,
  category,
  note,
  loading,
  isRtl = false,
  language = "en",
  onConfirm,
  onCancel,
}: Props) {
  const s = S[language];
  const bottomSheetRef = useRef<BottomSheet>(null);

  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();
  const parsedAmount = parseFloat(amount) || 0;

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onCancel}
      />
    ),
    [onCancel],
  );

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      enableDynamicSizing
      enablePanDownToClose
      onClose={onCancel}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.container}>
        {/* ── Title ── */}
        <Text style={styles.title}>
          {mode === "send" ? s.confirmSend : s.confirmRequest}
        </Text>

        {/* ── Amount (big) ── */}
        <View style={styles.amountCard}>
          <Ionicons
            name={mode === "send" ? "arrow-up-circle" : "arrow-down-circle"}
            size={28}
            color="#7C3AED"
          />
          <Text style={styles.amountText}>
            {symbol}
            {parsedAmount.toFixed(2)}
          </Text>
          <Text style={styles.currencyLabel}>
            {currency.toUpperCase()}
          </Text>
        </View>

        {/* ── Details ── */}
        <View style={styles.detailsContainer}>
          <Row
            label={s.to}
            value={recipient?.name ?? "—"}
            sub={recipient?.number ? String(recipient.number) : undefined}
            isRtl={isRtl}
            icon="person-outline"
          />
          {mode === "send" && walletSlot && (
            <Row
              label={s.from}
              value={walletSlot.slotName}
              isRtl={isRtl}
              icon="wallet-outline"
            />
          )}
          {category && (
            <Row
              label={s.category}
              value={`${language === "ar" ? category.labelAr : category.label}`}
              isRtl={isRtl}
              icon="grid-outline"
            />
          )}
          <Row
            label={s.note}
            value={note.trim() || s.noNote}
            isRtl={isRtl}
            muted={!note.trim()}
            icon="chatbubble-outline"
          />
        </View>

        {/* ── Buttons ── */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onCancel}
            disabled={loading}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>{s.cancel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onConfirm}
            disabled={loading}
            style={[styles.confirmBtnOuter, { opacity: loading ? 0.6 : 1 }]}
          >
            <LinearGradient
              colors={["#7C3AED", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmBtnGradient}
            >
              {loading ? (
                <Text style={styles.confirmBtnText}>{s.processing}</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.confirmBtnText}>{s.confirm}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function Row({
  label,
  value,
  sub,
  isRtl,
  muted,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  isRtl: boolean;
  muted?: boolean;
  icon?: string;
}) {
  return (
    <View
      style={[
        styles.row,
        { flexDirection: isRtl ? "row-reverse" : "row" },
      ]}
    >
      <View style={[styles.rowLeft, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
        {icon && (
          <View style={styles.rowIcon}>
            <Ionicons name={icon as any} size={16} color="#7C3AED" />
          </View>
        )}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={{ alignItems: isRtl ? "flex-start" : "flex-end", flex: 1 }}>
        <Text
          style={[
            styles.rowValue,
            muted && styles.rowValueMuted,
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: "#DDD6FE",
    width: 40,
  },
  sheetBg: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 20,
  },
  amountCard: {
    backgroundColor: "#F5F3FF",
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: "#EDE9FE",
  },
  amountText: {
    color: "#7C3AED",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 4,
  },
  currencyLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  detailsContainer: {
    gap: 4,
    marginBottom: 24,
  },
  row: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLeft: {
    alignItems: "center",
    gap: 8,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  rowValue: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 14,
  },
  rowValueMuted: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  rowSub: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmBtnOuter: {
    flex: 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  confirmBtnGradient: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
