// app/(tabs)/goals/create.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppDialogModal } from "@/components/ui/AppDialogModal";
import { GradientButton } from "@/components/ui/gradient-button";
import { Fonts } from "@/constants/theme";
import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { db } from "@/src/firebaseConfig";
import {
  hapticError,
  hapticSelection,
  hapticSuccess,
  hapticTap,
} from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ref, set, update } from "firebase/database";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";

const CURRENCIES = ["usd", "eur", "nis"] as const;
type Currency = (typeof CURRENCIES)[number];

type FormValues = {
  title: string;
  targetAmount: string;
  currentAmount: string;
  currency: Currency;
  targetDate: number | null;
};

export default function CreateGoalScreen() {
  const { t, language } = useI18n();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const isEditing = params.edit === "true";
  const isFocused = useIsFocused();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successDescription, setSuccessDescription] = useState("");
  const pageTransition = useRef(new Animated.Value(0)).current;
  const isLeavingRef = useRef(false);
  const defaultDatePickerStyles = useDefaultStyles();

  const mapCurrency = (value: string | undefined): Currency => {
    const normalized = String(value || "usd")
      .trim()
      .toLowerCase();
    if (normalized.includes("eur")) return "eur";
    if (normalized.includes("nis")) return "nis";
    return "usd";
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: params.goal?.toString() ?? "",
      targetAmount: params.goalTargetAmount?.toString() ?? "",
      currentAmount: params.currentAmount?.toString() ?? "",
      currency: mapCurrency(params.goalTargetCurrency?.toString()),
      targetDate: params.goalTargetDate
        ? parseInt(params.goalTargetDate.toString())
        : null,
    },
  });

  useEffect(() => {
    if (!isFocused) return;
    reset({
      title: params.goal?.toString() ?? "",
      targetAmount: params.goalTargetAmount?.toString() ?? "",
      currentAmount: params.currentAmount?.toString() ?? "",
      currency: mapCurrency(params.goalTargetCurrency?.toString()),
      targetDate: params.goalTargetDate
        ? parseInt(params.goalTargetDate.toString())
        : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFocused,
    params.id,
    params.goal,
    params.goalTargetAmount,
    params.goalTargetCurrency,
    params.goalTargetDate,
    params.currentAmount,
  ]);

  const watchedTitle = watch("title");
  const watchedTargetAmount = watch("targetAmount");
  const watchedCurrency = watch("currency");
  const watchedTargetDate = watch("targetDate");
  const initialPickerDate = watchedTargetDate
    ? new Date(watchedTargetDate)
    : new Date();
  const [pickerMonth, setPickerMonth] = useState(
    initialPickerDate.getMonth() + 1,
  );
  const [pickerYear, setPickerYear] = useState(initialPickerDate.getFullYear());

  const previewAmount = `${(parseFloat(watchedTargetAmount) || 0).toFixed(2)} ${watchedCurrency.toUpperCase()}`;

  const shiftPickerMonth = React.useCallback(
    (delta: number) => {
      const nextDate = new Date(pickerYear, pickerMonth - 1 + delta, 1);
      setPickerMonth(nextDate.getMonth() + 1);
      setPickerYear(nextDate.getFullYear());
    },
    [pickerMonth, pickerYear],
  );

  const pickerSwipeResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 12,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx <= -48) {
            hapticSelection();
            shiftPickerMonth(1);
            return;
          }
          if (gestureState.dx >= 48) {
            hapticSelection();
            shiftPickerMonth(-1);
          }
        },
      }),
    [shiftPickerMonth],
  );

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    const targetNum = parseFloat(data.targetAmount);
    const currentNum = data.currentAmount ? parseFloat(data.currentAmount) : 0;

    if (Number.isNaN(currentNum) || currentNum < 0) {
      hapticError();
      Alert.alert(
        t("goals.invalidInputTitle"),
        t("goals.invalidCurrentAmount"),
      );
      return;
    }

    if (!Number.isNaN(targetNum) && currentNum >= targetNum) {
      hapticError();
      Alert.alert(
        t("goals.invalidInputTitle"),
        t("goals.currentLessThanTarget"),
      );
      return;
    }

    setLoading(true);
    try {
      const timestamp = Date.now();

      if (isEditing && params.id) {
        await update(ref(db, `wallets/${params.id}`), {
          goal: data.title,
          goalTargetAmount: parseFloat(data.targetAmount),
          goalTargetCurrency: data.currency,
          goalTargetDate: data.targetDate ?? timestamp,
          currentAmount: data.currentAmount
            ? parseFloat(data.currentAmount)
            : 0,
        });
        hapticSuccess();
        setSuccessTitle(t("goals.goalUpdatedTitle"));
        setSuccessDescription(t("goals.updateSuccess"));
        setSuccessVisible(true);
      } else {
        await set(ref(db, `wallets/${timestamp}`), {
          type: "goal",
          ownerUid: user.uid,
          goal: data.title,
          goalTargetAmount: parseFloat(data.targetAmount),
          goalTargetCurrency: data.currency,
          goalTargetDate: data.targetDate ?? timestamp,
          currentAmount: data.currentAmount
            ? parseFloat(data.currentAmount)
            : 0,
          currencies: {
            [data.currency]: data.currentAmount
              ? parseFloat(data.currentAmount)
              : 0,
          },
          members: { [user.uid]: true },
          sharedLogs: {},
          createdAt: timestamp,
          state: "active",
        });
        hapticSuccess();
        setSuccessTitle(t("goals.goalCreatedTitle"));
        setSuccessDescription(t("goals.createSuccess"));
        setSuccessVisible(true);
      }
    } catch (error) {
      hapticError();
      Alert.alert(t("error"), String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = React.useCallback(() => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    hapticTap();
    reset({
      title: "",
      targetAmount: "",
      currentAmount: "",
      currency: "usd",
      targetDate: null,
    });
    Animated.timing(pageTransition, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      router.replace("/(tabs)/goals");
    });
  }, [pageTransition, reset, router]);

  useFocusEffect(
    React.useCallback(() => {
      isLeavingRef.current = false;
      pageTransition.setValue(0);
      Animated.timing(pageTransition, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [pageTransition]),
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const hardwareSub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      const removeNavListener = navigation.addListener(
        "beforeRemove",
        (event: any) => {
          const actionType = event?.data?.action?.type;
          if (
            actionType === "GO_BACK" ||
            actionType === "POP" ||
            actionType === "POP_TO_TOP"
          ) {
            event.preventDefault();
            onBackPress();
          }
        },
      );

      return () => {
        hardwareSub.remove();
        removeNavListener();
      };
    }, [handleBack, navigation]),
  );

  // Theme tokens
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF";
  const inputBorder = isDark ? "rgba(255,255,255,0.18)" : "#94A3B8";
  const inputColor = isDark ? "#FFFFFF" : "#111827";
  const placeholder = isDark ? "rgba(255,255,255,0.38)" : "#475569";
  const pillBorder = isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1";
  const pillTextColor = isDark ? "rgba(255,255,255,0.75)" : "#334155";
  const pillBg = isDark ? "rgba(255,255,255,0.04)" : "#EEF2FF";
  const headerSurface = isDark ? "rgba(124,58,237,0.10)" : "#EDE9FE";
  const headerBorder = isDark ? "rgba(196,181,253,0.22)" : "#C4B5FD";

  const inputStyle = {
    borderColor: inputBorder,
    color: inputColor,
    backgroundColor: inputBg,
  };
  const todayStart = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  useEffect(() => {
    if (!showDatePicker) return;
    const baseDate = watchedTargetDate
      ? new Date(watchedTargetDate)
      : new Date();
    setPickerMonth(baseDate.getMonth() + 1);
    setPickerYear(baseDate.getFullYear());
  }, [showDatePicker, watchedTargetDate]);

  const datePickerStyles = useMemo<any>(
    () => ({
      ...defaultDatePickerStyles,
      header: {
        ...defaultDatePickerStyles.header,
        marginBottom: 10,
        paddingTop: 0,
        paddingBottom: 0,
        paddingVertical: 0,
      },
      month_selector: {
        ...defaultDatePickerStyles.month_selector,
        backgroundColor: isDark ? "rgba(124,58,237,0.22)" : "#E9DFFF",
        borderWidth: 0,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        width: 112,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        paddingHorizontal: 0,
        paddingVertical: 0,
        marginRight: -5,
        marginLeft: -10,
      },
      year_selector: {
        ...defaultDatePickerStyles.year_selector,
        backgroundColor: isDark ? "rgba(124,58,237,0.22)" : "#E9DFFF",
        borderWidth: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        marginLeft: 5,
        marginRight: -5,
        width: 112,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      month_selector_label: {
        ...defaultDatePickerStyles.month_selector_label,
        color: isDark ? "#F5F3FF" : "#3B0764",
        fontWeight: "800",
        fontSize: 16,
        lineHeight: 20,
        textAlign: "center",
        textAlignVertical: "center",
        includeFontPadding: false,
        paddingVertical: 0,
        width: "100%",
      },
      year_selector_label: {
        ...defaultDatePickerStyles.year_selector_label,
        color: isDark ? "#F5F3FF" : "#3B0764",
        fontWeight: "800",
        fontSize: 16,
        lineHeight: 20,
        textAlign: "center",
        textAlignVertical: "center",
        includeFontPadding: false,
        paddingVertical: 0,
        width: "100%",
      },
      month: {
        ...defaultDatePickerStyles.month,
        backgroundColor: isDark ? "rgba(124,58,237,0.08)" : "#F5F3FF",
        borderColor: isDark ? "rgba(196,181,253,0.24)" : "#DDD6FE",
        borderWidth: 1,
      },
      month_label: {
        ...defaultDatePickerStyles.month_label,
        color: isDark ? "#F5F3FF" : "#1F2937",
        fontWeight: "700",
      },
      selected_month: {
        ...defaultDatePickerStyles.selected_month,
        backgroundColor: "#7C3AED",
        borderColor: "#7C3AED",
      },
      selected_month_label: {
        ...defaultDatePickerStyles.selected_month_label,
        color: "#FFFFFF",
        fontWeight: "800",
      },
      year: {
        ...defaultDatePickerStyles.year,
        backgroundColor: isDark ? "rgba(124,58,237,0.08)" : "#F5F3FF",
        borderColor: isDark ? "rgba(196,181,253,0.24)" : "#DDD6FE",
        borderWidth: 1,
      },
      year_label: {
        ...defaultDatePickerStyles.year_label,
        color: isDark ? "#F5F3FF" : "#1F2937",
        fontWeight: "700",
      },
      selected_year: {
        ...defaultDatePickerStyles.selected_year,
        backgroundColor: "#7C3AED",
        borderColor: "#7C3AED",
      },
      selected_year_label: {
        ...defaultDatePickerStyles.selected_year_label,
        color: "#FFFFFF",
        fontWeight: "800",
      },
      active_year: {
        ...defaultDatePickerStyles.active_year,
        backgroundColor: isDark ? "rgba(124,58,237,0.18)" : "#E9DFFF",
        borderColor: isDark ? "rgba(196,181,253,0.45)" : "#A78BFA",
      },
      active_year_label: {
        ...defaultDatePickerStyles.active_year_label,
        color: isDark ? "#F5F3FF" : "#3B0764",
        fontWeight: "800",
      },
      button_prev: {
        ...defaultDatePickerStyles.button_prev,
        backgroundColor: isDark ? "rgba(124,58,237,0.28)" : "#7C3AED",
        borderColor: isDark ? "rgba(196,181,253,0.55)" : "#6D28D9",
        borderWidth: 1,
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
      },
      button_next: {
        ...defaultDatePickerStyles.button_next,
        backgroundColor: isDark ? "rgba(124,58,237,0.28)" : "#7C3AED",
        borderColor: isDark ? "rgba(196,181,253,0.55)" : "#6D28D9",
        borderWidth: 1,
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
      },
      button_prev_image: {
        ...defaultDatePickerStyles.button_prev_image,
        tintColor: "#FFFFFF",
        alignSelf: "center",
      },
      button_next_image: {
        ...defaultDatePickerStyles.button_next_image,
        tintColor: "#FFFFFF",
        alignSelf: "center",
      },
      weekday_label: {
        ...defaultDatePickerStyles.weekday_label,
        color: isDark ? "rgba(237,233,254,0.82)" : "#6D28D9",
        fontWeight: "600",
      },
      day: {
        ...defaultDatePickerStyles.day,
        borderRadius: 10,
      },
      day_label: {
        ...defaultDatePickerStyles.day_label,
        color: isDark ? "#F5F3FF" : "#1F2937",
        fontWeight: "600",
      },
      selected: {
        ...defaultDatePickerStyles.selected,
        backgroundColor: "#7C3AED",
        borderRadius: 10,
      },
      selected_label: {
        ...defaultDatePickerStyles.selected_label,
        color: "#FFFFFF",
        fontWeight: "800",
      },
      today: {
        ...defaultDatePickerStyles.today,
        borderColor: "#8B5CF6",
        borderWidth: 1.5,
      },
      outside_label: {
        ...defaultDatePickerStyles.outside_label,
        color: isDark ? "rgba(245,243,255,0.3)" : "rgba(31,41,55,0.35)",
      },
      disabled_label: {
        ...defaultDatePickerStyles.disabled_label,
        color: isDark ? "rgba(245,243,255,0.28)" : "rgba(31,41,55,0.28)",
      },
    }),
    [defaultDatePickerStyles, isDark],
  );

  return (
    <>
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: headerSurface,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.animatedPage,
            {
              opacity: pageTransition,
              transform: [
                {
                  translateY: pageTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
                {
                  scale: pageTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.985, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <ThemedView style={styles.container}>
          {/* Header */}
          <View
            style={[
              styles.headerSection,
              {
                backgroundColor: headerSurface,
                borderBottomColor: headerBorder,
              },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Pressable
                  onPress={handleBack}
                  style={[
                    styles.backButton,
                    isDark ? styles.backButtonDark : styles.backButtonLight,
                  ]}
                >
                  <MaterialIcons
                    name="arrow-back"
                    size={18}
                    color={isDark ? "#C4B5FD" : "#7C3AED"}
                  />
                </Pressable>
                <ThemedText style={styles.headerTitle}>
                  {isEditing ? t("goals.editTitle") : t("goals.createTitle")}
                </ThemedText>
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Live Preview Card */}
            <LinearGradient
              colors={["#A95EF1", "#7A48B7", "#3F568C"]}
              start={{ x: 0.1, y: 0.25 }}
              end={{ x: 0.9, y: 0.85 }}
              style={styles.previewCard}
            >
              <MaterialIcons
                name="savings"
                size={28}
                color="rgba(255,255,255,0.82)"
              />
              <ThemedText
                style={styles.previewTitle}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {watchedTitle || t("goals.goalName")}
              </ThemedText>
              <ThemedText style={styles.previewSub}>
                {t("goals.targetAmount")}
              </ThemedText>
              <ThemedText style={styles.previewAmount}>
                {previewAmount}
              </ThemedText>
              {watchedTargetDate ? (
                <ThemedText style={styles.previewDate}>
                  {new Date(watchedTargetDate).toLocaleDateString()}
                </ThemedText>
              ) : null}

              <View style={styles.previewCircleTop} />
              <View style={styles.previewCircleBottom} />
            </LinearGradient>

            {/* Goal Name */}
            <ThemedText style={styles.label}>
              {t("goals.goalName")} *
            </ThemedText>
            <Controller
              control={control}
              name="title"
              rules={{ required: t("required") }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    inputStyle,
                    errors.title && styles.inputError,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t("goals.titlePlaceholder")}
                  placeholderTextColor={placeholder}
                />
              )}
            />
            {errors.title && (
              <ThemedText style={styles.errorText}>
                {errors.title.message}
              </ThemedText>
            )}

            {/* Target Amount */}
            <ThemedText style={styles.label}>
              {t("goals.targetAmount")} *
            </ThemedText>
            <Controller
              control={control}
              name="targetAmount"
              rules={{
                required: t("required"),
                validate: (v) => parseFloat(v) > 0 || t("invalidAmount"),
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    inputStyle,
                    errors.targetAmount && styles.inputError,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="0.00"
                  placeholderTextColor={placeholder}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.targetAmount && (
              <ThemedText style={styles.errorText}>
                {errors.targetAmount.message}
              </ThemedText>
            )}

            {/* Current Amount */}
            <ThemedText style={styles.label}>
              {t("goals.currentAmount")}
            </ThemedText>
            <Controller
              control={control}
              name="currentAmount"
              rules={{
                validate: (v) => {
                  if (!v || v.trim() === "") return true;
                  const currentNum = parseFloat(v);
                  if (Number.isNaN(currentNum))
                    return t("goals.invalidCurrentAmount");
                  if (currentNum < 0) return t("goals.invalidCurrentAmount");

                  const targetNum = parseFloat(watch("targetAmount"));
                  if (!Number.isNaN(targetNum) && currentNum >= targetNum) {
                    return t("goals.currentLessThanTarget");
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    inputStyle,
                    errors.currentAmount && styles.inputError,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="0.00"
                  placeholderTextColor={placeholder}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.currentAmount && (
              <ThemedText style={styles.errorText}>
                {errors.currentAmount.message}
              </ThemedText>
            )}

            {/* Target Date */}
            <ThemedText style={styles.label}>
              {t("goals.targetDate")} *
            </ThemedText>
            <Controller
              control={control}
              name="targetDate"
              rules={{ required: t("required") }}
              render={({ field: { value } }) => (
                <Pressable
                  onPress={() => {
                    hapticSelection();
                    setShowDatePicker((prev) => !prev);
                  }}
                  style={[
                    styles.input,
                    styles.dateRow,
                    inputStyle,
                    errors.targetDate && styles.inputError,
                  ]}
                >
                  <ThemedText
                    style={{
                      color: value ? inputColor : placeholder,
                      fontSize: 16,
                    }}
                  >
                    {value
                      ? new Date(value).toLocaleDateString()
                      : t("goals.datePlaceholder")}
                  </ThemedText>
                  <MaterialIcons
                    name={showDatePicker ? "expand-less" : "calendar-today"}
                    size={18}
                    color={placeholder}
                  />
                </Pressable>
              )}
            />
            {showDatePicker ? (
              <View
                style={[
                  styles.datePickerCard,
                  {
                    backgroundColor: isDark
                      ? "rgba(124,58,237,0.12)"
                      : "rgba(255,255,255,0.96)",
                    borderColor: isDark
                      ? "rgba(196,181,253,0.35)"
                      : "rgba(124,58,237,0.18)",
                  },
                ]}
              >
                <DateTimePicker
                  mode="single"
                  locale={language}
                  date={
                    watchedTargetDate ? new Date(watchedTargetDate) : new Date()
                  }
                  month={pickerMonth}
                  year={pickerYear}
                  minDate={todayStart}
                  onMonthChange={(month) => setPickerMonth(month)}
                  onYearChange={(year) => setPickerYear(year)}
                  onChange={({ date }) => {
                    if (!date) return;
                    hapticSelection();
                    const nextValue =
                      date instanceof Date
                        ? date.getTime()
                        : new Date(date as string | number).getTime();
                    setValue("targetDate", nextValue, {
                      shouldValidate: true,
                    });
                    setShowDatePicker(false);
                  }}
                  styles={datePickerStyles}
                  style={styles.datePicker}
                  {...pickerSwipeResponder.panHandlers}
                />
              </View>
            ) : null}
            {errors.targetDate && (
              <ThemedText style={styles.errorText}>
                {errors.targetDate.message}
              </ThemedText>
            )}

            {/* Currency */}
            <ThemedText style={styles.label}>{t("goals.currency")}</ThemedText>
            <Controller
              control={control}
              name="currency"
              render={({ field: { value, onChange } }) => (
                <View style={styles.pillRow}>
                  {CURRENCIES.map((curr) => (
                    <Pressable
                      key={curr}
                      style={[
                        styles.pill,
                        { borderColor: pillBorder, backgroundColor: pillBg },
                        value === curr && styles.pillSelected,
                      ]}
                      onPress={() => {
                        hapticSelection();
                        onChange(curr);
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.pillText,
                          { color: pillTextColor },
                          value === curr && styles.pillTextSelected,
                        ]}
                      >
                        {curr.toUpperCase()}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <GradientButton
              label={isEditing ? t("common.save") : t("common.add")}
              iconName={isEditing ? "edit" : "add-circle-outline"}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
            />
          </View>
          </ThemedView>
        </Animated.View>
      </View>
      <AppDialogModal
        visible={successVisible}
        isDark={isDark}
        title={successTitle}
        description={successDescription}
        actionLabel={t("common.confirm")}
        icon="check-circle"
        onClose={() => {
          setSuccessVisible(false);
          router.replace("/(tabs)/goals");
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  animatedPage: { flex: 1 },
  container: { flex: 1 },
  headerSection: {
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  backButtonLight: {
    backgroundColor: "rgba(124,58,237,0.07)",
    borderColor: "rgba(124,58,237,0.25)",
  },
  backButtonDark: {
    backgroundColor: "rgba(124,58,237,0.15)",
    borderColor: "rgba(196,181,253,0.3)",
  },
  headerTitle: { fontSize: 24, fontWeight: "700", fontFamily: Fonts.sansBlack },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },

  previewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    marginTop: 8,
    gap: 4,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 6,
  },
  previewSub: { fontSize: 13, color: "rgba(255,255,255,0.65)" },
  previewAmount: { fontSize: 28, fontWeight: "800", color: "#FFF" },
  previewDate: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  previewCircleTop: {
    position: "absolute",
    top: -52,
    right: -46,
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.11)",
  },
  previewCircleBottom: {
    position: "absolute",
    bottom: -58,
    left: -50,
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 18,
    opacity: 0.9,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
  },
  inputError: { borderColor: "#EF4444" },
  errorText: { fontSize: 12, color: "#EF4444", marginTop: 4 },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerCard: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  datePicker: {
    width: "100%",
  },

  pillRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  pillSelected: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  pillText: { fontSize: 15, fontWeight: "600" },
  pillTextSelected: { color: "#FFFFFF" },

  footer: { padding: 16, paddingBottom: 8 },
});
