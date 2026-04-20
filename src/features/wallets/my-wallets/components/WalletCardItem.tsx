import React from "react";

import { View } from "react-native";

import { SharedCard } from "@/src/features/card/SharedCard";

import { styles } from "../styles";
import type { WalletCard } from "../types";
import { buildWalletBalances } from "../utils";

type WalletCardItemProps = {
  card: WalletCard;
  selected: boolean;
};

export const WalletCardItem = React.memo(function WalletCardItem({
  card,
  selected,
}: WalletCardItemProps) {
  const type = String(card.wallet?.type ?? "real");
  const memberUids = type === "shared" ? Object.keys(card.wallet?.members ?? {}) : undefined;
  const ownerLabel = type === "shared" ? card.wallet?.ownerUid : undefined;

  return (
    <View style={[styles.cardWrap, selected ? styles.cardSelected : null]}>
      <SharedCard
        name={card.name}
        emoji={card.emoji}
        currencies={buildWalletBalances(card.wallet)}
        ownerLabel={ownerLabel}
        memberUids={memberUids}
        walletState={card.wallet?.state}
      />
    </View>
  );
});
