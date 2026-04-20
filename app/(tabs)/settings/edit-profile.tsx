import React, { useMemo, useState } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/src/providers/AuthProvider";
import { updateUserProfile } from "@/src/services/user.service";

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: full.trim(), last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts.at(-1) ?? "" };
}

export default function EditProfileScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, profile } = useAuth();

  const border = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const surfacePressed = useThemeColor({}, "surfacePressed");

  const initial = useMemo(() => {
    const name = profile?.name ?? "";
    const { first, last } = splitName(name);
    return {
      first,
      last,
      phone: String(profile?.number ?? ""),
      address: profile?.address ?? "",
    };
  }, [profile]);

  const [firstName, setFirstName] = useState(initial.first);
  const [lastName, setLastName] = useState(initial.last);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [saving, setSaving] = useState(false);

  const avatarUri = profile?.personalImage;
  const email = user?.email ?? profile?.email ?? "";

  const canSave =
    firstName.trim().length > 0 &&
    phone.trim().length > 0 &&
    address.trim().length > 0;

  const onSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name: `${firstName} ${lastName}`.trim(),
        number: phone.trim(),
        address: address.trim(),
      });
      Alert.alert(t("welcome"), t("saved"));
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      Alert.alert(t("error"), msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <View
        style={[styles.card, { borderColor: border, backgroundColor: surface }]}
      >
        <View style={styles.avatarRow}>
          <View style={styles.avatarWrap}>
            {typeof avatarUri === "string" && avatarUri.trim().length > 0 ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: surfacePressed },
                ]}
              />
            )}
          </View>
          <View style={styles.avatarText}>
            <ThemedText type="subtitle" style={{ fontFamily: Fonts.sansBlack }}>
              {profile?.name ?? ""}
            </ThemedText>
            <ThemedText style={{ opacity: 0.7 }}>{email}</ThemedText>
            <GradientButton
              label={t("retakePhoto")}
              onPress={() =>
                router.push("/(tabs)/settings/avatar-camera" as any)
              }
              style={{ marginTop: 10 }}
            />
          </View>
        </View>

        <View style={styles.form}>
          <AuthInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t("firstName")}
            autoCapitalize="words"
          />
          <AuthInput
            value={lastName}
            onChangeText={setLastName}
            placeholder={t("lastName")}
            autoCapitalize="words"
          />
          <AuthInput
            value={phone}
            onChangeText={setPhone}
            placeholder={t("phone")}
            keyboardType="phone-pad"
          />
          <AuthInput
            value={address}
            onChangeText={setAddress}
            placeholder={t("address")}
            autoCapitalize="sentences"
          />

          <GradientButton
            label={t("save")}
            onPress={onSave}
            disabled={!canSave}
            loading={saving}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  avatarRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    flex: 1,
  },
  form: {
    gap: 12,
  },
});
