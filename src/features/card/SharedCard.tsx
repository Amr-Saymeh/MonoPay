import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MemberActive } from './MemberActive';
import { styles } from './Styles';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SharedCardProps {
  name: string;
  emoji?: string;
  currencies: Array<{ code: string; balance: number }>;
  // shared-only — omit for personal wallets
  ownerLabel?: string;
  memberUids?: string[];
  walletState?: string;
  onCurrencyChange?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ANIMATION_DURATION = 150;

// ─── Component ────────────────────────────────────────────────────────────────

export function SharedCard({
  name,
  emoji,
  currencies,
  ownerLabel,
  memberUids,
  walletState,
  onCurrencyChange,
}: SharedCardProps) {
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const isShared = !!(ownerLabel && memberUids);
  const isActive = String(walletState ?? 'active').toLowerCase() === 'active';

  const nonZero = useMemo(
    () => currencies.filter((c) => c.balance > 0),
    [currencies],
  );

  useEffect(() => {
    setDisplayedIndex(0);
    fadeAnim.setValue(1);
  }, [currencies, fadeAnim]);

  const handlePress = useCallback(() => {
    if (nonZero.length <= 1) return;
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => {
      setDisplayedIndex((prev) => (prev + 1) % nonZero.length);
      onCurrencyChange?.();
    }, ANIMATION_DURATION);
  }, [nonZero.length, fadeAnim, onCurrencyChange]);

  const displayed = nonZero[displayedIndex % Math.max(nonZero.length, 1)];

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.92}>
     
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{emoji ?? '💳'}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
        </View>

    
        {isShared && walletState && (
          <View style={[
            styles.statusBadge,
            isActive ? styles.statusActive : styles.statusInactive,
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isActive ? '#4ade80' : '#f87171' },
            ]} />
            <Text style={[
              styles.statusText,
              { color: isActive ? '#4ade80' : '#f87171' },
            ]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        )}
      </View>

    
      <Text style={styles.label}>Available Balance</Text>

      {nonZero.length === 0 ? (
        <Text style={styles.balance}>—</Text>
      ) : displayed ? (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.balance}>
            {displayed.balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <TouchableOpacity
            style={styles.currencyPill}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <View style={styles.currencyDot} />
            <Text style={styles.currencyCode}>
              {displayed.code.toUpperCase()}
            </Text>
            {nonZero.length > 1 && (
              <Text style={styles.currencyChevron}>▾</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      ) : null}

      
      {nonZero.length > 1 && (
        <View style={styles.chips}>
          {nonZero.map((_, i) => (
            <View
              key={i}
              style={[styles.chip, i === displayedIndex && styles.chipActive]}
            />
          ))}
        </View>
      )}

      
      {isShared && (
        <>
          <View style={styles.divider} />
          <View style={styles.footer}>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Owner</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {ownerLabel}
              </Text>
            </View>
            <View style={[styles.metaBlock, styles.metaBlockRight]}>
              <Text style={styles.metaLabel}>
                {memberUids!.length} members
              </Text>
              <MemberActive memberUids={memberUids!} />
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}