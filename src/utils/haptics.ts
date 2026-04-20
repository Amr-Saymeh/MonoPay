import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const canUseHaptics = Platform.OS !== "web";

function run(task: () => Promise<void>) {
  if (!canUseHaptics) return;
  void task().catch(() => {
    // Ignore device haptics failures.
  });
}

export function hapticTap() {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticSelection() {
  run(() => Haptics.selectionAsync());
}

export function hapticSuccess() {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function hapticWarning() {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

export function hapticError() {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}
