import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';

import { formatAmount } from '../utils/formatters';

export interface SharedWalletCardProps {
  name: string;
  walletState: string;
  memberCount: number;
  ownerLabel: string;
  totalBalance: number;
}

export function SharedWalletCard({
  name,
  walletState,
  memberCount,
  ownerLabel,
  totalBalance,
}: SharedWalletCardProps) {
  const { t } = useI18n();
  const isActive = walletState === 'active';

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={['#a855f7', '#7c3aed', '#6d28d9', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardDetails}
      >
        <View style={styles.cardCircleTopRight} />
        <View style={styles.cardCircleBottomLeft} />

        <View style={styles.cardBody}>
          <ThemedText style={styles.cardWalletName} numberOfLines={1}>
            {name}
          </ThemedText>
          <View style={styles.cardBadgeRow}>
            <View style={[styles.cardPill, isActive ? styles.cardPillActive : styles.cardPillInactive]}>
              <ThemedText style={styles.cardPillText}>
                {isActive ? (t('active') ?? 'Active') : (t('inactive') ?? 'Inactive')}
              </ThemedText>
            </View>
            <View style={styles.cardPillInfo}>
              <MaterialIcons name="groups" size={12} color="#fff" />
              <ThemedText style={styles.cardPillText}>
                {memberCount} {t('members') ?? 'members'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.cardStatsRow}>
          <View style={styles.cardStat}>
            <ThemedText style={styles.cardStatLabel}>{t('walletOwner') ?? 'Owner'}</ThemedText>
            <ThemedText style={styles.cardStatValue} numberOfLines={1}>
              {ownerLabel}
            </ThemedText>
          </View>
          <View style={styles.cardStat}>
            <ThemedText style={styles.cardStatLabel}>{t('balance') ?? 'Balance'}</ThemedText>
            <ThemedText style={styles.cardStatValue}>{formatAmount(totalBalance)}</ThemedText>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 22,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardDetails: { borderRadius: 22, padding: 18, overflow: 'hidden', gap: 10 },
  cardCircleTopRight: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 60,
  },
  cardCircleBottomLeft: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 40,
  },
  cardBody: { marginTop: 24, gap: 6 },
  cardWalletName: { color: '#fff', fontSize: 17, fontFamily: 'sans-black' },
  cardBadgeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  cardPill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  cardPillActive: { backgroundColor: 'rgba(34,197,94,0.2)' },
  cardPillInactive: { backgroundColor: 'rgba(239,68,68,0.2)' },
  cardPillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cardPillText: { color: '#fff', fontSize: 11 },
  cardStatsRow: { flexDirection: 'row', gap: 10 },
  cardStat: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 10,
    gap: 4,
  },
  cardStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  cardStatValue: { color: '#fff', fontSize: 13 },
});
