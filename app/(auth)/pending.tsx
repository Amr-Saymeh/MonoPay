import React, { useEffect } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import Animated, {
    FadeInDown,
    FadeInUp,
    ZoomIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/src/providers/AuthProvider";

export default function PendingScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { signOut, signingOut, profile } = useAuth();

  useEffect(() => {
    if (profile && Number(profile.type) !== 0) {
      router.replace("/(tabs)" as any);
    }
  }, [profile, router]);

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.duration(450)} style={styles.iconWrap}>
          <MaterialIcons name="hourglass-top" size={110} color="#8B5CF6" />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(450).delay(80)}
          style={styles.textBlock}
        >
          <ThemedText style={styles.title}>{t("accountPending")}</ThemedText>
          <ThemedText style={styles.sub}>{t("pendingDescription")}</ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(450).delay(150)}
          style={styles.actions}
        >
          <GradientButton
            label={t("logout")}
            onPress={async () => {
              await signOut();
              router.replace("/(auth)/login" as any);
            }}
            loading={signingOut}
          />
        </Animated.View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconWrap: {
    marginBottom: 18,
  },
  textBlock: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.sansBlack,
    textAlign: "center",
  },
  sub: {
    opacity: 0.75,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    marginTop: 26,
  },
});
