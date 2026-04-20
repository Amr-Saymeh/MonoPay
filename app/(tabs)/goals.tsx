// app/(tabs)/goals.tsx
import { ContributionModal } from "@/components/goals/ContributionModal";
import { GoalCard } from "@/components/goals/GoalCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FeedbackBottomSheet } from "@/components/ui/FeedbackBottomSheet";
import { Fonts } from "@/constants/theme";
import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import {
  addGoalContribution,
  deleteGoal,
  normalizeCurrencyCode,
  subscribeUserGoals,
} from "@/src/services/goals.service";
import {
  hapticError,
  hapticSelection,
  hapticSuccess,
  hapticTap,
  hapticWarning,
} from "@/src/utils/haptics";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Sort config ───────────────────────────────────────────────────────────────
type SortKey = "date" | "progress" | "targetAmount" | "amountSaved";
type SortDir = "asc" | "desc";

interface SortOption {
  key: SortKey;
  icon: keyof typeof MaterialIcons.glyphMap;
  defaultDir: SortDir;
}

const SORT_OPTIONS: SortOption[] = [
  {
    key: "date",
    icon: "calendar-today",
    defaultDir: "asc",
  },
  {
    key: "progress",
    icon: "trending-up",
    defaultDir: "desc",
  },
  {
    key: "targetAmount",
    icon: "flag",
    defaultDir: "desc",
  },
  {
    key: "amountSaved",
    icon: "savings",
    defaultDir: "desc",
  },
];

function sortGoals(goals: any[], key: SortKey, dir: SortDir): any[] {
  return [...goals].sort((a, b) => {
    let valA: number;
    let valB: number;
    switch (key) {
      case "date":
        valA = a.goalTargetDate ?? 0;
        valB = b.goalTargetDate ?? 0;
        break;
      case "progress":
        valA =
          a.goalTargetAmount > 0 ? a.currentAmount / a.goalTargetAmount : 0;
        valB =
          b.goalTargetAmount > 0 ? b.currentAmount / b.goalTargetAmount : 0;
        break;
      case "targetAmount":
        valA = a.goalTargetAmount ?? 0;
        valB = b.goalTargetAmount ?? 0;
        break;
      case "amountSaved":
        valA = a.currentAmount ?? 0;
        valB = b.currentAmount ?? 0;
        break;
      default:
        return 0;
    }
    return dir === "asc" ? valA - valB : valB - valA;
  });
}

