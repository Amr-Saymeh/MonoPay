import { useCallback, useRef, useState, type RefObject } from "react";

import { useHeaderHeight } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    findNodeHandle,
    type TextInput
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/src/providers/AuthProvider";
import { getUserLabel } from "@/src/utils/userLabel";

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
    formatExpiryInput,
    getDefaultColor,
    isValidExpiry,
    nextCurrency,
    parseAmount,
} from "./utils";

export default function AddWalletScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const headerHeight = useHeaderHeight();

  const scrollRef = useRef<ScrollView | null>(null);

  const scrollToField = useCallback(
    (fieldRef: RefObject<TextInput | null>) => {
      const node = findNodeHandle(fieldRef.current);
      if (!node) return;

      setTimeout(
        () => {
          (scrollRef.current as any)?.scrollResponderScrollNativeHandleToKeyboard?.(
            node,
            96,
            true,
          );
        },
        Platform.OS === "android" ? 80 : 0,
      );
    },
    [],
  );

  const walletNameRef = useRef<TextInput | null>(null);
  const creditExpiryRef = useRef<TextInput | null>(null);
  const sharedSearchRef = useRef<TextInput | null>(null);
  const firstAmountRef = useRef<TextInput | null>(null);

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

  if (!user) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t("pleaseSignIn")}</ThemedText>
      </ThemedView>
    );
  }

  const currentUserId = user.uid;

  const walletColor = getDefaultColor(walletType);
  const previewCurrencies = buildPreviewCurrencies(startingBalances);
  const previewMemberUids = isSharedWallet
    ? Array.from(new Set([currentUserId, ...selectedMemberUids.filter(Boolean)]))
    : undefined;
  const previewOwnerLabel = isSharedWallet
    ? getUserLabel(allUsers[currentUserId], currentUserId)
    : undefined;
  const canCreate = walletName.trim().length > 0;

  const walletTypeText: Record<WalletType, string> = {
    real: t("walletTypeReal"),
    credit: t("walletTypeCredit"),
    shared: t("walletTypeShared"),
  };

  const walletTypeOptions = TYPE_OPTIONS.map((option) => ({
    ...option,
    label: walletTypeText[option.key],
  }));

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
      currentUserId,
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

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
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
              ref={walletNameRef}
              value={walletName}
              onChangeText={setWalletName}
              placeholder={t("walletNamePlaceholder")}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToField(walletNameRef)}
              onSubmitEditing={() => {
                if (walletType === "credit") {
                  creditExpiryRef.current?.focus();
                  return;
                }

                if (walletType === "shared") {
                  sharedSearchRef.current?.focus();
                  return;
                }

                firstAmountRef.current?.focus();
              }}
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
                ref={creditExpiryRef}
                value={creditExpiry}
                onChangeText={(text) => setCreditExpiry(formatExpiryInput(text))}
                placeholder="12/30"
                keyboardType="number-pad"
                autoCapitalize="none"
                maxLength={5}
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => scrollToField(creditExpiryRef)}
                onSubmitEditing={() => firstAmountRef.current?.focus()}
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
              searchInputRef={sharedSearchRef}
              onSearchFocus={() => scrollToField(sharedSearchRef)}
              onSearchSubmit={() => firstAmountRef.current?.focus()}
            />
          ) : null}

          <InitialBalancesSection
            title={t("initialBalances")}
            balances={startingBalances}
            onAddBalance={addBalanceRow}
            onCycleCurrency={cycleBalanceCurrency}
            onAmountChange={updateBalanceAmount}
            firstAmountInputRef={firstAmountRef}
            onFirstAmountFocus={() => scrollToField(firstAmountRef)}
            onFirstAmountSubmit={() => Keyboard.dismiss()}
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
            <ThemedText type="defaultSemiBold" style={styles.cancelText}>
              {("     ")}
            </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
