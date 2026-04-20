import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BundlesStyles as styles } from '../styles';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Bundle, BundleCardProps } from '../types';
import { CATEGORY_META, THEME, CURRENCY_SYMBOL } from '../constants';
import { useI18n } from '@/hooks/use-i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';

export default function BundleCardItem({ bundle, onEdit, onDelete }: BundleCardProps) {
  const { t } = useI18n() as any;
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  const isPurple = bundle.theme === 'purple';
  const textStyle = isPurple || isDark ? styles.textLight : styles.textDark;
  const secondaryTextStyle = isPurple || isDark ? styles.textSecondaryLight : styles.textSecondaryDark;

  const CardContainer = ({ children }: { children: React.ReactNode }) => {
    if (isPurple && !isDark) {
      return (
        <LinearGradient
          colors={['#7C4DFF', '#4F00D0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardInner}
        >
          {children}
        </LinearGradient>
      );
    }
    return (
      <View style={[
        styles.cardInner,
        isDark ? styles.darkCard : styles.lightTheme,
        isDark && { minHeight: 180, borderRadius: 24 }
      ]}>
        {children}
      </View>
    );
  };

  return (
    <View style={styles.cardWrapper}>
      <CardContainer>
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={[
            styles.bundleIconContainer,
            { backgroundColor: isPurple || isDark ? 'rgba(255,255,255,0.1)' : '#E0E7FF' }
          ]}>
            <Text style={styles.bundleIcon}>{bundle.icon || '📦'}</Text>
          </View>

          <View style={styles.bundleInfo}>
            <Text style={[styles.bundleTitle, textStyle]}>{bundle.name}</Text>
            <Text style={[styles.bundleBadge, secondaryTextStyle]}>
              {bundle.items?.length || 0} {t('items')} • {bundle.recurring ? t('recurring') : t('manual')}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => onEdit(bundle)} style={styles.actionIcon}>
              <Ionicons name="pencil-outline" size={20} color={isPurple || isDark ? '#a78bfa' : '#4F00D0'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(bundle.id)} style={styles.actionIcon}>
              <Ionicons name="trash-outline" size={20} color={isPurple || isDark ? 'rgba(255,255,255,0.7)' : '#FF3B30'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Items Section */}
        <View>
          {(bundle.items || []).map((item, index) => {
            const meta = CATEGORY_META[item.category || ''] || { icon: '📦', bg: '#F2F2F7' };
            return (
              <View key={index} style={[styles.itemRow, (!isPurple && !isDark) && styles.itemRowLight, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={[
                  { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
                  { backgroundColor: isPurple || isDark ? 'rgba(255,255,255,0.1)' : meta.bg }
                ]}>
                  <Text style={{ fontSize: 16 }}>{meta.icon}</Text>
                </View>
                <Text style={[styles.itemName, textStyle]}>{item.name}</Text>
                <Text style={[styles.itemPrice, textStyle]}>
                  {CURRENCY_SYMBOL[item.currency] || ''}{Number(item.price || 0).toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer Section */}
        <View style={[styles.cardFooter, { borderTopColor: isPurple || isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <Text style={[styles.totalLabel, secondaryTextStyle]}>{t('totalCost')}</Text>
          <Text style={[styles.totalAmount, (isPurple || isDark) && styles.textLight, isDark && { color: '#a78bfa' }]}>
            ₪{Number(bundle.totalPrice || 0).toFixed(2)}
          </Text>
        </View>
      </CardContainer>
    </View>
  );
}
