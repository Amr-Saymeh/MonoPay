import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useI18n } from "@/hooks/use-i18n";
import { AmountInput } from "@/src/features/transfer/components/AmountInput";
import { CategoryPicker } from "@/src/features/transfer/components/CategoryPicker";
import { ConfirmBottomSheet } from "@/src/features/transfer/components/ConfirmBottomSheet";
import { NotificationModal } from "@/src/features/transfer/components/NotificationModal";
import { WalletPicker } from "@/src/features/transfer/components/WalletPicker";
import { useSendMoney } from "@/src/features/transfer/hooks/useSendMoney";
import {
  EnrichedWalletSlot,
  useUserWallets,
} from "@/src/features/transfer/hooks/useUserWallets";
import {
  AppUser,
  Category,
  Currency,
  CURRENCY_SYMBOLS,
} from "@/src/features/transfer/types/index";
import { useAuth } from "@/src/providers/AuthProvider";

// ─── Strings ─────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    title: "Send via QR",
    to: "To",
    myWallet: "My Wallet",
    selectWallet: "Select wallet to send from",
    amount: "Amount",
    category: "Category",
    selectCategory: "Select category",
    noteOptional: "Note (Optional)",
    notePlaceholder: "Add a note...",
    sendBtn: "Send",
    mainWalletNote: "Funds go to recipient's main wallet automatically",
    successSend: "Money sent successfully!",
    fillRequired: "Please select a wallet and enter an amount.",
    errors: {
      INSUFFICIENT_FUNDS: "Insufficient funds in your wallet.",
      WALLET_INACTIVE: "Your wallet is inactive.",
      SENDER_IS_RECEIVER: "You cannot send money to yourself.",
      MAIN_WALLET_NOT_FOUND: "Recipient has no active wallet.",
      USER_NOT_FOUND: "User not found.",
      INVALID_AMOUNT: "Please enter a valid amount.",
      UNKNOWN: "Something went wrong. Please try again.",
    },
  },
  ar: {
    title: "إرسال عبر QR",
    to: "إلى",
    myWallet: "محفظتي",
    selectWallet: "اختر المحفظة للإرسال منها",
    amount: "المبلغ",
    category: "الفئة",
    selectCategory: "اختر الفئة",
    noteOptional: "ملاحظة (اختياري)",
    notePlaceholder: "أضف ملاحظة...",
    sendBtn: "إرسال",
    mainWalletNote: "سيتم الإرسال للمحفظة الرئيسية للمستلم تلقائياً",
    successSend: "تم الإرسال بنجاح!",
    fillRequired: "الرجاء اختيار محفظة وإدخال المبلغ.",
    errors: {
      INSUFFICIENT_FUNDS: "الرصيد غير كافٍ في محفظتك.",
      WALLET_INACTIVE: "محفظتك غير نشطة.",
      SENDER_IS_RECEIVER: "لا يمكنك إرسال المال لنفسك.",
      MAIN_WALLET_NOT_FOUND: "المستلم ليس لديه محفظة نشطة.",
      USER_NOT_FOUND: "المستخدم غير موجود.",
      INVALID_AMOUNT: "الرجاء إدخال مبلغ صحيح.",
      UNKNOWN: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
    },
  },
};

const MAX_AMOUNT: Record<string, number> = {
  nis: 5000,
  jod: 1000,
  usd: 1500,
};

