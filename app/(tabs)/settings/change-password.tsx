import React, { useMemo, useState } from "react";

import { useRouter } from "expo-router";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";
import { Alert, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { auth } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";

export default function ChangePasswordScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return (
      currentPassword.trim().length >= 6 &&
      newPassword.trim().length >= 6 &&
      newPassword === confirmPassword
    );
  }, [currentPassword, newPassword, confirmPassword]);

  const onChange = async () => {
    if (!user || !user.email || !auth.currentUser) {
      Alert.alert(t("error"), t("failedToSignIn"));
      return;
    }

    setSaving(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert(t("welcome"), t("saved"));
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("error");
      Alert.alert(t("error"), msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView
      style={[
        styles.screen,
        { paddingBottom: Math.max(16, insets.bottom + 16) },
      ]}
    >
      <AuthInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder={t("currentPassword")}
        secureTextEntry
      />
      <AuthInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder={t("newPassword")}
        secureTextEntry
      />
      <AuthInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder={t("confirmNewPassword")}
        secureTextEntry
      />
      <GradientButton
        label={t("updatePassword")}
        onPress={onChange}
        disabled={!canSave}
        loading={saving}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
});
