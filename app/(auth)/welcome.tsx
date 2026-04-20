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

export default function WelcomeScreen() {
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    const id = setTimeout(() => {
      router.replace("/" as any);
    }, 1500);

    return () => clearTimeout(id);
  }, [router]);

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.duration(500)} style={styles.iconWrap}>
          <MaterialIcons name="check-circle" size={120} color="#22C55E" />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(120)}
          style={styles.textBlock}
        >
          <ThemedText style={styles.title}>{t("welcome")}</ThemedText>
          <ThemedText style={styles.sub}>{t("accountPending")}</ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(500).delay(220)}
          style={styles.button}
        >
          <GradientButton
            label={t("continue")}
            onPress={() => router.replace("/" as any)}
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
    marginBottom: 22,
  },
  textBlock: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontFamily: Fonts.sansBlack,
  },
  sub: {
    opacity: 0.75,
    textAlign: "center",
  },
  button: {
    width: "100%",
    marginTop: 26,
  },
});
