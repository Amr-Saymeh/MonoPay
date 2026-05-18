import { useEffect, useState } from "react";

import { Keyboard, Platform } from "react-native";

const IOS_KEYBOARD_SHOW_EVENT = "keyboardWillShow";
const IOS_KEYBOARD_HIDE_EVENT = "keyboardWillHide";
const DEFAULT_KEYBOARD_SHOW_EVENT = "keyboardDidShow";
const DEFAULT_KEYBOARD_HIDE_EVENT = "keyboardDidHide";

export function useKeyboardInset() {
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? IOS_KEYBOARD_SHOW_EVENT : DEFAULT_KEYBOARD_SHOW_EVENT;
    const hideEvent = Platform.OS === "ios" ? IOS_KEYBOARD_HIDE_EVENT : DEFAULT_KEYBOARD_HIDE_EVENT;

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardInset(event.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardInset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return keyboardInset;
}