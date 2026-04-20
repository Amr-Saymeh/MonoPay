import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/src/providers/AuthProvider";
import { AmountInput } from "../components/AmountInput";
import { CategoryPicker } from "../components/CategoryPicker";
import { ConfirmBottomSheet } from "../components/ConfirmBottomSheet";
import { NotificationModal } from "../components/NotificationModal";
import {
  SegmentedControl,
  SegmentOption,
} from "../components/SegmentedControl";
import { UserPicker } from "../components/UserPicker";
import { WalletPicker } from "../components/WalletPicker";
import { useRequestMoney } from "../hooks/useRequestMoney";
import { useSendMoney } from "../hooks/useSendMoney";
import { EnrichedWalletSlot, useUserWallets } from "../hooks/useUserWallets";
import {
  AppUser,
  Category,
  Currency,
  CURRENCY_SYMBOLS,
  TransactionMode,
} from "../types/index";

// ─── Strings ─────────────────────────────────────────────────────────────────
const TX_STRINGS = {
  en: {
    title: "Make a Transaction",
    sendPageTitle: "Send Money",
    requestPageTitle: "Request Money",
    viewRequests: "View Requests",
    sendMoney: "Send",
    receiveMoney: "Request",
    amount: "Amount",
    recipient: "Recipient",
    selectRecipient: "Who are you sending to?",
    payer: "Payer",
    selectPayer: "Who should pay you?",
    category: "Category",
    selectCategory: "Select category",
    noteOptional: "Note (Optional)",
    notePlaceholder: "Add a note...",
    sendBtn: "Send",
    requestBtn: "Request",
    myWallet: "My Wallet",
    selectWallet: "Select wallet to send from",
    mainWalletNote: "Funds go to recipient's main wallet automatically",
    requestNote: "Payer will receive a request to approve",
    successSend: "Money sent successfully!",
    successRequest: "Request sent! The payer will be notified.",
    fillRequired: "Please select a recipient and enter an amount.",
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
    title: "إجراء معاملة",
    sendPageTitle: "إرسال المال",
    requestPageTitle: "طلب المال",
    viewRequests: "عرض الطلبات",
    sendMoney: "إرسال",
    receiveMoney: "طلب",
    amount: "المبلغ",
    recipient: "المستلم",
    selectRecipient: "لمن تريد الإرسال؟",
    payer: "الدافع",
    selectPayer: "من سيدفع لك؟",
    category: "الفئة",
    selectCategory: "اختر الفئة",
    noteOptional: "ملاحظة (اختياري)",
    notePlaceholder: "أضف ملاحظة...",
    sendBtn: "إرسال",
    requestBtn: "طلب",
    myWallet: "محفظتي",
    selectWallet: "اختر المحفظة للإرسال منها",
    mainWalletNote: "سيتم الإرسال للمحفظة الرئيسية للمستلم تلقائياً",
    requestNote: "سيصل الطلب للدافع للموافقة عليه",
    successSend: "تم الإرسال بنجاح!",
    successRequest: "تم إرسال الطلب! سيتم إبلاغ الدافع.",
    fillRequired: "الرجاء اختيار مستلم وإدخال المبلغ.",
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface MakeTransactionScreenProps {
  fixedMode?: TransactionMode;
  showRequestsButton?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MakeTransactionScreen({
  fixedMode,
  showRequestsButton,
}: MakeTransactionScreenProps = {}) {
  const { user } = useAuth();
  const CURRENT_USER_UID = user?.uid ?? "";

  const amountAnim = useRef(new Animated.Value(0)).current;

  const { language, isRtl } = useI18n();
  const s = TX_STRINGS[language as "en" | "ar"] ?? TX_STRINGS.en;

  // ── Mode ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<TransactionMode>(fixedMode ?? "send");

  // ── Form state ────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("nis");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
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
  const {
    execute: executeRequest,
    loading: requestLoading,
    reset: resetRequest,
  } = useRequestMoney();
  const { wallets: myWallets, loading: walletsLoading } =
    useUserWallets(CURRENT_USER_UID);
  const isLoading = sendLoading || requestLoading;

  // ── Mode animation ────────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleModeChange = (newMode: TransactionMode) => {
    if (newMode === mode) return;

    const hasData = amount || selectedUser || note || category || myWalletSlot;

    if (hasData) {
      Alert.alert(
        language === "ar" ? "تغيير الوضع" : "Switch Mode",
        language === "ar"
          ? "سيتم مسح البيانات المدخلة. هل تريد المتابعة؟"
          : "Entered data will be cleared. Continue?",
        [
          {
            text: language === "ar" ? "إلغاء" : "Cancel",
            style: "cancel",
          },
          {
            text: language === "ar" ? "متابعة" : "Continue",
            onPress: () => switchMode(newMode),
          },
        ],
      );
    } else {
      switchMode(newMode);
    }
  };

  const switchMode = (newMode: TransactionMode) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setMode(newMode);
    resetForm();
  };

  useEffect(() => {
    const shouldShow = mode === "receive" || !!myWalletSlot;

    if (shouldShow) {
      Animated.spring(amountAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      amountAnim.setValue(0);
    }
  }, [mode, myWalletSlot]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setAmount("");
    setSelectedUser(null);
    setCategory(null);
    setNote("");
    resetSend();
    resetRequest();
    setMyWalletSlot(null);
  }, [resetSend, resetRequest]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = (): string | null => {
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) return s.errors.INVALID_AMOUNT;
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return s.errors.INVALID_AMOUNT;
    if (parsedAmount < 1) return s.errors.INVALID_AMOUNT;

    const max = MAX_AMOUNT[currency] ?? 5000;
    if (parsedAmount > max)
      return `Maximum amount is ${max} ${currency.toUpperCase()}`;

    if (mode === "send" && !myWalletSlot) return s.fillRequired;
    if (!selectedUser) return s.fillRequired;

    if (note.length > MAX_NOTE_LENGTH)
      return `Note cannot exceed ${MAX_NOTE_LENGTH} characters`;

    return null;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setNotif({ type: "error", msg: validationError });
      return;
    }
    setShowConfirm(true);
  };

  // ── Confirm action from bottom sheet ─────────────────────────────────────
  const handleConfirm = async () => {
    const parsedAmount = parseFloat(amount);

    const error =
      mode === "send"
        ? await executeSend({
            senderUid: CURRENT_USER_UID,
            fromSlotKey: myWalletSlot!.slotKey,
            receiverUid: selectedUser!.uid,
            amount: parsedAmount,
            currency,
            category: category?.key ?? "other",
            note,
          })
        : await executeRequest({
            requesterUid: CURRENT_USER_UID,
            payerUid: selectedUser!.uid,
            amount: parsedAmount,
            currency,
            category: category?.key ?? "other",
            note,
          });

    if (!error) {
      setShowConfirm(false);
      setNotif({ type: "success", msg: mode === "send" ? s.successSend : s.successRequest });
    } else {
      setNotif({ type: "error", msg: s.errors[error] ?? s.errors.UNKNOWN });
    }
  };

  // ── Button label ──────────────────────────────────────────────────────────
  const parsedAmount = parseFloat(amount) || 0;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();
  const submitLabel = `${mode === "send" ? s.sendBtn : s.requestBtn} ${symbol}${parsedAmount.toFixed(2)}`;

  const segmentOptions: SegmentOption<TransactionMode>[] = [
    { value: "send", label: s.sendMoney, icon: "➤" },
    { value: "receive", label: s.receiveMoney, icon: "📥" },
  ];

  const pageTitle =
    fixedMode === "send"
      ? s.sendPageTitle
      : fixedMode === "receive"
        ? s.requestPageTitle
        : s.title;

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
            {fixedMode && (
              <Ionicons
                name={isRtl ? "arrow-forward" : "arrow-back"}
                size={24}
                color="white"
                onPress={() => router.back()}
              />
            )}
            <Text
              style={[
                styles.headerTitle,
                fixedMode
                  ? {
                      flex: 1,
                      marginLeft: isRtl ? 0 : 10,
                      marginRight: isRtl ? 10 : 0,
                    }
                  : undefined,
              ]}
            >
              {pageTitle}
            </Text>
            {showRequestsButton && (
              <TouchableOpacity
                style={[
                  styles.headerBtn,
                  { flexDirection: isRtl ? "row-reverse" : "row" },
                ]}
                onPress={() => router.push("/requests")}
                activeOpacity={0.7}
              >
                <Ionicons name="list-outline" size={15} color="white" />
                <Text style={styles.headerBtnText}>{s.viewRequests}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Segmented Control inside header (hidden when mode is fixed) ── */}
          {!fixedMode && (
            <View style={styles.segmentWrapHeader}>
              <SegmentedControl
                options={segmentOptions}
                value={mode}
                onChange={handleModeChange}
                isRtl={isRtl}
              />
            </View>
          )}
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
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* ── My Wallet (Send only) ── */}
              {mode === "send" && (
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
              )}

              {/* ── Amount ── */}
              {(mode === "receive" || (mode === "send" && myWalletSlot)) && (
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
                      mode === "send" && myWalletSlot?.wallet?.currancies
                        ? Object.keys(myWalletSlot.wallet.currancies)
                        : ["nis", "usd", "jod"]
                    }
                    onAmountChange={setAmount}
                    onCurrencyChange={setCurrency}
                    isRtl={isRtl}
                  />
                </Animated.View>
              )}

              {/* ── Recipient / Payer ── */}
              <View style={styles.section}>
                <Label
                  text={mode === "send" ? s.recipient : s.payer}
                  isRtl={isRtl}
                />
                <UserPicker
                  label={mode === "send" ? s.recipient : s.payer}
                  placeholder={
                    mode === "send" ? s.selectRecipient : s.selectPayer
                  }
                  selectedUser={selectedUser}
                  currentUserUid={CURRENT_USER_UID}
                  onSelect={setSelectedUser}
                  isRtl={isRtl}
                  language={language as "en" | "ar"}
                />
                {/* Info note */}
                <View
                  style={[
                    styles.infoBar,
                    { flexDirection: isRtl ? "row-reverse" : "row" },
                  ]}
                >
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#7C3AED"
                  />
                  <Text
                    style={[
                      styles.infoText,
                      { textAlign: isRtl ? "right" : "left" },
                    ]}
                  >
                    {mode === "send" ? s.mainWalletNote : s.requestNote}
                  </Text>
                </View>
              </View>

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

              {/* ── Submit Button ── */}
              <SubmitButton
                label={submitLabel}
                onPress={handleSubmit}
                loading={isLoading}
                mode={mode}
              />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        <ConfirmBottomSheet
          visible={showConfirm}
          mode={mode}
          amount={amount}
          currency={currency}
          recipient={selectedUser}
          walletSlot={myWalletSlot}
          category={category}
          note={note}
          loading={isLoading}
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
          if (wasSuccess) resetForm();
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

function SubmitButton({
  label,
  onPress,
  loading,
  mode,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
  mode: TransactionMode;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const gradientColors: [string, string] =
    mode === "send" ? ["#7C3AED", "#6D28D9"] : ["#5B21B6", "#4C1D95"];

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
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitBtnGradient}
        >
          <Ionicons
            name={mode === "send" ? "send" : "arrow-down-circle"}
            size={20}
            color="white"
          />
          <Text style={styles.submitBtnText}>
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
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  segmentWrapHeader: {
    marginTop: 16,
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
  infoBar: {
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  infoText: {
    color: "#7C3AED",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
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
  headerBtn: {
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  headerBtnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  submitBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 60,
    borderRadius: 18,
  },
  submitBtnText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
    letterSpacing: 0.3,
  },
});