function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(2);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GoalsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  const [goals, setGoals] = useState<any[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [pendingDeleteGoal, setPendingDeleteGoal] = useState<any>(null);
  const [successTitle, setSuccessTitle] = useState("");
  const [successDescription, setSuccessDescription] = useState("");
  const [successIcon, setSuccessIcon] = useState<any>("check-circle");
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const successSheetRef = useRef<BottomSheetModal>(null);
  const deleteSheetSnapPoints = useMemo(() => ["34%"], []);
  const pageTransition = useRef(new Animated.Value(0)).current;
  const isLeavingRef = useRef(false);

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const getSortOptionLabel = useCallback(
    (key: SortKey) => {
      switch (key) {
        case "date":
          return t("goals.targetDate");
        case "progress":
          return t("goals.sort.progress");
        case "targetAmount":
          return t("goals.targetAmount");
        case "amountSaved":
          return t("goals.sort.amountSaved");
        default:
          return "";
      }
    },
    [t],
  );

  const handleBack = useCallback(() => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    hapticTap();
    Animated.timing(pageTransition, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      router.replace("/(tabs)/" as any);
    });
  }, [pageTransition, router]);

  useFocusEffect(
    useCallback(() => {
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
    useCallback(() => {
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

  const handleSortSelect = (key: SortKey) => {
    hapticSelection();
    if (key !== sortKey) {
      const opt = SORT_OPTIONS.find((o) => o.key === key)!;
      setSortKey(key);
      setSortDir(opt.defaultDir);
    }
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeUserGoals(
      user.uid,
      ({ goals, totalSaved, totalTarget }) => {
        setGoals(goals);
        setTotalSaved(totalSaved);
        setTotalTarget(totalTarget);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // ── Contribution ──────────────────────────────────────────────────
  const handleContributionSubmit = async (amount: number, reason?: string) => {
    if (!selectedGoal || !user) return;
    try {
      await addGoalContribution({
        userUid: user.uid,
        goal: selectedGoal,
        amount,
        reason,
      });

      hapticSuccess();
      setSuccessTitle(t("goals.contributionAddedTitle"));
      setSuccessDescription(t("goals.contributionSuccess"));
      setSuccessIcon("add-circle");
      requestAnimationFrame(() => successSheetRef.current?.present());
      setShowContributionModal(false);
      setSelectedGoal(null);
    } catch (error) {
      hapticError();
      Alert.alert(t("error"), String(error));
    }
  };

  const handleEdit = (goal: any) => {
    hapticTap();
    router.push({
      pathname: "./create",
      params: {
        id: goal.id,
        edit: "true",
        goal: goal.goal,
        goalTargetAmount: goal.goalTargetAmount?.toString(),
        goalTargetCurrency: goal.goalTargetCurrency,
        goalTargetDate: goal.goalTargetDate?.toString(),
        currentAmount: goal.currentAmount?.toString(),
      },
    });
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = (goal: any) => {
    hapticWarning();
    setPendingDeleteGoal(goal);
    deleteSheetRef.current?.present();
  };

  const handleCancelDelete = () => {
    hapticTap();
    deleteSheetRef.current?.dismiss();
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteGoal) return;
    try {
      hapticWarning();
      await deleteGoal(pendingDeleteGoal.id);
      deleteSheetRef.current?.dismiss();
      hapticSuccess();
      setSuccessTitle(t("goals.goalDeletedTitle"));
      setSuccessDescription(t("goals.deleteSuccess"));
      setSuccessIcon("delete-forever");
      requestAnimationFrame(() => successSheetRef.current?.present());
    } catch (error) {
      hapticError();
      Alert.alert(t("error"), String(error));
    }
  };

  // ── Derived ───────────────────────────────────────────────────────
  const overallProgress =
    totalTarget > 0 ? Math.min(totalSaved / totalTarget, 1) : 0;
  const remaining = Math.max(totalTarget - totalSaved, 0);
  const formattedTotalSaved = formatCompactNumber(totalSaved);
  const formattedRemaining = formatCompactNumber(remaining);

  const sortedGoals = sortGoals(goals, sortKey, sortDir);
  const searchEnabled = goals.length > 3;
  const normalizedSearch = searchEnabled
    ? searchQuery.trim().toLowerCase()
    : "";
  const visibleGoals = sortedGoals.filter((goal) => {
    if (!normalizedSearch) return true;
    return String(goal.goal ?? "")
      .toLowerCase()
      .includes(normalizedSearch);
  });

  const activeSortOption = SORT_OPTIONS.find((o) => o.key === sortKey)!;
  const headerSurface = isDark ? "rgba(124,58,237,0.10)" : "#EDE9FE";
  const headerBorder = isDark ? "rgba(196,181,253,0.22)" : "#C4B5FD";
  const sheetBg = isDark ? "#181124" : "#FFFFFF";
  const sheetHandle = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)";
  const sheetTitle = isDark ? "#F5F3FF" : "#1F2937";
  const sheetText = isDark ? "rgba(255,255,255,0.75)" : "#4B5563";
  const sheetBorder = isDark ? "rgba(196,181,253,0.3)" : "rgba(124,58,237,0.2)";
  const sortSurface = isDark ? "rgba(124,58,237,0.08)" : "#FFFFFF";
  const sortBorder = isDark
    ? "rgba(196,181,253,0.25)"
    : "rgba(124,58,237,0.16)";
  const sortText = isDark ? "#EDE9FE" : "#4C1D95";
  const searchBg = isDark ? "rgba(124,58,237,0.10)" : "#FFFFFF";
  const searchBorder = isDark
    ? "rgba(196,181,253,0.25)"
    : "rgba(124,58,237,0.18)";
  const searchText = isDark ? "#F5F3FF" : "#1F2937";
  const searchPlaceholder = isDark ? "rgba(255,255,255,0.45)" : "#6B7280";
  const floatingButtonBottom =
    Platform.OS === "ios"
      ? Math.max(insets.bottom + 100, 86)
      : Math.max(insets.bottom + 88, 76);
  const scrollBottomSpacing = floatingButtonBottom + 86;
  const bottomSheetInset =
    Platform.OS === "ios"
      ? Math.max(insets.bottom + 74, 88)
      : Math.max(insets.bottom + 64, 76);

  return (
    <BottomSheetModalProvider>
      <View
        style={[
          styles.safeArea,
          { paddingTop: insets.top, backgroundColor: headerSurface },
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
                    style={[
                      styles.backButton,
                      isDark ? styles.backButtonDark : styles.backButtonLight,
                    ]}
                    onPress={handleBack}
                    accessibilityRole="button"
                    accessibilityLabel="Back to home"
                  >
                    <MaterialIcons
                      name="arrow-back"
                      size={18}
                      color={isDark ? "#C4B5FD" : "#7C3AED"}
                    />
                  </Pressable>
                  <ThemedText style={styles.pageTitle}>
                    {t("goals.title")}
                  </ThemedText>
                </View>
              </View>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: scrollBottomSpacing },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* Total Saved Card */}
              <View style={styles.summaryCard}>
                <LinearGradient
                  colors={["#B166F8", "#864CBD", "#435799"]}
                  start={{ x: 0.1, y: 0.3 }}
                  end={{ x: 0.9, y: 0.8 }}
                  style={styles.summaryGradient}
                >
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIconWrap}>
                      <MaterialIcons
                        name="account-balance-wallet"
                        size={20}
                        color="#FFF"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.summaryLabel}>
                        {t("goals.totalSaved")}
                      </ThemedText>
                      <ThemedText style={styles.summaryAmount}>
                        ${formattedTotalSaved}
                      </ThemedText>
                    </View>
                    <Pressable
                      style={styles.addSmallBtn}
                      onPress={() => {
                        hapticTap();
                        router.push("./create");
                      }}
                    >
                      <View style={styles.addSmallRow}>
                        <MaterialIcons
                          name="add-circle-outline"
                          size={14}
                          color="#FFF"
                        />
                        <ThemedText style={styles.addSmallText}>
                          {t("common.add")}
                        </ThemedText>
                      </View>
                    </Pressable>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${overallProgress * 100}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.progressMeta}>
                    <ThemedText style={styles.progressLabel}>
                      {t("goals.overallProgress")}
                    </ThemedText>
                    <ThemedText style={styles.progressPercent}>
                      {(overallProgress * 100).toFixed(1)}%
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.remainingText}>
                    ${formattedRemaining} {t("goals.remainingToReachAllGoals")}
                  </ThemedText>
                </LinearGradient>
              </View>
              {searchEnabled ? (
                <View
                  style={[
                    styles.searchWrap,
                    { backgroundColor: searchBg, borderColor: searchBorder },
                  ]}
                >
                  <MaterialIcons
                    name="search"
                    size={18}
                    color={isDark ? "#C4B5FD" : "#7C3AED"}
                  />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={[styles.searchInput, { color: searchText }]}
                    placeholder={t("goals.searchPlaceholder")}
                    placeholderTextColor={searchPlaceholder}
                    onFocus={hapticSelection}
                  />
                  {searchQuery.length > 0 ? (
                    <Pressable
                      onPress={() => {
                        hapticTap();
                        setSearchQuery("");
                      }}
                      style={styles.searchClearBtn}
                    >
                      <MaterialIcons
                        name="close"
                        size={16}
                        color={isDark ? "#E5E7EB" : "#6B7280"}
                      />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
              <View
                style={[
                  styles.sortSection,
                  { backgroundColor: sortSurface, borderColor: sortBorder },
                ]}
              >
                <View style={styles.sortHeaderRow}>
                  <View style={styles.sortHeaderLeft}>
                    <MaterialIcons
                      name="tune"
                      size={16}
                      color={isDark ? "#C4B5FD" : "#7C3AED"}
                    />
                    <ThemedText style={styles.sortHeaderTitle}>
                      {t("goals.sortGoals")}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[styles.sortHeaderMeta, { color: sortText }]}
                  >
                    {getSortOptionLabel(activeSortOption.key)}
                  </ThemedText>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sortChipsRow}
                >
                  {SORT_OPTIONS.map((opt) => {
                    const isActive = opt.key === sortKey;
                    return (
                      <Pressable
                        key={opt.key}
                        style={[
                          styles.sortChip,
                          isActive && styles.sortChipActive,
                        ]}
                        onPress={() => handleSortSelect(opt.key)}
                      >
                        <MaterialIcons
                          name={opt.icon}
                          size={14}
                          color={
                            isActive
                              ? "#FFFFFF"
                              : isDark
                                ? "#C4B5FD"
                                : "#7C3AED"
                          }
                        />
                        <ThemedText
                          style={[
                            styles.sortChipText,
                            isActive && styles.sortChipTextActive,
                          ]}
                        >
                          {getSortOptionLabel(opt.key)}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={styles.sortDirWrap}>
                  <Pressable
                    style={[
                      styles.sortDirOption,
                      sortDir === "asc" && styles.sortDirOptionActive,
                    ]}
                    onPress={() => {
                      hapticSelection();
                      setSortDir("asc");
                    }}
                  >
                    <MaterialIcons
                      name="north"
                      size={14}
                      color={
                        sortDir === "asc"
                          ? "#FFFFFF"
                          : isDark
                            ? "#C4B5FD"
                            : "#7C3AED"
                      }
                    />
                    <ThemedText
                      style={[
                        styles.sortDirOptionText,
                        sortDir === "asc" && styles.sortDirOptionTextActive,
                      ]}
                    >
                      {t("goals.sort.ascending")}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.sortDirOption,
                      sortDir === "desc" && styles.sortDirOptionActive,
                    ]}
                    onPress={() => {
                      hapticSelection();
                      setSortDir("desc");
                    }}
                  >
                    <MaterialIcons
                      name="south"
                      size={14}
                      color={
                        sortDir === "desc"
                          ? "#FFFFFF"
                          : isDark
                            ? "#C4B5FD"
                            : "#7C3AED"
                      }
                    />
                    <ThemedText
                      style={[
                        styles.sortDirOptionText,
                        sortDir === "desc" && styles.sortDirOptionTextActive,
                      ]}
                    >
                      {t("goals.sort.descending")}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              {/* Goal Cards */}
              {goals.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons
                    name="savings"
                    size={52}
                    color="rgba(124,58,237,0.25)"
                  />
                  <ThemedText style={styles.emptyTitle}>
                    {t("goals.emptyTitle")}
                  </ThemedText>
                  <ThemedText style={styles.emptySubtext}>
                    {t("goals.emptySubtext")}
                  </ThemedText>
                </View>
              ) : visibleGoals.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons
                    name="search-off"
                    size={46}
                    color="rgba(124,58,237,0.28)"
                  />
                  <ThemedText style={styles.emptyTitle}>
                    {t("goals.emptySearchTitle")}
                  </ThemedText>
                  <ThemedText style={styles.emptySubtext}>
                    {t("goals.emptySearchSubtext")}
                  </ThemedText>
                </View>
              ) : (
                visibleGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    id={goal.id}
                    title={goal.goal}
                    currentAmount={goal.currentAmount || 0}
                    targetAmount={goal.goalTargetAmount}
                    targetCurrency={goal.goalTargetCurrency}
                    targetDate={goal.goalTargetDate}
                    myContributions={Object.entries(goal.sharedLogs ?? {})
                      .filter(
                        ([, log]: [string, any]) =>
                          !log?.userUid || log.userUid === user?.uid,
                      )
                      .map(([logKey, log]: [string, any]) => ({
                        amount: Number(log?.amount ?? 0),
                        currency: String(
                          log?.currency ||
                            normalizeCurrencyCode(goal.goalTargetCurrency) ||
                            "usd",
                        ),
                        createdAt: Number(log?.createdAt ?? logKey ?? 0),
                        reason: String(log?.reason || ""),
                      }))
                      .filter(
                        (log: any) =>
                          Number.isFinite(log.amount) && log.amount > 0,
                      )
                      .sort((a: any, b: any) => b.createdAt - a.createdAt)}
                    onContribute={() => {
                      hapticTap();
                      setSelectedGoal(goal);
                      setShowContributionModal(true);
                    }}
                    onEdit={() => handleEdit(goal)}
                    onDelete={() => handleDelete(goal)}
                  />
                ))
              )}
            </ScrollView>

            <ContributionModal
              visible={showContributionModal}
              onClose={() => {
                setShowContributionModal(false);
                setSelectedGoal(null);
              }}
              onSubmit={handleContributionSubmit}
              currency={selectedGoal?.goalTargetCurrency || "usd"}
              targetAmount={selectedGoal?.goalTargetAmount}
              currentAmount={selectedGoal?.currentAmount || 0}
            />

            <Pressable
              style={[styles.fabAddButton, { bottom: floatingButtonBottom }]}
              onPress={() => {
                hapticTap();
                router.push("./create");
              }}
              accessibilityRole="button"
              accessibilityLabel={t("common.add")}
            >
              <MaterialIcons name="add" size={28} color="#FFFFFF" />
            </Pressable>
          </ThemedView>
        </Animated.View>
      </View>

      <BottomSheetModal
        ref={deleteSheetRef}
        snapPoints={deleteSheetSnapPoints}
        index={0}
        bottomInset={bottomSheetInset}
        onDismiss={() => setPendingDeleteGoal(null)}
        handleIndicatorStyle={[
          styles.sheetHandle,
          { backgroundColor: sheetHandle },
        ]}
        backgroundStyle={[styles.sheetBackground, { backgroundColor: sheetBg }]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        <BottomSheetView style={styles.sheetContent}>
          <ThemedText style={[styles.sheetTitle, { color: sheetTitle }]}>
            {t("goals.deleteTitle")}
          </ThemedText>
          <ThemedText style={[styles.sheetDescription, { color: sheetText }]}>
            {t("goals.deleteConfirm")}
          </ThemedText>
          <View style={styles.sheetActions}>
            <Pressable
              style={[
                styles.sheetButton,
                styles.sheetButtonSecondary,
                { borderColor: sheetBorder },
              ]}
              onPress={handleCancelDelete}
            >
              <View style={styles.sheetBtnRow}>
                <MaterialIcons
                  name="close"
                  size={16}
                  color={isDark ? "#E5E7EB" : "#374151"}
                />
                <ThemedText style={styles.sheetButtonSecondaryText}>
                  {t("common.cancel")}
                </ThemedText>
              </View>
            </Pressable>
            <Pressable
              style={[styles.sheetButton, styles.sheetButtonDanger]}
              onPress={handleConfirmDelete}
            >
              <View style={styles.sheetBtnRow}>
                <MaterialIcons
                  name="delete-forever"
                  size={16}
                  color="#FFFFFF"
                />
                <ThemedText style={styles.sheetButtonDangerText}>
                  {t("common.delete")}
                </ThemedText>
              </View>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      <FeedbackBottomSheet
        modalRef={successSheetRef}
        isDark={isDark}
        title={successTitle}
        description={successDescription}
        actionLabel={t("common.confirm")}
        titleIcon={successIcon}
        actionIcon="check-circle"
        bottomInset={bottomSheetInset}
        onAction={() => successSheetRef.current?.dismiss()}
      />
    </BottomSheetModalProvider>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageTitle: { fontSize: 26, fontWeight: "700", fontFamily: Fonts.sansBlack },
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

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 120 },

  summaryCard: {
    borderRadius: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  summaryIconWrap: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
  },
  summaryAmount: { fontSize: 22, fontWeight: "700", color: "#FFF" },
  addSmallBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addSmallRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addSmallText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: "100%", backgroundColor: "#FFF", borderRadius: 4 },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  progressPercent: { fontSize: 12, color: "#FFF", fontWeight: "600" },
  remainingText: { fontSize: 12, color: "rgba(255,255,255,0.65)" },
  searchWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 0,
  },
  searchClearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124,58,237,0.12)",
  },
  sortSection: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  sortHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sortHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sortHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.9,
  },
  sortHeaderMeta: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
  },
  sortChipsRow: {
    paddingRight: 6,
    gap: 8,
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  sortChipActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7C3AED",
  },
  sortChipTextActive: {
    color: "#FFFFFF",
  },
  sortDirWrap: {
    flexDirection: "row",
    gap: 8,
  },
  sortDirOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    backgroundColor: "rgba(124,58,237,0.08)",
    paddingVertical: 8,
    borderRadius: 10,
  },
  sortDirOptionActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  sortDirOptionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C3AED",
  },
  sortDirOptionTextActive: {
    color: "#FFFFFF",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", opacity: 0.45 },
  emptySubtext: { fontSize: 14, opacity: 0.35, textAlign: "center" },

  fabAddButton: {
    position: "absolute",
    right: 20,
    zIndex: 1200,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    width: 44,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sheetDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  sheetButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  sheetButtonSecondary: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  sheetButtonSecondaryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sheetButtonDanger: {
    backgroundColor: "#EF4444",
  },
  sheetButtonDangerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sheetBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
