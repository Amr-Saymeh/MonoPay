import React from "react";
import { View } from "react-native";

import { SharedCard } from "@/src/features/card/SharedCard";

import { styles } from "../styles";

type WalletPreviewProps = {
  name: string;
  emoji: string;
  currencies: Array<{ code: string; balance: number }>;
  ownerLabel?: string;
  memberUids?: string[];
};

export function WalletPreview({
  name,
  emoji,
  currencies,
  ownerLabel,
  memberUids,
}: WalletPreviewProps) {
  return (
    <View style={styles.previewWrapper}>
      <SharedCard
        name={name}
        emoji={emoji}
        currencies={currencies}
        ownerLabel={ownerLabel}
        memberUids={memberUids}
        walletState="active"
      />
    </View>
  );
}
