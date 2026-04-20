import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, I18nManager } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useI18n } from "@/hooks/use-i18n";
import { PurchaseCardProps } from '../types';
import { CATEGORY_META, DEFAULT_META, CURRENCY_SYMBOL, DELETE_BTN_WIDTH } from '../constants';
import { PurchaseCardStyles as styles, DarkThemeStyles } from '../styles';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';

import * as Haptics from 'expo-haptics';

export default function PurchaseCard({
  item,
  onPress,
  onDelete,
}: PurchaseCardProps) {
  const { t } = useI18n() as any;
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';
  const swipeableRef = useRef<Swipeable>(null);
  const isRtl = I18nManager.isRTL;
  
  const meta = item.category ? (CATEGORY_META[item.category] ?? DEFAULT_META) : DEFAULT_META;
  const dateObj = new Date(item.createdAt);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  const symbol = item.currency ? (CURRENCY_SYMBOL[item.currency] ?? '$') : '$';
  const formattedAmount = `${symbol}${item.amount.toFixed(2)}`;
  
  const categoryName = item.category ? t(item.category) : '';
  const subtitle = categoryName 
    ? `${categoryName} • ${formattedDate} • ${item.time}` 
    : `${formattedDate} • ${item.time}`;

  const renderDeleteAction = () => {
    return (
      <View style={[styles.deleteBackground, { width: DELETE_BTN_WIDTH }]}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swipeableRef.current?.close();
            onDelete(item);
          }}
        >
          <Text style={styles.deleteActionText}>{t('delete').toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.cardWrapper}>
      <Swipeable
        ref={swipeableRef}
        friction={1.5}
        rightThreshold={30}
        leftThreshold={30}
        overshootFriction={8}
        onSwipeableWillOpen={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        renderRightActions={!isRtl ? renderDeleteAction : undefined}
        renderLeftActions={isRtl ? renderDeleteAction : undefined}
      >
        <TouchableOpacity
          style={[
            styles.card, 
            isRtl && { flexDirection: 'row-reverse' },
            isDark && DarkThemeStyles.darkCard
          ]}
          onPress={() => onPress?.(item)}
          activeOpacity={0.92}
        >
          <View style={[
            styles.iconContainer, 
            { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : meta.bg }, 
            isRtl ? { marginLeft: 16 } : { marginRight: 16 }
          ]}>
            <Text style={styles.icon}>{meta.icon}</Text>
          </View>

          <View style={[styles.content, isRtl && { alignItems: 'flex-end' }]}>
            <View style={[styles.titleRow, isRtl && { flexDirection: 'row-reverse' }]}>
              <Text style={[
                styles.title, 
                isRtl && { textAlign: 'right' },
                isDark && DarkThemeStyles.darkText
              ]}>{item.title}</Text>
              {item.isBundle && (
                <View style={[styles.bundleBadge, isDark && { backgroundColor: '#a78bfa' }]}>
                  <Text style={styles.bundleText}>BUNDLE</Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.subtitle, 
              isRtl && { textAlign: 'right' },
              isDark && DarkThemeStyles.darkSecondaryText
            ]}>{subtitle}</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[
              styles.amount,
              isDark && { color: '#a78bfa' }
            ]}>{formattedAmount}</Text>
            {item.currency && (
              <Text style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.4)' : '#8e8e93', fontWeight: '600' }}>{item.currency}</Text>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
}
