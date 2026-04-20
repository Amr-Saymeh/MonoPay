import React from "react";

import { FlatList, type NativeScrollEvent, type NativeSyntheticEvent, View } from "react-native";

import type { WalletCard } from "../types";
import { CARD_INTERVAL } from "../utils";
import { WalletCardItem } from "./WalletCardItem";
import { styles } from "../styles";

type WalletCarouselProps = {
  cards: WalletCard[];
  selectedKey: string | null;
  sideInset: number;
  flatListRef: React.RefObject<FlatList<WalletCard> | null>;
  onScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function WalletCarousel({
  cards,
  selectedKey,
  sideInset,
  flatListRef,
  onScrollEnd,
}: WalletCarouselProps) {
  return (
    <View style={styles.cardsContainer}>
      <FlatList
        ref={flatListRef}
        horizontal
        data={cards}
        extraData={selectedKey}
        keyExtractor={(item) => item.userWalletKey}
        showsHorizontalScrollIndicator={false}
        disableVirtualization
        contentContainerStyle={[styles.cardsRow, { paddingHorizontal: sideInset }]}
        snapToInterval={CARD_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        getItemLayout={(_, index) => ({
          length: CARD_INTERVAL,
          offset: CARD_INTERVAL * index,
          index,
        })}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        renderItem={({ item }) => (
          <WalletCardItem
            card={item}
            selected={selectedKey === item.userWalletKey}
          />
        )}
      />
    </View>
  );
}
