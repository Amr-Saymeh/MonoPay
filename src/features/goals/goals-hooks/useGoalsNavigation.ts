import { hapticTap } from "@/src/utils/haptics";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import { Animated, BackHandler, Easing } from "react-native";

import type { GoalRecord } from "../goals-services/goals.service";

export function useGoalsNavigation() {
  const router = useRouter();
  const navigation = useNavigation();
  const pageTransition = useRef(new Animated.Value(0)).current;
  const isLeavingRef = useRef(false);

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
      const hardwareSub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      const removeNavListener = navigation.addListener(
        "beforeRemove",
        (event: any) => {
          const type = event?.data?.action?.type;
          if (type === "GO_BACK" || type === "POP" || type === "POP_TO_TOP") {
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

  const handleCreateGoal = () => {
    router.push("./create");
  };

  const handleEditGoal = (goal: GoalRecord) => {
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

  return {
    pageTransition,
    handleBack,
    handleCreateGoal,
    handleEditGoal,
  };
}
