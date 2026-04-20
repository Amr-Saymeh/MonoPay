import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from "@/hooks/use-i18n";   
import { useThemeMode } from '@/src/providers/ThemeModeProvider';
import { homeStyles as styles } from '../styles';

export default function Advertisement() {
  const { t } = useI18n();                    
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.adContainer, isDark && styles.darkCard]}>
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#B166F8', '#9B5DD4', '#566CB2']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.adGradient}
      >
        <View style={styles.adContent}>
          <Text style={styles.adText}>{t("advertisement")}</Text>
        </View>

        <View style={[styles.adBigCircleRight, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
        <View style={[styles.adBigCircleLeft, isDark && { backgroundColor: 'rgba(255,255,255,0.03)' }]} />
      </LinearGradient>
    </View>
  );
}
