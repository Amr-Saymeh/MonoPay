import React, { useMemo, useState } from "react";

import { ThemedView } from "@/components/themed-view";
import { SharedCard } from "@/src/features/card/SharedCard";

import { useLocalSearchParams, useRouter } from "expo-router";
import { push, ref, update } from "firebase/database";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  AmountModal,
  BalanceActions,
  HistorySection,
  MemberSection,
} from "@/src/features/shared/components";
import {
  useAllUsersProfiles,
  useMemberSuggestions,
  useSharedWallet,
  useSharedWalletLogs,
} from "@/src/features/shared/hooks";
import {
  getNextUserWalletKey
} from "@/src/features/shared/utils/walletHelpers";
import { db } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";

export default function SharedWalletScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const { user } = useAuth();
  const params = useLocalSearchParams<{ walletId?: string }>();

  const walletId = useMemo(() => Number(params.walletId ?? NaN), [params.walletId]);

  const { wallet, loading, name, goal, memberUids, setGoal } = useSharedWallet(user, walletId);
  const { logs, loading: logsLoading } = useSharedWalletLogs(user, walletId);
  const { allUsers } = useAllUsersProfiles(user);

  const [search, setSearch] = useState("");
  const isOwner = !!user && !!wallet?.ownerUid && wallet.ownerUid === user.uid;

  const { suggestions } = useMemberSuggestions(search, isOwner, allUsers, memberUids, user?.uid);

  const [amountModalVisible, setAmountModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [amountCurrency, setAmountCurrency] = useState<string | null>(null);
  const [amountReason, setAmountReason] = useState("");
  const [amountIsAdd, setAmountIsAdd] = useState(true);
  const [savingAmount, setSavingAmount] = useState(false);

  const memberProfiles = useMemo(
    () => memberUids.map((uid) => ({ uid, profile: allUsers[uid] })),
    [allUsers, memberUids]
  );

  const balances = useMemo(
    () =>
      Object.entries(wallet?.currancies ?? {})
        .filter(([k, v]) => k && Number.isFinite(Number(v)))
        .sort(([a], [b]) => a.localeCompare(b)),
    [wallet?.currancies]
  );

  const availableCurrencies = useMemo(() => {
    if (amountIsAdd) return ["usd", "eur", "ils", "jod", "egp"];
    return balances.map(([code]) => code.toLowerCase());
  }, [amountIsAdd, balances]);

  const ownerProfile = useMemo(
    () => (wallet?.ownerUid ? allUsers[wallet.ownerUid] : undefined),
    [allUsers, wallet?.ownerUid]
  );
  const walletState = String(wallet?.state ?? "active").toLowerCase();
  const ownerLabel = ownerProfile?.name?.trim() || ownerProfile?.email?.trim() || wallet?.ownerUid || "—";

  const cardCurrencies = useMemo(
    () =>
      Object.entries(wallet?.currancies ?? {})
        .map(([code, balance]) => ({ code, balance: Number(balance) }))
        .filter(({ balance }) => Number.isFinite(balance)),
    [wallet?.currancies]
  );

  const handleAddMember = async (uid: string) => {
    if (!user || !wallet || !Number.isFinite(walletId) || !isOwner) return;
    const walletKey = `wallet${walletId}`;
    const updates: Record<string, unknown> = { [`wallets/${walletKey}/members/${uid}`]: true };
    try {
      const { get } = await import("firebase/database");
      const snap = await get(ref(db, `users/${uid}/userwallet`));
      const userWallets = (snap.val() ?? {}) as Record<string, { walletid?: number }>;
      if (!Object.values(userWallets).some((w) => Number(w?.walletid) === walletId)) {
        updates[`users/${uid}/userwallet/${getNextUserWalletKey(userWallets)}`] = {
          name: name.trim() || `Wallet ${walletId}`,
          walletid: walletId,
        };
      }
      await update(ref(db), updates);
      setSearch("");
    } catch (e) {
      Alert.alert(t("error"), e instanceof Error ? e.message : "Failed");
    }
  };

  const handleRemoveMember = async (uid: string) => {
    if (!user || !wallet || !Number.isFinite(walletId) || !isOwner || uid === wallet.ownerUid) return;
    const walletKey = `wallet${walletId}`;
    const updates: Record<string, unknown> = { [`wallets/${walletKey}/members/${uid}`]: null };
    try {
      const { get } = await import("firebase/database");
      const snap = await get(ref(db, `users/${uid}/userwallet`));
      const userWallets = (snap.val() ?? {}) as Record<string, { walletid?: number }>;
      for (const [slotKey, link] of Object.entries(userWallets)) {
        if (Number(link?.walletid) === walletId) updates[`users/${uid}/userwallet/${slotKey}`] = null;
      }
      await update(ref(db), updates);
    } catch (e) {
      Alert.alert(t("error"), e instanceof Error ? e.message : "Failed");
    }
  };

  const openAmountModal = (isAdd: boolean, currency?: string) => {
    setAmountIsAdd(isAdd);
    setAmount("");
    setAmountReason("");
    const defaultCur = isAdd ? "ils" : (balances[0]?.[0] ?? null);
    setAmountCurrency(currency ?? defaultCur);
    setAmountModalVisible(true);
  };

  const handleSaveAmount = async () => {
    if (!user || !wallet || !Number.isFinite(walletId) || !amountCurrency) return;
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert(t("error"), t("invalidAmount") ?? "Enter a valid amount.");
      return;
    }
    const delta = amountIsAdd ? value : -value;
    const walletKey = `wallet${walletId}`;
    setSavingAmount(true);
    try {
      const { get } = await import("firebase/database");
      const snap = await get(ref(db, `wallets/${walletKey}/currancies`));
      const curr = (snap.val() ?? {}) as Record<string, number>;
      const key = amountCurrency.toLowerCase();
      const next = Number(curr[key] ?? 0) + delta;
      if (next < 0) {
        Alert.alert(t("error"), t("insufficientFunds") ?? "Not enough balance.");
        setSavingAmount(false);
        return;
      }
      const logsRef = ref(db, `wallets/${walletKey}/sharedLogs`);
      const logRef = push(logsRef);
      await update(ref(db), {
        [`wallets/${walletKey}/currancies/${key}`]: next,
        [`wallets/${walletKey}/sharedLogs/${logRef.key}`]: {
          userUid: user.uid,
          amount: delta,
          currency: key,
          reason: amountReason.trim() || (amountIsAdd ? "Add money" : "Spend"),
          createdAt: Date.now(),
        },
      });
      setAmountModalVisible(false);
    } catch (e) {
      Alert.alert(t("error"), e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingAmount(false);
    }
  };

  if (!user)
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t("pleaseSignIn")}</ThemedText>
      </ThemedView>
    );

  if (!Number.isFinite(walletId))
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t("walletNotFound") ?? "Wallet not found"}</ThemedText>
      </ThemedView>
    );

  if (loading)
    return (
      <ThemedView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </ThemedView>
    );

  if (!wallet || String(wallet.type ?? "") !== "shared")
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t("walletNotFound") ?? "Wallet not found"}</ThemedText>
      </ThemedView>
    );

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardWrapper}>
          <SharedCard
            name={name}
            ownerLabel={ownerLabel}
            memberUids={memberUids}
            walletState={walletState}
            currencies={cardCurrencies}
          />
        </View>

        <MemberSection
          isOwner={isOwner}
          search={search}
          onSearchChange={setSearch}
          suggestions={suggestions}
          onAddMember={handleAddMember}
          memberProfiles={memberProfiles}
          ownerUid={wallet.ownerUid}
          onRemoveMember={handleRemoveMember}
        />

        <View style={[styles.sectionCard, { backgroundColor: surfaceColor, borderColor }]}>
          <BalanceActions
            onAddMoney={() => openAmountModal(true)}
            onRemoveMoney={() => openAmountModal(false)}
          />
        </View>

        <HistorySection logs={logs} loading={logsLoading} allUsers={allUsers} />
      </ScrollView>

      <AmountModal
        visible={amountModalVisible}
        onClose={() => setAmountModalVisible(false)}
        isAdd={amountIsAdd}
        amount={amount}
        onAmountChange={setAmount}
        amountCurrency={amountCurrency}
        onCurrencyChange={setAmountCurrency}
        amountReason={amountReason}
        onReasonChange={setAmountReason}
        availableCurrencies={availableCurrencies}
        saving={savingAmount}
        onConfirm={handleSaveAmount}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 16, paddingHorizontal: 16 },
  center: { paddingVertical: 32, alignItems: "center" },
  content: { paddingBottom: 40, gap: 14 },
  cardWrapper: {
    borderRadius: 22,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
});
