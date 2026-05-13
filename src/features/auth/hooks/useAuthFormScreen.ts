import React, { useCallback, useRef } from "react";
import {
  Platform,
  ScrollView,
  findNodeHandle,
  type TextInput,
} from "react-native";

export function useAuthFormScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const scrollToField = useCallback(
    (fieldRef: React.RefObject<TextInput | null>) => {
      const node = findNodeHandle(fieldRef.current);
      if (!node) return;

      setTimeout(() => {
        (scrollRef.current as any)?.scrollResponderScrollNativeHandleToKeyboard?.(
          node,
          96,
          true,
        );
      }, Platform.OS === "android" ? 80 : 0);
    },
    [],
  );

  return {
    scrollRef,
    scrollToField,
  };
}