import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import { useAuth } from "@/src/providers/AuthProvider";
import { useThemeMode } from "@/src/providers/ThemeModeProvider";
import { AmountInput } from "../components/AmountInput";
import { CategoryPicker } from "../components/CategoryPicker";
import { ConfirmBottomSheet } from "../components/ConfirmBottomSheet";
import { NotificationModal } from "../components/NotificationModal";
import { UserPicker } from "../components/UserPicker";
import { WalletPicker } from "../components/WalletPicker";
import { useSendMoney } from "../hooks/useSendMoney";
import { EnrichedWalletSlot, useUserWallets } from "../hooks/useUserWallets";
import { AppUser, Category, Currency, CURRENCY_SYMBOLS } from "../types";

const STRINGS = {
  en: {
    title: "Send Money",
    amount: "Amount",
    recipient: "Recipient",
    selectRecipient: "Who are you sending to?",
    category: "Category",
    selectCategory: "Select category",
    noteOptional: "Note (Optional)",
    notePlaceholder: "Add a note...",
    sendBtn: "Send",
    myWallet: "My Wallet",
    selectWallet: "Select wallet to send from",
    mainWalletNote: "Funds go to recipient's main wallet automatically",
    successSend: "Money sent successfully!",
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
    title: "إرسال المال",
    amount: "المبلغ",
    recipient: "المستلم",
    selectRecipient: "لمن تريد الإرسال؟",
    category: "الفئة",
    selectCategory: "اختر الفئة",
    noteOptional: "ملاحظة (اختياري)",
    notePlaceholder: "أضف ملاحظة...",
    sendBtn: "إرسال",
    myWallet: "محفظتي",
    selectWallet: "اختر المحفظة للإرسال منها",
    mainWalletNote: "سيتم الإرسال للمحفظة الرئيسية للمستلم تلقائياً",
    successSend: "تم الإرسال بنجاح!",
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

export default function SendMoneyScreen() {
  const { user } = useAuth();
  const currentUserUid = user?.uid ?? "";
  const { language, isRtl } = useI18n();
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === "dark";
  const s = STRINGS[language as "en" | "ar"] ?? STRINGS.en;

  const amountAnim = useRef(new Animated.Value(0)).current;

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("nis");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState("");
  const [myWalletSlot, setMyWalletSlot] = useState<EnrichedWalletSlot | null>(
    null,
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const { execute, loading, reset } = useSendMoney();
  const { wallets: myWallets, loading: walletsLoading } =
    useUserWallets(currentUserUid);

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
  }, [amountAnim, myWalletSlot]);

  const resetForm = useCallback(() => {
    setAmount("");
    setSelectedUser(null);
    setCategory(null);
    setNote("");
    setMyWalletSlot(null);
    reset();
  }, [reset]);

  const validateForm = (): string | null => {
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) return s.errors.INVALID_AMOUNT;
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return s.errors.INVALID_AMOUNT;
    if (parsedAmount < 1) return s.errors.INVALID_AMOUNT;

    const max = MAX_AMOUNT[currency] ?? 5000;
    if (parsedAmount > max)
      return `Maximum amount is ${max} ${currency.toUpperCase()}`;

    if (!myWalletSlot || !selectedUser) return s.fillRequired;

    if (note.length > MAX_NOTE_LENGTH)
      return `Note cannot exceed ${MAX_NOTE_LENGTH} characters`;

    return null;
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setNotif({ type: "error", msg: validationError });
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    const parsedAmount = parseFloat(amount);
    const error = await execute({
      senderUid: currentUserUid,
      fromSlotKey: myWalletSlot!.slotKey,
      receiverUid: selectedUser!.uid,
      amount: parsedAmount,
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
      <View style={[styles.root, isDark && styles.rootDark]}>
        <StatusBar barStyle="light-content" />

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
            <View style={styles.section}>
              <Label text={s.myWallet} isRtl={isRtl} isDark={isDark} />
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
                <Label text={s.amount} isRtl={isRtl} isDark={isDark} />
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

            <View style={styles.section}>
              <Label text={s.recipient} isRtl={isRtl} isDark={isDark} />
              <UserPicker
                label={s.recipient}
                placeholder={s.selectRecipient}
                selectedUser={selectedUser}
                currentUserUid={currentUserUid}
                onSelect={setSelectedUser}
                isRtl={isRtl}
                language={language as "en" | "ar"}
              />
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
                  {s.mainWalletNote}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Label text={s.category} isRtl={isRtl} isDark={isDark} />
              <CategoryPicker
                label={s.selectCategory}
                selected={category}
                onSelect={setCategory}
                isRtl={isRtl}
                language={language}
              />
            </View>

            <View style={styles.section}>
              <Label text={s.noteOptional} isRtl={isRtl} isDark={isDark} />
              <View style={[styles.noteBox, isDark && styles.noteBoxDark]}>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder={s.notePlaceholder}
                  placeholderTextColor={
                    isDark ? "rgba(255,255,255,0.3)" : "#9CA3AF"
                  }
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  textAlign={isRtl ? "right" : "left"}
                  style={[styles.noteInput, isDark && styles.noteInputDark]}
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

            <SubmitButton
              label={`${s.sendBtn} ${symbol}${parsedAmount.toFixed(2)}`}
              onPress={handleSubmit}
              loading={loading}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <ConfirmBottomSheet
          visible={showConfirm}
          mode="send"
          amount={amount}
          currency={currency}
          recipient={selectedUser}
          walletSlot={myWalletSlot}
          category={category}
          note={note}
          loading={loading}
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

function Label({
  text,
  isRtl,
  isDark,
}: {
  text: string;
  isRtl: boolean;
  isDark?: boolean;
}) {
  return (
    <Text
      style={[
        styles.label,
        isDark && styles.labelDark,
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
        style={{
          opacity: loading ? 0.6 : 1,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={["#7C3AED", "#6D28D9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitBtnGradient}
        >
          <Ionicons name="send" size={20} color="white" />
          <Text style={styles.submitBtnText}>{loading ? "..." : label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

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
  rootDark: { backgroundColor: "#0E1118" },
  labelDark: { color: "rgba(255,255,255,0.5)" },
  noteBoxDark: {
    backgroundColor: "#1C1F2A",
    borderColor: "rgba(255,255,255,0.07)",
  },
  noteInputDark: { color: "#E0E0E0" },
});
