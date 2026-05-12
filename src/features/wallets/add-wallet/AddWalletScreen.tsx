import React, { useState } from "react";

import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/src/providers/AuthProvider";

import { EmojiSelector } from "./components/EmojiSelector";
import { InitialBalancesSection } from "./components/InitialBalancesSection";
import { SharedMembersSection } from "./components/SharedMembersSection";
import { WalletPreview } from "./components/WalletPreview";
import { WalletTypeSelector } from "./components/WalletTypeSelector";
import { createWalletInDb } from "./createWalletInDb";
import { useSharedMembers } from "./hooks/useSharedMembers";
import { styles } from "./styles";
import type { BalanceRow, WalletType } from "./types";
import {
  EMOJI_OPTIONS,
  TYPE_OPTIONS,
  buildPreviewCurrencies,
  getDefaultColor,
  isValidExpiry,
  nextCurrency,
  parseAmount,
} from "./utils";

export default function AddWalletScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();

  const [walletName, setWalletName] = useState("");
  const [walletType, setWalletType] = useState<WalletType>("real");
  const [walletEmoji, setWalletEmoji] = useState(EMOJI_OPTIONS[0]);
  const [creditExpiry, setCreditExpiry] = useState("");
  const [startingBalances, setStartingBalances] = useState<BalanceRow[]>([
    { id: "0", currency: "nis", amount: "" },
  ]);

  const isSharedWallet = walletType === "shared";
  const isCreditWallet = walletType === "credit";

  const {
    allUsers,
    sharedSearch,
    selectedMemberUids,
    setSharedSearch,
    setSelectedMemberUids,
    sharedSuggestions,
  } = useSharedMembers({
    enabled: isSharedWallet,
    currentUserId: user?.uid,
  });

  const walletColor = getDefaultColor(walletType);
  const previewCurrencies = buildPreviewCurrencies(startingBalances);
  const previewMemberUids =
    !isSharedWallet || !user
      ? undefined
      : Array.from(new Set([user.uid, ...selectedMemberUids.filter(Boolean)]));
  const previewOwnerLabel =
    !isSharedWallet || !user ? undefined : allUsers[user.uid]?.name?.trim() || user.uid;
  const canCreate = walletName.trim().length > 0 && Boolean(user);

  const walletTypeOptions = TYPE_OPTIONS.map((option) => {
    let label = "";
    switch (option.key) {
      case "real":
        label = t("walletTypeReal");
        break;
      case "credit":
        label = t("walletTypeCredit");
        break;
      case "shared":
        label = t("walletTypeShared");
        break;
    }

    return { ...option, label };
  });

  function addBalanceRow() {
    setStartingBalances((current) => [
      ...current,
      { id: String(Date.now()), currency: "usd", amount: "" },
    ]);
  }

  function cycleBalanceCurrency(rowId: string) {
    setStartingBalances((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, currency: nextCurrency(row.currency) } : row,
      ),
    );
  }

  function updateBalanceAmount(rowId: string, text: string) {
    setStartingBalances((current) =>
      current.map((row) => (row.id === rowId ? { ...row, amount: text } : row)),
    );
  }

  function addSharedMember(uid: string) {
    setSelectedMemberUids((current) => [...current, uid]);
    setSharedSearch("");
  }

  function removeSharedMember(uid: string) {
    setSelectedMemberUids((current) => current.filter((item) => item !== uid));
  }

  async function createWallet() {
    if (!user) return;

    const trimmedName = walletName.trim();
    if (trimmedName.length === 0) {
      Alert.alert(t("error"), t("walletNameRequired"));
      return;
    }

    if (isCreditWallet && !isValidExpiry(creditExpiry)) {
      Alert.alert(t("error"), t("invalidExpiry"));
      return;
    }

    // DB schema uses `currancies` (legacy spelling).
    const currancies: Record<string, number> = {};

    for (const row of startingBalances) {
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

    await createWalletInDb({
      currentUserId: user.uid,
      walletName: trimmedName,
      type: walletType,
      expiryDate: creditExpiry,
      emoji: walletEmoji,
      color: walletColor,
      currancies,
      selectedMemberUids,
    });
    router.back();
  }

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
          name={walletName.trim() || t("walletName")}
          emoji={walletEmoji}
          currencies={previewCurrencies}
          ownerLabel={previewOwnerLabel}
          memberUids={previewMemberUids}
        />

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("walletName")}</ThemedText>
          <AuthInput
            value={walletName}
            onChangeText={setWalletName}
            placeholder={t("walletNamePlaceholder")}
            autoCapitalize="words"
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("walletType")}</ThemedText>
          <WalletTypeSelector
            options={walletTypeOptions}
            selectedType={walletType}
            onSelect={setWalletType}
          />
        </ThemedView>

        {isCreditWallet ? (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t("walletExpiry")} (MM/YY)</ThemedText>
            <AuthInput
              value={creditExpiry}
              onChangeText={setCreditExpiry}
              placeholder="12/30"
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </ThemedView>
        ) : null}

        {isSharedWallet ? (
          <SharedMembersSection
            title={t("addMembers")}
            placeholder={t("searchByNameOrNumber")}
            searchValue={sharedSearch}
            selectedMemberUids={selectedMemberUids}
            allUsers={allUsers}
            suggestions={sharedSuggestions}
            onSearchChange={setSharedSearch}
            onRemoveMember={removeSharedMember}
            onAddMember={addSharedMember}
          />
        ) : null}

        <InitialBalancesSection
          title={t("initialBalances")}
          balances={startingBalances}
          onAddBalance={addBalanceRow}
          onCycleCurrency={cycleBalanceCurrency}
          onAmountChange={updateBalanceAmount}
        />

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("chooseEmoji")}</ThemedText>
          <EmojiSelector
            options={EMOJI_OPTIONS}
            selectedEmoji={walletEmoji}
            onSelect={setWalletEmoji}
          />
        </ThemedView>

        <GradientButton
          label={t("createWallet")}
          onPress={createWallet}
          disabled={!canCreate}
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
