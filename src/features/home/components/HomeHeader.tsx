import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay
} from 'react-native-reanimated';
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from '@/src/providers/AuthProvider';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';
import { homeStyles as styles } from '../styles';

export default function HomeHeader() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    translateY.value = withSpring(0, {
      damping: 14,
      stiffness: 95,
      mass: 0.8,
    });
    opacity.value = withSpring(1, { duration: 800 });
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 90,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.headerContainer, isDark && styles.headerContainerDark, animatedStyle]}>
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#B166F8', '#9B5DD4', '#566CB2']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person" size={30} color="#fff" />
          </View>
          <View style={styles.menuIcon}>
            <Ionicons name="menu-outline" size={32} color="#fff" />
          </View>

          <View style={styles.headerTextContainer}>
            <View style={styles.greetingWrapper}>
              <Text style={styles.greeting}>{t("goodEvening")}</Text>
            </View>

            <Text style={styles.welcome}>
              {t("welcomeBack")}{' '}
            </Text>
            <Text style={styles.name}>{profile?.name}</Text>
          </View>

          <View style={styles.notificationWrapper}>
            <Ionicons name="notifications-outline" size={26} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
        </View>

        <View style={[styles.headerBigCircle, isDark && { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]} />
      </LinearGradient>
    </Animated.View>
  );
}
