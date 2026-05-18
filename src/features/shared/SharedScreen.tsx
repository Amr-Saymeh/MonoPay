import { useMemo } from 'react';

import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useI18n } from '@/hooks/use-i18n';
import { useAuth } from '@/src/providers/AuthProvider';
import { AmountModal } from './components/AmountModal';
import { BalanceActions } from './components/BalanceActions';
import { HistorySection } from './components/HistorySection';
import { MemberSection } from './components/MemberSection';
import { SharedCard } from '../card/SharedCard';
import { SharedWalletRepositoryProvider } from './context/SharedWalletRepositoryContext';
import { useSharedWalletScreen } from './hooks/useSharedWalletScreen';

function SharedScreenContent() {
  const { t } = useI18n();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ walletId?: string }>();
  const walletId = useMemo(() => Number(params.walletId ?? NaN), [params.walletId]);

  const { wallet, balance, members, amountModal, history } = useSharedWalletScreen(
    user,
    walletId,
    t,
  );

  if (!user) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t('pleaseSignIn')}</ThemedText>
      </ThemedView>
    );
  }

  if (!Number.isFinite(walletId)) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t('walletNotFound')}</ThemedText>
      </ThemedView>
    );
  }

  if (wallet.loading) {
    return (
      <ThemedView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </ThemedView>
    );
  }

  if (!wallet.data || String(wallet.data.type ?? '') !== 'shared') {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t('walletNotFound')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SharedCard
          name={wallet.name}
          currencies={balance.balances.map(([code, amt]) => ({ code, balance: amt }))}
          ownerLabel={wallet.ownerLabel}
          memberUids={members.memberProfiles.map(m => m.uid)}
          walletState={wallet.walletState}
        />

        <MemberSection
          isOwner={wallet.isOwner}
          search={members.search}
          onSearchChange={members.setSearch}
          suggestions={members.suggestions}
          onAddMember={members.handleAddMember}
          memberProfiles={members.memberProfiles}
          ownerUid={wallet.data.ownerUid}
          onRemoveMember={members.handleRemoveMember}
        />

        <ThemedView style={styles.sectionCard}>
          <BalanceActions
            onAddMoney={() => amountModal.open(true)}
            onRemoveMoney={() => amountModal.open(false)}
          />
        </ThemedView>

        <HistorySection
          logs={history.logs}
          loading={history.logsLoading}
          allUsers={history.allUsers}
        />
      </ScrollView>

      <AmountModal
        visible={amountModal.visible}
        onClose={amountModal.close}
        isAdd={amountModal.isAdd}
        amount={amountModal.amount}
        onAmountChange={amountModal.setAmount}
        amountCurrency={amountModal.currency}
        onCurrencyChange={amountModal.setCurrency}
        amountReason={amountModal.reason}
        onReasonChange={amountModal.setReason}
        availableCurrencies={balance.availableCurrencies}
        saving={amountModal.saving}
        onConfirm={amountModal.handleSave}
      />
    </ThemedView>
  );
}

export default function SharedScreen() {
  return (
    <SharedWalletRepositoryProvider>
      <SharedScreenContent />
    </SharedWalletRepositoryProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 16, paddingHorizontal: 16 },
  center: { paddingVertical: 32, alignItems: 'center' },
  content: { paddingBottom: 40, gap: 14 },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(17,24,28,0.08)',
    backgroundColor: 'rgba(17,24,28,0.03)',
  },
});
