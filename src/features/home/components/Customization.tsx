import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useI18n } from "@/hooks/use-i18n";
import { menuItems } from '@/src/features/menu/constants';
import { useFeatures } from '@/src/providers/FeaturesProvider';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';
import { homeStyles as styles } from '../styles';

export default function Customization() {
    const { t } = useI18n();
    const { activeFeatures, toggleFeature } = useFeatures();
    const { colorScheme } = useThemeMode();
    const isDark = colorScheme === 'dark';

    const arrowBack = () => {
        if (activeFeatures.length !== 3) {
            Alert.alert(t("error"), t("Youmustselect3features"));
            return;
        }
        router.back();
    };

    return (
        <View style={[styles.custScreenContainer, isDark && styles.custScreenContainerDark]}>
            <Text style={[styles.custHeaderTitle, isDark && styles.custHeaderTitleDark]}>{t("customization")}</Text>

            <Ionicons
                name="arrow-back"
                size={24}
                color={isDark ? "#a78bfa" : "#111"}
                style={styles.custBackButton}
                onPress={arrowBack}
            />

            <ScrollView
                style={styles.custScrollContainer}
                contentContainerStyle={styles.custScrollContentContainer}
                showsVerticalScrollIndicator={false}
            >
                {menuItems
                    .filter((item) => item.id !== '7')
                    .map((item, index) => {
                        const isActive = activeFeatures.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.custItem,
                                    isDark && styles.custItemDark,
                                    isActive && (isDark ? styles.custActiveItemDark : styles.custActiveItem),
                                    (index + 1) % 3 !== 0 && { marginRight: '3.5%' }
                                ]}
                                activeOpacity={0.7}
                                onPress={() => toggleFeature(item.id)}
                            >
                                <View
                                    style={[
                                        styles.custIconContainer,
                                        { backgroundColor: isActive ? (isDark ? '#6366f1' : '#566CB2') : item.color }
                                    ]}
                                >
                                    <Ionicons
                                        name={item.iconName}
                                        size={26}
                                        color="white"
                                    />
                                </View>

                                <View style={styles.custTextContainer}>
                                    <Text style={[styles.custItemTitle, isDark && styles.custTextDark]}>{t(item.titleKey as any)}</Text>
                                    {item.subtitleKey && (
                                        <Text style={[styles.custItemSubtitle, isDark && styles.darkSecondaryText]}>{t(item.subtitleKey as any)}</Text>
                                    )}
                                </View>
                                
                            </TouchableOpacity>
                        );
                    })}
            </ScrollView>
        </View>
    );
}
