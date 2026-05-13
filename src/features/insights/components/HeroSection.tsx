import React, { memo } from "react";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { styles } from "../styles";
import { money, SupportedLanguage } from "../utils/insights";
import { Palette } from "./InsightsShared";

type HeroSectionProps = {
  avg: number;
  filteredLength: number;
  isRtl: boolean;
  language: SupportedLanguage;
  palette: Palette;
  primaryCurrency: string;
  profileName?: string | null;
  title: string;
};

export const HeroSection = memo(function HeroSection({
  avg,
  filteredLength,
  isRtl,
  language,
  palette,
  primaryCurrency,
  profileName,
  title,
}: HeroSectionProps) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <LinearGradient
        colors={palette.scheme === "dark" ? ["#24143A", "#211F5F", "#123B66"] : ["#B166F8", "#8B5CF6", "#4F7DDB"]}
        style={styles.hero}
      >
        <View style={[styles.heroTop, isRtl ? styles.rowRtl : null]}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name={isRtl ? "arrow-forward" : "arrow-back"} size={20} color="#fff" />
          </Pressable>
        </View>
        <Text style={[styles.heroTitle, isRtl ? styles.textRtl : null]}>{title}</Text>
        <Text style={[styles.heroSubtitle, isRtl ? styles.textRtl : null]}>
          {language === "ar"
            ? `لوحة تفاعلية متقدمة مبنية فقط من حركاتك أنت${profileName ? `، ${profileName}` : ""}.`
            : `An interactive analytics workspace built only from your own activity${profileName ? `, ${profileName}` : ""}.`}
        </Text>
        <View style={[styles.heroMiniRow, isRtl ? styles.rowRtl : null]}>
          <View style={styles.heroMini}>
            <Text style={[styles.heroMiniLabel, isRtl ? styles.textRtl : null]}>
              {language === "ar" ? "الحركات" : "Visible moves"}
            </Text>
            <Text style={[styles.heroMiniValue, isRtl ? styles.textRtl : null]}>{filteredLength}</Text>
          </View>
          <View style={styles.heroMini}>
            <Text style={[styles.heroMiniLabel, isRtl ? styles.textRtl : null]}>
              {language === "ar" ? "متوسط الحركة" : "Avg. move"}
            </Text>
            <Text style={[styles.heroMiniValue, isRtl ? styles.textRtl : null]}>
              {money(avg, primaryCurrency)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});