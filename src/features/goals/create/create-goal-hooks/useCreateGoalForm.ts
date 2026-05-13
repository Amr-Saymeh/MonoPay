import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { mapCurrency, type FormValues } from "../constants";

type CreateGoalParams = {
  id?: unknown;
  goal?: unknown;
  goalTargetAmount?: unknown;
  goalTargetCurrency?: unknown;
  goalTargetDate?: unknown;
  currentAmount?: unknown;
};

function getDefaultValues(params: CreateGoalParams): FormValues {
  return {
    title: params.goal?.toString() ?? "",
    targetAmount: params.goalTargetAmount?.toString() ?? "",
    currentAmount: params.currentAmount?.toString() ?? "",
    currency: mapCurrency(params.goalTargetCurrency?.toString()),
    targetDate: params.goalTargetDate
      ? parseInt(params.goalTargetDate.toString())
      : null,
  };
}

export function useCreateGoalForm(
  params: CreateGoalParams,
  isFocused: boolean,
) {
  const {
    id,
    goal,
    goalTargetAmount,
    goalTargetCurrency,
    goalTargetDate,
    currentAmount,
  } = params;
  const defaultValues = useMemo(
    () =>
      getDefaultValues({
        goal,
        goalTargetAmount,
        goalTargetCurrency,
        goalTargetDate,
        currentAmount,
      }),
    [
      goal,
      goalTargetAmount,
      goalTargetCurrency,
      goalTargetDate,
      currentAmount,
    ],
  );

  const form = useForm<FormValues>({
    mode: "all",
    defaultValues,
  });

  const { reset, watch } = form;

  useEffect(() => {
    if (!isFocused) return;
    reset(defaultValues);
  }, [defaultValues, id, isFocused, reset]);

  const watchedTitle = watch("title");
  const watchedTargetAmount = watch("targetAmount");
  const watchedCurrency = watch("currency");
  const watchedTargetDate = watch("targetDate");
  const previewAmount = `${(parseFloat(watchedTargetAmount) || 0).toFixed(2)} ${watchedCurrency.toUpperCase()}`;

  return {
    ...form,
    errors: form.formState.errors,
    watchedTitle,
    watchedTargetDate,
    previewAmount,
  };
}

