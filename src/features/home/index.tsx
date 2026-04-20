import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import HomeHeader from './components/HomeHeader';
import TotalBalance from './components/TotalBalance';
import QuickActions from './components/QuickActions';
import Advertisement from './components/Advertisement';
import Customization from './components/Customization';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';
import { homeStyles as styles } from './styles';

export function HomeFeature() {
    const { colorScheme } = useThemeMode();
    const isDark = colorScheme === 'dark';

    return (
        <ScrollView style={[isDark && styles.darkBackground]}>
            <HomeHeader />
            <TotalBalance />
            <QuickActions />
            <Advertisement />
        </ScrollView>
    );
}

export { Customization as CustomizationFeature };
