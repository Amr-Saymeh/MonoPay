import React, { useEffect, useState } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { get, ref, update } from "firebase/database";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useI18n } from "@/hooks/use-i18n";
import { db } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";

import { WalletCarousel } from "./components/WalletCarousel";
import { WalletDetailsCard } from "./components/WalletDetailsCard";
import { useWalletCards } from "./hooks/useWalletCards";
import { styles } from "./styles";
import type { UserWalletLink, WalletCard, WalletRecord } from "./types";
import { CARD_INTERVAL, CARD_WIDTH } from "./utils";

export default function MyWalletsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const [flatListRef] = useState(() => React.createRef<FlatList<WalletCard>>());
  const [deleting, setDeleting] = useState(false);

  const {
    cards,
    loading,
    mainWallet,
    selected,
    selectedIndex,
    selectedKey,
    setSelectedKey,
    userWallets,
  } = useWalletCards({ userId: user?.uid });

  const selectedTypeLabel = (() => {
    const type = String(selected?.wallet?.type ?? "").toLowerCase();
    if (type === "real") return t("walletTypeReal");
    if (type === "credit") return t("walletTypeCredit");
    if (type === "shared") return t("walletTypeShared");
    return String(selected?.wallet?.type ?? "—");
  })();

  const selectedStatusLabel = (() => {
    const state = String(selected?.wallet?.state ?? "").toLowerCase();
    if (state === "active") return t("active");
    if (state === "inactive") return t("inactive");
    return String(selected?.wallet?.state ?? "—");
  })();

  const sideInset = Math.max(0, (screenWidth - CARD_WIDTH) / 2);

  useEffect(() => {
    if (selectedIndex < 0) return;
    flatListRef.current?.scrollToOffset({
      offset: selectedIndex * CARD_INTERVAL,
      animated: true,
    });
  }, [flatListRef, selectedIndex]);

  async function deleteSelectedWallet() {
    if (!user || !selected) return;
    if (!mainWallet) {
      Alert.alert(t("error"), t("mainWalletNotFound"));
      return;
    }
    if (selected.walletid === mainWallet.walletid) {
      Alert.alert(t("error"), t("cannotDeleteMainWallet"));
      return;
    }

    setDeleting(true);
    try {
      const deleteWalletId = selected.walletid;
      const mainWalletId = mainWallet.walletid;

      const [mainSnapshot, walletSnapshot] = await Promise.all([
        get(ref(db, `wallets/wallet${mainWalletId}/currancies`)),
        get(ref(db, `wallets/wallet${deleteWalletId}`)),
      ]);

      const mainCurrencies = (mainSnapshot.val() ?? {}) as Record<string, number>;
      const walletRecord = (walletSnapshot.val() ?? null) as WalletRecord | null;
      const deletedCurrencies = (walletRecord?.currancies ?? {}) as Record<string, number>;

      if (!walletRecord) {
        Alert.alert(t("error"), t("walletNotFound"));
        return;
      }

      if (
        String(walletRecord.type ?? "") === "shared" &&
        walletRecord.ownerUid &&
        walletRecord.ownerUid !== user.uid
      ) {
        Alert.alert(t("error"), t("onlyOwnerCanDelete"));
        return;
      }

      const mergedCurrencies: Record<string, number> = { ...mainCurrencies };
      for (const [code, amount] of Object.entries(deletedCurrencies)) {
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount)) continue;
        const previousAmount = Number(mergedCurrencies[code] ?? 0);
        mergedCurrencies[code] =
          (Number.isFinite(previousAmount) ? previousAmount : 0) + numericAmount;
      }

      const updates: Record<string, unknown> = {
        [`wallets/wallet${mainWalletId}/currancies`]: mergedCurrencies,
        [`wallets/wallet${deleteWalletId}`]: null,
      };

      for (const [key, link] of Object.entries(userWallets)) {
        if (Number(link?.walletid) === deleteWalletId) {
          updates[`users/${user.uid}/userwallet/${key}`] = null;
        }
      }

      const memberUids = Object.keys(walletRecord?.members ?? {});
      for (const uid of memberUids) {
        if (!uid || uid === user.uid) continue;
        const snapshot = await get(ref(db, `users/${uid}/userwallet`));
        const memberWallets = (snapshot.val() ?? {}) as Record<string, UserWalletLink>;

        for (const [key, link] of Object.entries(memberWallets)) {
          if (Number(link?.walletid) === deleteWalletId) {
            updates[`users/${uid}/userwallet/${key}`] = null;
          }
        }
      }

      await update(ref(db), updates);
      setSelectedKey(mainWallet.userWalletKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert(t("error"), message);
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    if (!selected) return;

    Alert.alert(
      t("deleteWalletConfirmTitle"),
      `${t("deleteWalletConfirmMessage")} "${selected.name}"?`,
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => {
            void deleteSelectedWallet();
          },
        },
      ],
    );
  }

  function handleCardsScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_INTERVAL);
    const boundedIndex = Math.max(0, Math.min(index, cards.length - 1));
    const card = cards[boundedIndex];

    if (card && card.userWalletKey !== selectedKey) {
      setSelectedKey(card.userWalletKey);
    }
  }

  const handleManageShared = () => {
    if (!selected?.walletid) return;
    router.push({
      pathname: "/wallets/shared",
      params: { walletId: String(selected.walletid) },
    } as any);
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
      <View style={styles.header}>
        <View>
          <ThemedText type="subtitle" style={styles.title}>
            {t("walletManagement")}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{t("yourWallets")}</ThemedText>
        </View>

        <Pressable
          onPress={() => router.push("/wallets/add" as any)}
          style={({ pressed }) => [styles.addButton, pressed ? styles.pressed : null]}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : cards.length === 0 ? (
        <ThemedView style={styles.empty}>
          <ThemedText type="subtitle">{t("noWalletsYet")}</ThemedText>
          <ThemedText style={styles.emptyText}>{t("tapPlusToAddFirstWallet")}</ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.content}>
          <WalletCarousel
            cards={cards}
            selectedKey={selectedKey}
            sideInset={sideInset}
            flatListRef={flatListRef}
            onScrollEnd={handleCardsScrollEnd}
          />

          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <WalletDetailsCard
              deleting={deleting}
              selected={selected}
              selectedStatusLabel={selectedStatusLabel}
              selectedTypeLabel={selectedTypeLabel}
              onDelete={confirmDelete}
              onManageShared={handleManageShared}
            />
          </ScrollView>
        </View>
      )}
    </ThemedView>
  );
}