const MAX_NOTE_LENGTH = 150;

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function QRSendScreen() {
  const router = useRouter();
  const { uid, name, number } = useLocalSearchParams<{
    uid: string;
    name: string;
    number: string;
  }>();
  const { user } = useAuth();
  const CURRENT_USER_UID = user?.uid ?? "";
  const { language, isRtl } = useI18n();
  const s = STRINGS[language as "en" | "ar"] ?? STRINGS.en;

  const recipient: AppUser = {
    uid: uid ?? "",
    name: name ?? "",
    number: number ?? "",
    type: 1,
  };

  // ── Form state ────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("nis");
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState("");
  const [myWalletSlot, setMyWalletSlot] = useState<EnrichedWalletSlot | null>(
    null,
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Data & Actions ────────────────────────────────────────────────────────
  const {
    execute: executeSend,
    loading: sendLoading,
    reset: resetSend,
  } = useSendMoney();
  const { wallets: myWallets, loading: walletsLoading } =
    useUserWallets(CURRENT_USER_UID);

  // ── Amount animation ──────────────────────────────────────────────────────
  const amountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (myWalletSlot) {
      Animated.spring(amountAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      amountAnim.setValue(0);
    }
  }, [myWalletSlot]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setAmount("");
    setCategory(null);
    setNote("");
    setMyWalletSlot(null);
    resetSend();
  }, [resetSend]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = (): string | null => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return s.errors.INVALID_AMOUNT;
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return s.errors.INVALID_AMOUNT;
    if (parsed < 1) return s.errors.INVALID_AMOUNT;
    const max = MAX_AMOUNT[currency] ?? 5000;
    if (parsed > max) return `Maximum amount is ${max} ${currency.toUpperCase()}`;
    if (!myWalletSlot) return s.fillRequired;
    if (note.length > MAX_NOTE_LENGTH)
      return `Note cannot exceed ${MAX_NOTE_LENGTH} characters`;
    return null;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const err = validateForm();
    if (err) {
      setNotif({ type: "error", msg: err });
      return;
    }
    setShowConfirm(true);
  };

  // ── Confirm from bottom sheet ─────────────────────────────────────────────
  const handleConfirm = async () => {
    const parsed = parseFloat(amount);
    const error = await executeSend({
      senderUid: CURRENT_USER_UID,
      fromSlotKey: myWalletSlot!.slotKey,
      receiverUid: recipient.uid,
      amount: parsed,
      currency,
      category: category?.key ?? "other",
      note,
    });

    if (!error) {
      setShowConfirm(false);
      setNotif({ type: "success", msg: s.successSend });
    } else {
      setNotif({ type: "error", msg: s.errors[error] ?? s.errors.UNKNOWN });
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            <Text style={[styles.headerTitle, { flex: 1, marginLeft: isRtl ? 0 : 10, marginRight: isRtl ? 10 : 0 }]}>{s.title}</Text>
          </View>

          {/* ── Recipient card (inside header) ── */}
          <View
            style={[
              styles.recipientCard,
              { flexDirection: isRtl ? "row-reverse" : "row" },
            ]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(name ?? "?").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.recipientName,
                  { textAlign: isRtl ? "right" : "left" },
                ]}
              >
                {name}
              </Text>
              {number ? (
                <Text
                  style={[
                    styles.recipientNumber,
                    { textAlign: isRtl ? "right" : "left" },
                  ]}
                >
                  {number}
                </Text>
              ) : null}
            </View>
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color="#7C3AED" />
            </View>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Info note */}
            <View
              style={[
                styles.infoBar,
                { flexDirection: isRtl ? "row-reverse" : "row" },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={18}
                color="#7C3AED"
              />
              <Text
                style={[
                  styles.infoText,
                  { textAlign: isRtl ? "right" : "left" },
                ]}
              >
                {s.mainWalletNote}
              </Text>
            </View>

            {/* ── My Wallet ── */}
            <View style={styles.section}>
              <Label text={s.myWallet} isRtl={isRtl} />
              <WalletPicker
                label={s.myWallet}
                placeholder={s.selectWallet}
                selectedSlot={myWalletSlot}
                wallets={myWallets}
                loading={walletsLoading}
                onSelect={(slot) => {
                  setMyWalletSlot(slot);
                  setCurrency(
                    Object.keys(slot.wallet?.currancies ?? {})[0] ?? "nis",
                  );
                }}
                isRtl={isRtl}
              />
            </View>

            {/* ── Amount (appears after wallet is selected) ── */}
            {myWalletSlot && (
              <Animated.View
                style={[
                  styles.section,
                  {
                    opacity: amountAnim,
                    transform: [
                      {
                        translateY: amountAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Label text={s.amount} isRtl={isRtl} />
                <AmountInput
                  amount={amount}
                  currency={currency}
                  availableCurrencies={
                    myWalletSlot.wallet?.currancies
                      ? Object.keys(myWalletSlot.wallet.currancies)
                      : ["nis", "usd", "jod"]
                  }
                  onAmountChange={setAmount}
                  onCurrencyChange={setCurrency}
                  isRtl={isRtl}
                />
              </Animated.View>
            )}

            {/* ── Category ── */}
            <View style={styles.section}>
              <Label text={s.category} isRtl={isRtl} />
              <CategoryPicker
                label={s.selectCategory}
                selected={category}
                onSelect={setCategory}
                isRtl={isRtl}
                language={language}
              />
            </View>

            {/* ── Note ── */}
            <View style={styles.section}>
              <Label text={s.noteOptional} isRtl={isRtl} />
              <View style={styles.noteBox}>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder={s.notePlaceholder}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  textAlign={isRtl ? "right" : "left"}
                  style={styles.noteInput}
                />
                <Text
                  style={[
                    styles.noteCounter,
                    {
                      color:
                        note.length > MAX_NOTE_LENGTH ? "#EF4444" : "#9CA3AF",
                    },
                  ]}
                >
                  {note.length}/{MAX_NOTE_LENGTH}
                </Text>
              </View>
            </View>

            {/* ── Submit ── */}
            <SendButton
              label={`${s.sendBtn} ${symbol}${parsedAmount.toFixed(2)}`}
              onPress={handleSubmit}
              loading={sendLoading}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ── Confirm bottom sheet ── */}
        <ConfirmBottomSheet
          visible={showConfirm}
          mode="send"
          amount={amount}
          currency={currency}
          recipient={recipient}
          walletSlot={myWalletSlot}
          category={category}
          note={note}
          loading={sendLoading}
          isRtl={isRtl}
          language={language as "en" | "ar"}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      </View>

      <NotificationModal
        visible={!!notif}
        type={notif?.type ?? "success"}
        message={notif?.msg ?? ""}
        onDismiss={() => {
          const wasSuccess = notif?.type === "success";
          setNotif(null);
          if (wasSuccess) router.back();
        }}
        language={language as "en" | "ar"}
      />
    </GestureHandlerRootView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ text, isRtl }: { text: string; isRtl: boolean }) {
  return (
    <Text
      style={[
        styles.label,
        {
          textAlign: isRtl ? "right" : "left",
          marginLeft: isRtl ? 0 : 4,
          marginRight: isRtl ? 4 : 0,
        },
      ]}
    >
      {text}
    </Text>
  );
}

function SendButton({
  label,
  onPress,
  loading,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 8 }}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }).start()
        }
        disabled={loading}
        style={{ opacity: loading ? 0.6 : 1, borderRadius: 18, overflow: "hidden" }}
      >
        <LinearGradient
          colors={["#7C3AED", "#6D28D9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sendBtnGradient}
        >
          <Ionicons name="send" size={18} color="white" />
          <Text style={styles.sendBtnText}>
            {loading ? "..." : label}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
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
    paddingBottom: 24,
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
    marginBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  recipientCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  recipientName: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  recipientNumber: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  infoBar: {
    backgroundColor: "#EDE9FE",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  infoText: {
    color: "#6D28D9",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  noteBox: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 90,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.06)",
  },
  noteInput: {
    color: "#1F2937",
    fontSize: 15,
    lineHeight: 22,
  },
  noteCounter: {
    textAlign: "right",
    fontSize: 11,
    marginTop: 6,
  },
  sendBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 60,
    borderRadius: 18,
  },
  sendBtnText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
    letterSpacing: 0.3,
  },
});
