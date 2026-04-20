import React from "react";

import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "../styles";

type EmojiSelectorProps = {
  options: string[];
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
};

export function EmojiSelector({ options, selectedEmoji, onSelect }: EmojiSelectorProps) {
  return (
    <View style={styles.emojiRow}>
      {options.map((emoji) => {
        const selected = emoji === selectedEmoji;

        return (
          <Pressable
            key={emoji}
            onPress={() => onSelect(emoji)}
            style={({ pressed }) => [
              styles.emojiButton,
              selected ? styles.emojiSelected : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <ThemedText style={styles.emojiText}>{emoji}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
