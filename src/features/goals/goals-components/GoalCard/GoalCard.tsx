import React, { useRef } from 'react';
import { View, Animated, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/gradient-button';
import { ProgressBar } from '../ProgressBar';
import { useI18n } from '@/hooks/use-i18n';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticTap, hapticWarning } from '@/src/utils/haptics';

import { GoalContributionHistory } from './GoalContributionHistory';
import { formatCurrency, formatDate } from './goalCard.utils';
import { styles } from './stylesheet';

export type GoalContribution = {
  amount: number;
  currency: string;
  createdAt: number;
  reason?: string;
};

type GoalCardProps = {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  targetCurrency: string;
  targetDate: number;
  myContributions?: GoalContribution[];
  onContribute: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const GoalCard = ({
  id,
  title,
  currentAmount,
  targetAmount,
  targetCurrency,
  targetDate,
  myContributions = [],
  onContribute,
  onEdit,
  onDelete,
}: GoalCardProps) => {
  const { t } = useI18n();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  
  const progress = targetAmount > 0 ? currentAmount / targetAmount : 0;
  const remainingAmount = targetAmount - currentAmount;
  const isGoalReached = currentAmount >= targetAmount;

  const handleDeletePress = () => {
    hapticWarning();
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 8,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -8,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 6,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -6,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 75,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete();
    });
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnimation }] }]}>
      <LinearGradient
        colors={['#AD63F6', '#7C49BA', '#3D538A']}
        start={{ x: 0.1, y: 0.2 }}
        end={{ x: 0.9, y: 0.85 }}
        style={styles.cardGradient}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </ThemedText>
          <View style={styles.actions}>
            {!isGoalReached && (
              <Pressable
                onPress={() => {
                  hapticTap();
                  onEdit();
                }}
                style={styles.iconButton}
                hitSlop={10}
              >
                <MaterialIcons name="edit" size={20} color="#FFFFFF" />
              </Pressable>
            )}
            <Pressable onPress={handleDeletePress} style={styles.iconButton} hitSlop={10}>
              <MaterialIcons name="delete" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.amountRow}>
            <View style={styles.amountBlock}>
              <ThemedText style={styles.amount} numberOfLines={1}>
                {formatCurrency(currentAmount, targetCurrency, true)}
              </ThemedText>
            </View>
            <View style={styles.remainingBlock}>
              <ThemedText style={styles.remaining} numberOfLines={1}>
                {formatCurrency(remainingAmount, targetCurrency, true)} {t('goals.remaining')}
              </ThemedText>
            </View>
          </View>

          <ProgressBar progress={progress} />

          <View style={styles.footer}>
            <ThemedText style={styles.date}>
              {formatDate(targetDate)}
            </ThemedText>
            <ThemedText style={styles.target}>
              {formatCurrency(targetAmount, targetCurrency, true)}
            </ThemedText>
          </View>

          {isGoalReached ? (
            <View style={styles.reachedBadge}>
              <MaterialIcons name="check-circle" size={16} color="#10B981" />
              <ThemedText style={styles.reachedText}>{t("goals.goalReached")}</ThemedText>
            </View>
          ) : (
            <View style={styles.inProgressBadge}>
              <MaterialIcons name="hourglass-empty" size={16} color="#F59E0B" />
              <ThemedText style={styles.inProgressText}>{t("goals.inProgress")}</ThemedText>
            </View>
          )}

          <GoalContributionHistory contributions={myContributions} />
        </View>

        {!isGoalReached && (
          <GradientButton
            label={t('goals.contribute')}
            onPress={onContribute}
            style={styles.button}
          />
        )}

        <View pointerEvents="none" style={styles.decorCircleTop} />
        <View pointerEvents="none" style={styles.decorCircleBottom} />
      </LinearGradient>
    </Animated.View>
  );
};

