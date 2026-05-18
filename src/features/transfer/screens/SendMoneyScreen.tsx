import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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
    qrTitle: "Send via QR",
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
    qrFillRequired: "Please select a wallet and enter an amount.",
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
    qrTitle: "إرسال عبر QR",
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
    qrFillRequired: "الرجاء اختيار محفظة وإدخال المبلغ.",
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

interface SendMoneyFormValues {
  amount: string;
  currency: Currency;
  selectedUser: AppUser | null;
  category: Category | null;
  note: string;
  walletSlot: EnrichedWalletSlot | null;
}

export default function SendMoneyScreen() {
  // useAuth returns the user profile, user data, and functions to sign in, sign out, and register.
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
  // QR====================================================================
  // If this screen is opened from /qr-send, these params identify the scanned user.
  const {
    uid: qrUid,
    name: qrName,
    number: qrNumber,
  } = useLocalSearchParams<{
    uid?: string;
    name?: string;
    number?: string;
  }>();
  // QR mode means the recipient comes from the scanned code instead of UserPicker.
  const isQrMode = typeof qrUid === "string" && qrUid.length > 0;
  const qrRecipient: AppUser | null = isQrMode
    ? {
        uid: qrUid,
        name: typeof qrName === "string" ? qrName : "",
        number: typeof qrNumber === "string" ? qrNumber : "",
        type: 1,
      }
    : null;
  // Use QR-specific title and required message without affecting normal send behavior.
  const screenTitle = isQrMode ? s.qrTitle : s.title;
  const requiredMessage = isQrMode ? s.qrFillRequired : s.fillRequired;
  // end QR====================================================================
 
  // amountAnim to animate the amount input
  const amountAnim = useRef(new Animated.Value(0)).current;
  // showConfirm is a state that is used to show or hide the ConfirmBottomSheet
  // ConfirmBottomSheet is a bottom sheet that is used to confirm the transfer
  const [showConfirm, setShowConfirm] = useState(false);
  // notif is a state that is used to show or hide the NotificationModal
  // and NotificationModal is a modal that is used to show the success or error message
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  /**
   * useSendMoney hook provides access to the send money functionality.
   * It used to send money to the recipient.
   * execute: function to send money
   * loading: boolean to show loading state
   * reset: function to reset the form
   */
  const { execute, loading, reset: resetSendState } = useSendMoney();
  /**
   * useUserWallets hook provides access to the user wallets functionality.
   * It used to get the user's wallets to use in wallet picker.
   * wallets: array of user's wallets
   * loading: boolean to show loading state
   */
  const { wallets: myWallets, loading: walletsLoading } =
    useUserWallets(currentUserUid);

  /**
   * useForm centralizes the field values and validation state.
   * Controller is used because most inputs on this screen are custom components.
   */
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SendMoneyFormValues>({
    defaultValues: {
      amount: "",
      currency: "nis",
      selectedUser: null,
      category: null,
      note: "",
      walletSlot: null,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // useWatch keeps the UI in sync with form state without scattering useState across the screen like using useState in every input.
  const amount = useWatch({ control, name: "amount" }) ?? "";
  const currency = useWatch({ control, name: "currency" }) ?? "nis";
  const selectedUser = useWatch({ control, name: "selectedUser" }) ?? null;
  const category = useWatch({ control, name: "category" }) ?? null;
  const note = useWatch({ control, name: "note" }) ?? "";
  // myWalletSlot is a slot that contains wallet information
  const myWalletSlot = useWatch({ control, name: "walletSlot" }) ?? null;

  // QR====================================================================
  // Keep the existing send flow untouched by filling selectedUser automatically
  // when the screen is opened from a scanned QR code.
  useEffect(() => {
    if (!isQrMode || !qrRecipient) return;

    setValue("selectedUser", qrRecipient, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [isQrMode, qrRecipient, setValue]);
  // end QR====================================================================

  // useEffect hook is a side effect hook that is used to perform side effects.
  // In this case, it is used to make a smooth animation for the amount input when the myWalletSlot is selected.
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

  // resetForm: function to reset the form
  const resetForm = useCallback(() => {
    const currentCurrency = getValues("currency");

    reset({
      amount: "",
      currency: currentCurrency,
      selectedUser: null,
      category: null,
      note: "",
      walletSlot: null,
    });
    resetSendState();
  }, [getValues, reset, resetSendState]);

  // getFirstValidationError function to get the first error message that the user should fix
  const getFirstValidationError = useCallback(
    (formErrors: FieldErrors<SendMoneyFormValues>): string => {
      const orderedMessages = [
        //if the first error is not found then check the next one and so on
        formErrors.amount?.message,
        formErrors.walletSlot?.message,
        !isQrMode ? formErrors.selectedUser?.message : undefined,
        formErrors.note?.message,
      ];

      const firstMessage = orderedMessages.find(
        (message): message is string => typeof message === "string" && message.length > 0,
      );

      return firstMessage ?? s.errors.UNKNOWN;
    },
    [isQrMode, s.errors.UNKNOWN],
  );

  /**
   * if form validations pass then open bottom sheet to confirm the transfer
   */
  const openConfirmSheet = handleSubmit(
    //if validation pass show bottom sheet
    () => {
      setShowConfirm(true);
    },
    //if validation fail show error message
    (formErrors) => {
      setNotif({ type: "error", msg: getFirstValidationError(formErrors) });
    },
  );

  /**
   * handleConfirm: is called after user confirm the transfer in the ConfirmBottomSheet
   * it is used to execute the transfer
   */
  const handleConfirm = async () => {
    const values = getValues();
    const parsedAmount = parseFloat(values.amount);

    if (!values.walletSlot || !values.selectedUser) {
      setShowConfirm(false);
      setNotif({ type: "error", msg: requiredMessage });
      return;
    }

    // execute call function to send money
    // execute return error if there is an error
    const error = await execute({
      senderUid: currentUserUid,
      fromSlotKey: values.walletSlot.slotKey,
      receiverUid: values.selectedUser.uid,
      amount: parsedAmount,
      currency: values.currency,
      category: values.category?.key ?? "other",
      note: values.note,
    });

    if (!error) {
      // if there is no error, reset the form and show success message
      setShowConfirm(false);
      setNotif({ type: "success", msg: s.successSend });
    } else {
      setNotif({ type: "error", msg: s.errors[error] ?? s.errors.UNKNOWN });
    }
  };
  // parsedAmount is the amount after parsing it to float
  const parsedAmount = parseFloat(amount) || 0;
  // symbol is the currency symbol
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();

  return (
    // GestureHandlerRootView is for confirm bottom sheet animation to work properly
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.root, isDark && styles.rootDark]}>
        <StatusBar barStyle="light-content" />

        {/* Header gradient is a gradient purple color for the header */}
        <LinearGradient
          colors={["#7C3AED", "#6D28D9", "#5B21B6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* header row with back button and title */}
          <View
            style={[
              styles.headerRow,
              { flexDirection: isRtl ? "row-reverse" : "row" },
            ]}
          >
            {/* back button */}
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
              {screenTitle}
            </Text>
          </View>
        </LinearGradient>
        {/* end header */}

        {/* main form */}
        {/* KeyboardAvoidingView : avoid the keyboard to hide the form */}
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
              {/* my wallet selection */}
              <Label text={s.myWallet} isRtl={isRtl} isDark={isDark} />
              {/* wallet picker component it is used to select wallet */}
              {/* Controller is used to link the WalletPicker to the react useForm*/}
              <Controller
                control={control} //link the controller to the useForm
                name="walletSlot"
                rules={{
                  // validation to check if the wallet slot is selected 
                  validate: (value) => value !== null || s.fillRequired,
                }}
                render={({ field: { value, onChange } }) => (
                  //onChange tells the useform that the value has changed
                  <WalletPicker
                    label={s.myWallet}
                    placeholder={s.selectWallet}
                    selectedSlot={value}
                    wallets={myWallets}
                    loading={walletsLoading}
                    onSelect={(slot) => {
                      onChange(slot);
                      // set the currency to the first currency in the selected wallet
                      setValue(
                        "currency",
                        (Object.keys(slot.wallet?.currancies ?? {})[0] ?? "nis") as Currency,
                        { shouldDirty: true, shouldValidate: true },
                      );
                    }}
                    isRtl={isRtl}
                  />
                )}
              />
              {/* error message if the wallet slot is not selected */}
              <ErrorText message={errors.walletSlot?.message} isRtl={isRtl} />
            </View>


            {/*if myWalletSlot is selected show the amount input*/}
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
                <Controller
                  control={control}
                  name="amount"
                  rules={{
                    required: s.errors.INVALID_AMOUNT,
                    validate: {
                      // check if the amount is a valid format (only numbers and one decimal point)
                      validFormat: (value) =>
                        /^\d+(\.\d{1,2})?$/.test(value) || s.errors.INVALID_AMOUNT,
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
                      availableCurrencies={
                        myWalletSlot.wallet?.currancies
                          ? Object.keys(myWalletSlot.wallet.currancies)
                          : ["nis", "usd", "jod"]
                      }
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
            )}

            {!isQrMode ? (
              <View style={styles.section}>
                <Label text={s.recipient} isRtl={isRtl} isDark={isDark} />
                <Controller
                  control={control}
                  name="selectedUser"
                  rules={{
                    // validate that the recipient is not empty
                    // || we do it when the first condition is false
                    validate: (value) => value !== null || requiredMessage,
                  }}
                  render={({ field: { value, onChange } }) => (
                    <UserPicker
                      label={s.recipient}
                      placeholder={s.selectRecipient}
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
                    {s.mainWalletNote}
                  </Text>
                </View>
              </View>
            ) : (
              // QR====================================================================
              // In QR mode the recipient is fixed, so we show a locked card
              // instead of the normal UserPicker.
              <View style={styles.section}>
                <Label text={s.recipient} isRtl={isRtl} isDark={isDark} />
                <View
                  style={[
                    styles.qrRecipientCard,
                    isDark && styles.qrRecipientCardDark,
                    { flexDirection: isRtl ? "row-reverse" : "row" },
                  ]}
                >
                  <View style={styles.qrAvatar}>
                    <Text style={styles.qrAvatarText}>
                      {(qrRecipient?.name ?? "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.qrRecipientName,
                        isDark && styles.qrRecipientNameDark,
                        { textAlign: isRtl ? "right" : "left" },
                      ]}
                    >
                      {qrRecipient?.name ?? ""}
                    </Text>
                    {!!qrRecipient?.number && (
                      <Text
                        style={[
                          styles.qrRecipientNumber,
                          { textAlign: isRtl ? "right" : "left" },
                        ]}
                      >
                        {String(qrRecipient.number)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.qrLockBadge}>
                    <Ionicons name="lock-closed" size={14} color="#7C3AED" />
                  </View>
                </View>
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
              // QR====================================================================
            )}

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
              label={`${s.sendBtn} ${symbol}${parsedAmount.toFixed(2)}`}
              onPress={() => {
                void openConfirmSheet();
              }}
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
          if (wasSuccess) {
            // QR====================================================================
            // QR flow should return to the previous screen after success
            // instead of resetting the normal send form in place.
            if (isQrMode) {
              router.back();
              return;
            }
            // QR====================================================================
            resetForm();
          }
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
  // QR====================================================================
  // Dedicated styles for the locked recipient card shown only in QR mode.
  qrRecipientCard: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    gap: 12,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.06)",
  },
  qrRecipientCardDark: {
    backgroundColor: "#1C1F2A",
    borderColor: "rgba(255,255,255,0.07)",
  },
  qrAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  qrAvatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  qrRecipientName: {
    color: "#1F2937",
    fontWeight: "700",
    fontSize: 16,
  },
  qrRecipientNameDark: {
    color: "#E0E0E0",
  },
  qrRecipientNumber: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 2,
  },
  qrLockBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  // QR====================================================================
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
