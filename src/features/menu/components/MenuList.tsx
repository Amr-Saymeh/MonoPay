import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useI18n } from "@/hooks/use-i18n";
import { menuItems } from '../constants';
import { styles } from '../styles';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';

export default function MenuList() {
  const { t } = useI18n();
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  const handleNavigate = (item: any) => {
    if (item.route) {
      router.push(item.route);
    }
  };

  const arrowBack = () => router.back();

  return (
    <View style={[styles.screenContainer, isDark && styles.darkScreen]}>
      <Text style={[styles.headerTitle, isDark && styles.darkHeaderTitle]}>{t("features")}</Text>
      <Ionicons
        name="arrow-back"
        size={24}
        color={isDark ? "#fff" : "#111"}
        style={styles.backButton}
        onPress={arrowBack}
      />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems
          .filter((item) => item.id !== '7')
          .map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.item,
                index === menuItems.length - 2 && styles.lastItem, // -2 because 7 is filtered out
                isDark && styles.darkItem
              ]}
              activeOpacity={0.7}
              onPress={() => handleNavigate(item)}
            >
              <View style={[
                styles.iconContainer, 
                { backgroundColor: item.color },
                isDark && styles.darkItem
              ]}>
                <Ionicons name={item.iconName} size={26} color="white" />
              </View>

              <View style={styles.textContainer}>
                <Text style={[styles.itemTitle, isDark && styles.darkItemTitle]}>{t(item.titleKey as any)}</Text>
                {item.subtitleKey && (
                  <Text style={[styles.itemSubtitle, isDark && styles.darkItemSubtitle]}>{t(item.subtitleKey as any)}</Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={22} color={isDark ? "rgba(255,255,255,0.3)" : "#C0C0C0"} />
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
}
