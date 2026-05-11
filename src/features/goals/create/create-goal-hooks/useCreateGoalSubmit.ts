import { useI18n } from "@/hooks/use-i18n";
import { hapticError, hapticSuccess } from "@/src/utils/haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import type { FormValues } from "../constants";
import { useSaveGoalMutation } from "./useSaveGoalMutation";

export function useCreateGoalSubmit(userUid?: string) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = params.edit === "true";
  const saveGoalMutation = useSaveGoalMutation(userUid);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successDescription, setSuccessDescription] = useState("");

  const onSubmit = useCallback(
    async (data: FormValues) => {
      if (!userUid) return;

      const targetNum = parseFloat(data.targetAmount);
      const currentNum = data.currentAmount
        ? parseFloat(data.currentAmount)
        : 0;

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

      try {
        await saveGoalMutation.mutateAsync({
          goalId: params.id?.toString(),
          isEditing,
          data,
        });

        hapticSuccess();
        if (isEditing && params.id) {
          setSuccessTitle(t("goals.goalUpdatedTitle"));
          setSuccessDescription(t("goals.updateSuccess"));
        } else {
          setSuccessTitle(t("goals.goalCreatedTitle"));
          setSuccessDescription(t("goals.createSuccess"));
        }
        setSuccessVisible(true);
      } catch (error) {
        hapticError();
        Alert.alert(t("error"), String(error));
      }
    },
    [isEditing, params.id, saveGoalMutation, t, userUid],
  );

  const closeSuccess = useCallback(() => {
    setSuccessVisible(false);
    router.replace("/(tabs)/goals");
  }, [router]);

  return {
    isEditing,
    onSubmit,
    saving: saveGoalMutation.isPending,
    successVisible,
    successTitle,
    successDescription,
    closeSuccess,
  };
}

