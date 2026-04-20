// components/goals/GoalCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/gradient-button';
import { ProgressBar } from './ProgressBar';
import { useI18n } from '@/hooks/use-i18n';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticSelection, hapticTap, hapticWarning } from '@/src/utils/haptics';

interface GoalCardProps {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  targetCurrency: string;
  targetDate: number;
  myContributions?: {
    amount: number;
    currency: string;
    createdAt: number;
    reason?: string;
  }[];
  onContribute: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

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
  const historyOpacity = useRef(new Animated.Value(0)).current;
  const historyTranslateY = useRef(new Animated.Value(-8)).current;
  const [showHistory, setShowHistory] = useState(false);
  const [isHistoryMounted, setIsHistoryMounted] = useState(false);
  
  const progress = targetAmount > 0 ? currentAmount / targetAmount : 0;
  const remainingAmount = targetAmount - currentAmount;
  const isGoalReached = currentAmount >= targetAmount;
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  const formatCurrency = (amount: number, currency: string, compact = false) => {
    const normalized = String(currency || "usd").toUpperCase();
    if (!compact) return `${amount.toFixed(2)} ${normalized}`;

    const absAmount = Math.abs(amount);
    if (absAmount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B ${normalized}`;
    if (absAmount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M ${normalized}`;
    if (absAmount >= 1_000) return `${(amount / 1_000).toFixed(2)}K ${normalized}`;
    return `${amount.toFixed(2)} ${normalized}`;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  const handleToggleHistory = () => {
    hapticSelection();
    if (showHistory) {
      Animated.parallel([
        Animated.timing(historyOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(historyTranslateY, {
          toValue: -8,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHistory(false);
        setIsHistoryMounted(false);
      });
      return;
    }

    setIsHistoryMounted(true);
    setShowHistory(true);
  };

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

  useEffect(() => {
    if (!isHistoryMounted || !showHistory) return;
    historyOpacity.setValue(0);
    historyTranslateY.setValue(-8);
    Animated.parallel([
      Animated.timing(historyOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(historyTranslateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isHistoryMounted, showHistory, historyOpacity, historyTranslateY]);

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

          {myContributions.length > 0 && (
            <Pressable
              style={styles.historyToggle}
              onPress={handleToggleHistory}
            >
              <View style={styles.historyToggleLeft}>
                <MaterialIcons name="history" size={16} color="#EDE9FE" />
                <ThemedText style={styles.historyToggleText}>
                  {showHistory ? t("goals.hideContributionHistory") : t("goals.showContributionHistory")}
                </ThemedText>
              </View>
              <MaterialIcons
                name={showHistory ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={20}
                color="#EDE9FE"
              />
            </Pressable>
          )}

          {myContributions.length > 0 && isHistoryMounted && (
            <Animated.View
              style={[
                styles.historyAnimatedContainer,
                {
                  opacity: historyOpacity,
                  transform: [{ translateY: historyTranslateY }],
                },
              ]}
            >
              <View style={styles.contributionsBox}>
                <ThemedText style={styles.contributionsTitle}>
                  {t("goals.yourContributions")}
                </ThemedText>
                {myContributions.map((contribution, index) => (
                  <View key={`${contribution.createdAt}-${index}`} style={styles.contributionRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.contributionAmount}>
                        {formatCurrency(contribution.amount, contribution.currency)}
                      </ThemedText>
                      <ThemedText style={styles.contributionDate}>
                        {formatDateTime(contribution.createdAt)}
                      </ThemedText>
                      {!!contribution.reason && (
                        <ThemedText style={styles.contributionReason}>
                          {contribution.reason}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 5,
  },
  iconButton: {
    padding: 4,
  },
  content: {
    gap: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  amountBlock: {
    flex: 1,
    minWidth: 0,
  },
  remainingBlock: {
    flexShrink: 1,
    minWidth: 0,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    maxWidth: '100%',
  },
  remaining: {
    fontSize: 14,
    color: '#EDE9FE',
    textAlign: 'right',
    maxWidth: 150,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#EDE9FE',
  },
  target: {
    fontSize: 12,
    color: '#EDE9FE',
  },
  reachedBadge: {
    marginTop: 0,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.18)',
    borderColor: 'rgba(16,185,129,0.45)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reachedText: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '700',
  },
  inProgressBadge: {
    marginTop: 0,
    marginBottom:10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderColor: 'rgba(245,158,11,0.45)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inProgressText: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '700',
  },
  contributionsBox: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    paddingTop: 10,
    gap: 8,
    marginBottom: 8,
  },
  historyAnimatedContainer: {
    overflow: 'hidden',
  },
  contributionsTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  contributionRow: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 4,
  },
  contributionAmount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  contributionDate: {
    color: '#EDE9FE',
    fontSize: 11,
    marginTop: 1,
  },
  contributionReason: {
    color: '#EDE9FE',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    marginTop: 16,
  },
  historyToggle: {
    marginTop: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  historyToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyToggleText: {
    color: '#EDE9FE',
    fontSize: 12,
    fontWeight: '600',
  },
  decorCircleTop: {
    position: 'absolute',
    top: -46,
    right: -42,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  decorCircleBottom: {
    position: 'absolute',
    bottom: -50,
    left: -48,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
});
