import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, type FieldErrors, useForm, useWatch } from "react-hook-form";
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
  TouchableOpacity,
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
import { useRequestMoney } from "../hooks/useRequestMoney";
import { AppUser, Category, Currency, CURRENCY_SYMBOLS } from "../types";

const STRINGS = {
  en: {
    title: "Request Money",
    viewRequests: "View Requests",
    amount: "Amount",
    payer: "Payer",
    selectPayer: "Who should pay you?",
    category: "Category",
    selectCategory: "Select category",
    noteOptional: "Note (Optional)",
    notePlaceholder: "Add a note...",
    requestBtn: "Request",
    requestNote: "Payer will receive a request to approve",
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
    title: "طلب المال",
    viewRequests: "عرض الطلبات",
    amount: "المبلغ",
    payer: "الدافع",
    selectPayer: "من سيدفع لك؟",
    category: "الفئة",
    selectCategory: "اختر الفئة",
    noteOptional: "ملاحظة (اختياري)",
    notePlaceholder: "أضف ملاحظة...",
    requestBtn: "طلب",
    requestNote: "سيصل الطلب للدافع للموافقة عليه",
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

interface RequestMoneyFormValues {
  amount: string;
  currency: Currency;
  selectedUser: AppUser | null;
  category: Category | null;
  note: string;
}

export default function RequestMoneyScreen() {
  // useAuth returns the current user data used when creating the request.
  const { user } = useAuth();
  const currentUserUid = user?.uid ?? "";
  // useI18n hook returns the language and isRtl properties
  const { language, isRtl } = useI18n();
  // useThemeMode hook returns the theme mode
  const { colorScheme } = useThemeMode();
  // isDark is a boolean that is used to check if the theme is dark
  const isDark = colorScheme === "dark";
  // s to get the strings (placeholders, titles, errors, etc) of the current language
  const s = STRINGS[language as "en" | "ar"] ?? STRINGS.en;
  // amountAnim to animate the amount input
  const amountAnim = useRef(new Animated.Value(0)).current;
  // showConfirm controls the confirmation bottom sheet before the request is created.
  const [showConfirm, setShowConfirm] = useState(false);
  // notif controls the success/error modal shown for validation and request results.
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  /**
   * useRequestMoney hook provides access to the request money functionality.
   * execute: function to create the request
   * loading: boolean to show loading state
   * reset: function to reset the hook state
   */
  const { execute, loading, reset: resetRequestState } = useRequestMoney();

  /**
   * useForm centralizes the field values and validation state.
   * Controller is used because the screen is built from custom form components.
   */
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RequestMoneyFormValues>({
    defaultValues: {
      amount: "",
      currency: "nis",
      selectedUser: null,
      category: null,
      note: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // useWatch keeps the rendered values in sync with react-hook-form state.
  const amount = useWatch({ control, name: "amount" }) ?? "";
  const currency = useWatch({ control, name: "currency" }) ?? "nis";
  const selectedUser = useWatch({ control, name: "selectedUser" }) ?? null;
  const category = useWatch({ control, name: "category" }) ?? null;
  const note = useWatch({ control, name: "note" }) ?? "";

  // useEffect hook is a side effect hook that is used to perform side effects.
  // In this case, it is used to make a smooth animation for the amount input on page load.
  useEffect(() => {
    Animated.spring(amountAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [amountAnim]);

  // resetForm: function to reset the form
  const resetForm = useCallback(() => {
    const currentCurrency = getValues("currency");

    reset({
      amount: "",
      currency: currentCurrency,
      selectedUser: null,
      category: null,
      note: "",
    });
    resetRequestState();
  }, [getValues, reset, resetRequestState]);

  // getFirstValidationError(formErrors): function to get the first error message that the user should fix
  //formErrors is an object that contains the errors of the useForm 
  
  const getFirstValidationError = useCallback(
    (formErrors: FieldErrors<RequestMoneyFormValues>): string => {
      const orderedMessages = [
        //if the first error is not found then check the next one and so on
        formErrors.amount?.message,
        formErrors.selectedUser?.message,
        formErrors.note?.message,
      ];

      const firstMessage = orderedMessages.find(
        (message): message is string =>
          typeof message === "string" && message.length > 0,
      );

      return firstMessage ?? s.errors.UNKNOWN;
    },
    //if the language of the app is changed then rerender this function
    [s.errors.UNKNOWN],
  );

  /**
   * if form validations pass then open bottom sheet to confirm the request
   */
  const openConfirmSheet = handleSubmit(
    // if validation pass show bottom sheet
    () => {
      setShowConfirm(true);
    },
    // if validation fail show error message
    (formErrors) => {
      setNotif({ type: "error", msg: getFirstValidationError(formErrors) });
    },
  );

  /**
   * handleConfirm: is called after user confirm the request in the ConfirmBottomSheet
   * it is used to execute the request
   */
  const handleConfirm = async () => {
    const values = getValues();
    const parsedAmount = parseFloat(values.amount);

    if (!values.selectedUser) {
      setShowConfirm(false);
      setNotif({ type: "error", msg: s.fillRequired });
      return;
    }

    const error = await execute({
      requesterUid: currentUserUid,
      payerUid: values.selectedUser.uid,
      amount: parsedAmount,
      currency: values.currency,
      category: values.category?.key ?? "other",
      note: values.note,
    });

    if (!error) {
      setShowConfirm(false);
      setNotif({ type: "success", msg: s.successRequest });
    } else {
      setNotif({ type: "error", msg: s.errors[error] ?? s.errors.UNKNOWN });
    }
  };

  // parsedAmount is the amount after parsing it to float
  const parsedAmount = parseFloat(amount) || 0;
  // symbol is the currency symbol
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
              <Controller
                control={control}
                name="amount"
                rules={{
                  required: s.errors.INVALID_AMOUNT,
                  validate: {
                    // check if the amount is a valid format (only numbers and one decimal point)
                    validFormat: (value) =>
                      /^\d+(\.\d{1,2})?$/.test(value) ||
                      s.errors.INVALID_AMOUNT,
                    // check if the amount is a valid value (greater than or equal to 1)
                    validValue: (value) => {
                      const parsed = parseFloat(value);
                      return (!!parsed && parsed >= 1) || s.errors.INVALID_AMOUNT;
                    },
                    // check if the amount is not greater than the maximum amount allowed
                    maxAmount: (value) => {
                      const parsed = parseFloat(value);
                      const max = MAX_AMOUNT[getValues("currency")] ?? 5000;
                      // if the amount is greater than the maximum amount allowed return an error message
                      return (
                        parsed <= max ||
                        `Maximum amount is ${max} ${getValues("currency").toUpperCase()}`
                      );
                    },
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <AmountInput
                    amount={value}
                    currency={currency}
                    availableCurrencies={["nis", "usd", "jod"]}
                    onAmountChange={onChange}
                    onCurrencyChange={(nextCurrency) => {
                      setValue("currency", nextCurrency as Currency, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    isRtl={isRtl}
                  />
                )}
              />
              <ErrorText message={errors.amount?.message} isRtl={isRtl} />
            </Animated.View>

            <View style={styles.section}>
              <Label text={s.payer} isRtl={isRtl} isDark={isDark} />
              <Controller
                control={control}
                name="selectedUser"
                rules={{
                  // validate that the payer is not empty
                  validate: (value) => value !== null || s.fillRequired,
                }}
                render={({ field: { value, onChange } }) => (
                  <UserPicker
                    label={s.payer}
                    placeholder={s.selectPayer}
                    selectedUser={value}
                    currentUserUid={currentUserUid}
                    onSelect={onChange}
                    isRtl={isRtl}
                    language={language as "en" | "ar"}
                  />
                )}
              />
              <ErrorText message={errors.selectedUser?.message} isRtl={isRtl} />
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
                  {s.requestNote}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Label text={s.category} isRtl={isRtl} isDark={isDark} />
              <Controller
                control={control}
                name="category"
                render={({ field: { value, onChange } }) => (
                  <CategoryPicker
                    label={s.selectCategory}
                    selected={value}
                    onSelect={onChange}
                    isRtl={isRtl}
                    language={language}
                  />
                )}
              />
            </View>

            <View style={styles.section}>
              <Label text={s.noteOptional} isRtl={isRtl} isDark={isDark} />
              <View style={[styles.noteBox, isDark && styles.noteBoxDark]}>
                <Controller
                  control={control}
                  name="note"
                  rules={{
                    validate: (value) =>
                      value.length <= MAX_NOTE_LENGTH ||
                      `Note cannot exceed ${MAX_NOTE_LENGTH} characters`,
                  }}
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
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
                  )}
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
              <ErrorText message={errors.note?.message} isRtl={isRtl} />
            </View>

            <SubmitButton
              label={`${s.requestBtn} ${symbol}${parsedAmount.toFixed(2)}`}
              onPress={() => {
                void openConfirmSheet();
              }}
              loading={loading}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <ConfirmBottomSheet
          visible={showConfirm}
          mode="receive"
          amount={amount}
          currency={currency}
          recipient={selectedUser}
          walletSlot={null}
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

// ErrorText keeps validation messages consistent under all request form fields.
function ErrorText({
  message,
  isRtl,
}: {
  message: string | undefined;
  isRtl: boolean;
}) {
  if (!message) return null;

  return (
    <Text
      style={[
        styles.errorText,
        { textAlign: isRtl ? "right" : "left" },
      ]}
    >
      {message}
    </Text>
  );
}

// SubmitButton is the final CTA that starts validation and opens the confirm sheet.
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
          colors={["#5B21B6", "#4C1D95"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitBtnGradient}
        >
          <Ionicons name="arrow-down-circle" size={20} color="white" />
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
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    marginHorizontal: 4,
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
