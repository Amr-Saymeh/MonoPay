import { hapticSelection } from "@/src/utils/haptics";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PanResponder } from "react-native";
import { useDefaultStyles } from "react-native-ui-datepicker";

import { useGoalDatePickerStyles } from "./useGoalDatePickerStyles";

export function useCreateGoalDatePicker(
  watchedTargetDate: number | null,
  isDark: boolean,
) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const initialPickerDate = watchedTargetDate
    ? new Date(watchedTargetDate)
    : new Date();
  const [pickerMonth, setPickerMonth] = useState(
    initialPickerDate.getMonth() + 1,
  );
  const [pickerYear, setPickerYear] = useState(
    initialPickerDate.getFullYear(),
  );
  const defaultDatePickerStyles = useDefaultStyles();

  const todayStart = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const shiftPickerMonth = useCallback(
    (delta: number) => {
      const nextDate = new Date(pickerYear, pickerMonth - 1 + delta, 1);
      setPickerMonth(nextDate.getMonth() + 1);
      setPickerYear(nextDate.getFullYear());
    },
    [pickerMonth, pickerYear],
  );

  const pickerSwipeResponder = useMemo(
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

  useEffect(() => {
    if (!showDatePicker) return;
    const baseDate = watchedTargetDate
      ? new Date(watchedTargetDate)
      : new Date();
    setPickerMonth(baseDate.getMonth() + 1);
    setPickerYear(baseDate.getFullYear());
  }, [showDatePicker, watchedTargetDate]);

  const datePickerStyles = useGoalDatePickerStyles(
    defaultDatePickerStyles,
    isDark,
  );

  return {
    showDatePicker,
    setShowDatePicker,
    pickerMonth,
    pickerYear,
    setPickerMonth,
    setPickerYear,
    todayStart,
    datePickerStyles,
    pickerPanHandlers: pickerSwipeResponder.panHandlers,
  };
}

