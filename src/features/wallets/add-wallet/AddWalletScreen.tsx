import React, { useState } from "react";

import { useRouter } from "expo-router";
import { get, ref, update } from "firebase/database";
import { Alert, Pressable, ScrollView } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { db } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";

import { EmojiSelector } from "./components/EmojiSelector";
import { InitialBalancesSection } from "./components/InitialBalancesSection";
import { SharedMembersSection } from "./components/SharedMembersSection";
import { WalletPreview } from "./components/WalletPreview";
import { WalletTypeSelector } from "./components/WalletTypeSelector";
import { useSharedMembers } from "./hooks/useSharedMembers";
import { styles } from "./styles";
import type { BalanceRow, UserWalletLink, WalletRecord, WalletType } from "./types";
import {
  EMOJI_OPTIONS,
  TYPE_OPTIONS,
  buildPreviewCurrencies,
  getDefaultColor,
  getNextUserWalletKey,
  isValidExpiry,
  nextCurrency,
  parseAmount,
} from "./utils";

export default function AddWalletScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("real");
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [balances, setBalances] = useState<BalanceRow[]>([{ id: "0", currency: "nis", amount: "" }]);
  const [saving, setSaving] = useState(false);

  const {
    allUsers,
    sharedSearch,
    selectedMemberUids,
    setSharedSearch,
    setSelectedMemberUids,
    sharedSuggestions,
  } = useSharedMembers({
    enabled: type === "shared",
    currentUserId: user?.uid,
  });

  const color = getDefaultColor(type);
  const previewCurrencies = buildPreviewCurrencies(balances);
  const previewMemberUids =
    type !== "shared" || !user
      ? undefined
      : Array.from(new Set([user.uid, ...selectedMemberUids.filter(Boolean)]));
  const previewOwnerLabel =
    type !== "shared" || !user ? undefined : allUsers[user.uid]?.name?.trim() || user.uid;
  const canCreate = name.trim().length > 0 && Boolean(user);

  const walletTypeOptions = TYPE_OPTIONS.map((option) => ({
    ...option,
    label:
      option.key === "real"
        ? t("walletTypeReal")
        : option.key === "credit"
          ? t("walletTypeCredit")
          : t("walletTypeShared"),
  }));

  const handleAddBalance = () => {
    setBalances((current) => [
      ...current,
      { id: String(Date.now()), currency: "usd", amount: "" },
    ]);
  };

  const handleCycleCurrency = (rowId: string) => {
    setBalances((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, currency: nextCurrency(row.currency) } : row,
      ),
    );
  };

  const handleAmountChange = (rowId: string, text: string) => {
    setBalances((current) =>
      current.map((row) => (row.id === rowId ? { ...row, amount: text } : row)),
    );
  };

  const handleAddMember = (uid: string) => {
    setSelectedMemberUids((current) => [...current, uid]);
    setSharedSearch("");
  };

  const handleRemoveMember = (uid: string) => {
    setSelectedMemberUids((current) => current.filter((item) => item !== uid));
  };

  const createWallet = async () => {
    if (!user) return;

    const walletName = name.trim();
    if (walletName.length === 0) {
      Alert.alert(t("error"), t("walletNameRequired"));
      return;
    }

    if (type === "credit" && !isValidExpiry(expiryDate)) {
      Alert.alert(t("error"), t("invalidExpiry"));
      return;
    }

    const currancies: Record<string, number> = {};

    for (const row of balances) {
      const code = row.currency.trim().toLowerCase();
      const rawAmount = row.amount.trim();

      if (!rawAmount.length) continue;

      const amount = parseAmount(rawAmount);
      if (amount === null) {
        Alert.alert(t("error"), t("invalidAmount"));
        return;
      }

      if (!code) continue;
      if (currancies[code] !== undefined) {
        Alert.alert(t("error"), `${t("duplicateCurrency")}: ${code.toUpperCase()}`);
        return;
      }

      currancies[code] = amount;
    }

    setSaving(true);
    let created = false;

    try {
      const walletsSnapshot = await get(ref(db, "wallets"));
      const wallets = (walletsSnapshot.val() ?? {}) as Record<string, WalletRecord>;

      const maxWalletId = Object.values(wallets).reduce((accumulator, wallet) => {
        const value = Number(wallet?.id);
        return Number.isFinite(value) ? Math.max(accumulator, value) : accumulator;
      }, 0);

      const newWalletId = maxWalletId + 1;
      const walletKey = `wallet${newWalletId}`;

      const userWalletsSnapshot = await get(ref(db, `users/${user.uid}/userwallet`));
      const userWallets = (userWalletsSnapshot.val() ?? {}) as Record<string, UserWalletLink>;
      const userWalletKey = getNextUserWalletKey(userWallets);

      const sharedMembers =
        type === "shared"
          ? Array.from(new Set([user.uid, ...selectedMemberUids.filter(Boolean)]))
          : [];

      const sharedMembersMap =
        type === "shared"
          ? sharedMembers.reduce((accumulator, uid) => {
              accumulator[uid] = true;
              return accumulator;
            }, {} as Record<string, true>)
          : undefined;

      const updates: Record<string, unknown> = {
        [`wallets/${walletKey}`]: {
          currancies,
          id: newWalletId,
          state: "active",
          type,
          ...(type === "credit" ? { expiryDate: expiryDate.trim() || undefined } : {}),
          ...(type === "shared" ? { ownerUid: user.uid, members: sharedMembersMap } : {}),
        },
        [`users/${user.uid}/userwallet/${userWalletKey}`]: {
          name: walletName,
          walletid: newWalletId,
          color,
          emoji,
        },
      };

      if (type === "shared") {
        for (const uid of sharedMembers) {
          if (uid === user.uid) continue;

          const memberWalletsSnapshot = await get(ref(db, `users/${uid}/userwallet`));
          const memberWallets = (memberWalletsSnapshot.val() ?? {}) as Record<string, unknown>;
          const alreadyLinked = Object.values(memberWallets).some(
            (wallet: any) => Number(wallet?.walletid) === newWalletId,
          );

          if (!alreadyLinked) {
            const nextKey = getNextUserWalletKey(memberWallets);
            updates[`users/${uid}/userwallet/${nextKey}`] = {
              name: walletName,
              walletid: newWalletId,
              color,
              emoji,
            };
          }
        }
      }

      await update(ref(db), updates);
      created = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert(t("error"), message);
    } finally {
      setSaving(false);
    }

    if (created) {
      router.back();
    }
  };

  if (!user) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t("pleaseSignIn")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="subtitle" style={styles.heading}>
          {t("addWallet")}
        </ThemedText>

        <WalletPreview
          name={name.trim() || t("walletName")}
          emoji={emoji}
          currencies={previewCurrencies}
          ownerLabel={previewOwnerLabel}
          memberUids={previewMemberUids}
        />

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("walletName")}</ThemedText>
          <AuthInput
            value={name}
            onChangeText={setName}
            placeholder={t("walletNamePlaceholder")}
            autoCapitalize="words"
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("walletType")}</ThemedText>
          <WalletTypeSelector
            options={walletTypeOptions}
            selectedType={type}
            onSelect={setType}
          />
        </ThemedView>

        {type === "credit" ? (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t("walletExpiry")} (MM/YY)</ThemedText>
            <AuthInput
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="12/30"
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </ThemedView>
        ) : null}

        {type === "shared" ? (
          <SharedMembersSection
            title={t("addMembers")}
            placeholder={t("searchByNameOrNumber")}
            searchValue={sharedSearch}
            selectedMemberUids={selectedMemberUids}
            allUsers={allUsers}
            suggestions={sharedSuggestions}
            onSearchChange={setSharedSearch}
            onRemoveMember={handleRemoveMember}
            onAddMember={handleAddMember}
          />
        ) : null}

        <InitialBalancesSection
          title={t("initialBalances")}
          balances={balances}
          onAddBalance={handleAddBalance}
          onCycleCurrency={handleCycleCurrency}
          onAmountChange={handleAmountChange}
        />

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("chooseEmoji")}</ThemedText>
          <EmojiSelector
            options={EMOJI_OPTIONS}
            selectedEmoji={emoji}
            onSelect={setEmoji}
          />
        </ThemedView>

        <GradientButton
          label={saving ? t("creating") : t("createWallet")}
          onPress={createWallet}
          disabled={!canCreate}
          loading={saving}
          style={{ marginTop: 10 }}
        />

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cancel, pressed ? styles.pressed : null]}
        >
          <ThemedText type="defaultSemiBold" style={styles.cancelText}>
            {t("cancel")}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
