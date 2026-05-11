import { useAuthSession } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import {
  hapticError,
  hapticSelection,
  hapticSuccess,
  hapticTap,
  hapticWarning,
} from "@/src/utils/haptics";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Animated, BackHandler, Easing, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  formatCompactNumber,
  getGoalsFloatingButtonBottom,
  getGoalsTheme,
  GOAL_DELETE_SHEET_SNAP_POINTS,
  SORT_OPTIONS,
  sortGoals,
  type SortDir,
  type SortKey,
} from "../constants";
import {
  useAddGoalContributionMutation,
  useDeleteGoalMutation,
  useGoalsQuery,
} from "../goals-hooks/useGoalsQuery";
import type { GoalRecord } from "../goals-services/goals.service";
import { GoalsScreenLayout } from "./GoalsScreenLayout";

export function GoalsScreenContent() {
  const { t } = useI18n();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthSession();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const pageTransition = useRef(new Animated.Value(0)).current;
  const isLeavingRef = useRef(false);
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const successSheetRef = useRef<BottomSheetModal>(null);

  const { goals, totalSaved, totalTarget } = useGoalsQuery(user?.uid).data;
  const addContribution = useAddGoalContributionMutation(user?.uid);
  const deleteGoal = useDeleteGoalMutation();
  const [selectedGoal, setSelectedGoal] = useState<GoalRecord | null>(null);
  const [pendingDeleteGoal, setPendingDeleteGoal] = useState<GoalRecord | null>(null);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successDescription, setSuccessDescription] = useState("");
  const [successIcon, setSuccessIcon] = useState<any>("check-circle");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const theme = getGoalsTheme(isDark);
  const deleteSheetSnapPoints = useMemo(() => GOAL_DELETE_SHEET_SNAP_POINTS, []);
  const floatingButtonBottom = getGoalsFloatingButtonBottom(Platform.OS, insets.bottom);
  const scrollBottomSpacing = floatingButtonBottom + 86;
  const overallProgress = totalTarget > 0 ? Math.min(totalSaved / totalTarget, 1) : 0;
  const visibleGoals = sortGoals(goals, sortKey, sortDir).filter((goal) =>
    goals.length > 3 && searchQuery.trim()
      ? String(goal.goal ?? "").toLowerCase().includes(searchQuery.trim().toLowerCase())
      : true,
  );
  const activeSortOption = SORT_OPTIONS.find((option) => option.key === sortKey)!;

  const getSortOptionLabel = useCallback(
    (key: SortKey) => {
      if (key === "date") return t("goals.targetDate");
      if (key === "progress") return t("goals.sort.progress");
      if (key === "targetAmount") return t("goals.targetAmount");
      return t("goals.sort.amountSaved");
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
    }).start(() => router.replace("/(tabs)/" as any));
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
      const hardwareSub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      const removeNavListener = navigation.addListener("beforeRemove", (event: any) => {
        const type = event?.data?.action?.type;
        if (type === "GO_BACK" || type === "POP" || type === "POP_TO_TOP") {
          event.preventDefault();
          onBackPress();
        }
      });
      return () => {
        hardwareSub.remove();
        removeNavListener();
      };
    }, [handleBack, navigation]),
  );

  const handleSortSelect = (key: SortKey) => {
    hapticSelection();
    if (key !== sortKey) {
      setSortKey(key);
      setSortDir(SORT_OPTIONS.find((option) => option.key === key)!.defaultDir);
    }
  };

  const handleContributionSubmit = async (amount: number, reason?: string) => {
    if (!selectedGoal || !user) return;
    try {
      await addContribution.mutateAsync({ goal: selectedGoal, amount, reason });
      hapticSuccess();
      setSuccessTitle(t("goals.contributionAddedTitle"));
      setSuccessDescription(t("goals.contributionSuccess"));
      setSuccessIcon("add-circle");
      setShowContributionModal(false);
      setSelectedGoal(null);
      setTimeout(() => successSheetRef.current?.present(), 240);
    } catch (error) {
      hapticError();
      Alert.alert(t("error"), String(error));
    }
  };

  const handleEdit = (goal: GoalRecord) => {
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

  const handleConfirmDelete = async () => {
    if (!pendingDeleteGoal) return;
    try {
      hapticWarning();
      await deleteGoal.mutateAsync(pendingDeleteGoal.id);
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

  return (
    <GoalsScreenLayout
      insets={insets}
      theme={theme}
      pageTransition={pageTransition}
      labels={buildGoalsLabels(t)}
      onBack={handleBack}
      onCreateGoal={() => router.push("./create")}
      scrollBottomSpacing={scrollBottomSpacing}
      formattedTotalSaved={formatCompactNumber(totalSaved)}
      formattedRemaining={formatCompactNumber(Math.max(totalTarget - totalSaved, 0))}
      overallProgress={overallProgress}
      searchEnabled={goals.length > 3}
      searchQuery={searchQuery}
      isDark={isDark}
      setSearchQuery={setSearchQuery}
      sortKey={sortKey}
      sortDir={sortDir}
      activeSortLabel={getSortOptionLabel(activeSortOption.key)}
      getSortOptionLabel={getSortOptionLabel}
      handleSortSelect={handleSortSelect}
      setSortDir={setSortDir}
      goals={goals}
      visibleGoals={visibleGoals}
      userUid={user?.uid}
      onContribute={(goal: GoalRecord) => {
        hapticTap();
        setSelectedGoal(goal);
        setShowContributionModal(true);
      }}
      handleEdit={handleEdit}
      handleDelete={(goal: GoalRecord) => {
        hapticWarning();
        setPendingDeleteGoal(goal);
        deleteSheetRef.current?.present();
      }}
      showContributionModal={showContributionModal}
      closeContributionModal={() => {
        setShowContributionModal(false);
        setSelectedGoal(null);
      }}
      handleContributionSubmit={handleContributionSubmit}
      selectedGoal={selectedGoal}
      floatingButtonBottom={floatingButtonBottom}
      deleteSheetRef={deleteSheetRef}
      deleteSheetSnapPoints={deleteSheetSnapPoints}
      handleCancelDelete={() => {
        hapticTap();
        deleteSheetRef.current?.dismiss();
      }}
      handleConfirmDelete={handleConfirmDelete}
      clearPendingDeleteGoal={() => setPendingDeleteGoal(null)}
      successSheetRef={successSheetRef}
      successTitle={successTitle}
      successDescription={successDescription}
      successIcon={successIcon}
    />
  );
}

function buildGoalsLabels(t: (key: any) => string) {
  return {
    title: t("goals.title"),
    totalSaved: t("goals.totalSaved"),
    add: t("common.add"),
    progress: t("goals.overallProgress"),
    remaining: t("goals.remainingToReachAllGoals"),
    searchPlaceholder: t("goals.searchPlaceholder"),
    sortTitle: t("goals.sortGoals"),
    sortAsc: t("goals.sort.ascending"),
    sortDesc: t("goals.sort.descending"),
    emptyTitle: t("goals.emptyTitle"),
    emptySubtext: t("goals.emptySubtext"),
    emptySearchTitle: t("goals.emptySearchTitle"),
    emptySearchSubtext: t("goals.emptySearchSubtext"),
    deleteTitle: t("goals.deleteTitle"),
    deleteConfirm: t("goals.deleteConfirm"),
    cancel: t("common.cancel"),
    delete: t("common.delete"),
    confirm: t("common.confirm"),
  };
}

