import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useI18n } from "@/hooks/use-i18n";
import { menuItems } from '@/src/features/menu/constants'; // imports from new menu feature
import { useFeatures } from '@/src/providers/FeaturesProvider';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';
import { homeStyles as styles } from '../styles';

const customization = () => router.push("/CustomaztionFeture");

export default function QuickActions() {
  const { t } = useI18n();
  const { activeFeatures } = useFeatures();
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  const handleNavigate = (item: any) => {
    if (item.route) {
      router.push(item.route);
    }
  };

  return (
    <>
      <Text style={[styles.actionsTitle, isDark && styles.actionsTitleDark]}>{t("quickActions")}</Text>

      <TouchableOpacity onPress={customization}>
        <Text style={[styles.customizationLink, isDark && styles.customizationLinkDark]}>{t("customization")}</Text>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        {menuItems
          .filter((item) => activeFeatures.includes(item.id) || item.id === '7')
          .map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.actionItem}
              onPress={() => handleNavigate(item)}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: item.color }, isDark && styles.darkCard]}>
                <Ionicons name={item.iconName} size={40} color="white" />
              </View>
              <Text style={[styles.actionLabel, isDark && styles.actionLabelDark]}>{t(item.titleKey as any)}</Text>
            </TouchableOpacity>
          ))}
      </View>
    </>
  );
}
