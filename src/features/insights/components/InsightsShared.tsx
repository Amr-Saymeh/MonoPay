import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { styles } from "../styles";
import { IconName } from "../utils/insights";

export type Palette = {
  bg: string;
  blue: string;
  border: string;
  card: string;
  colorsText: string;
  green: string;
  muted: string;
  orange: string;
  purple: string;
  scheme: "light" | "dark";
};

type ChipProps = {
  active: boolean;
  color: string;
  icon?: IconName;
  label: string;
  onPress: () => void;
  textColor: string;
};

export function Chip({ active, color, icon, label, onPress, textColor }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? color : "transparent",
          borderColor: active ? color : "rgba(148,163,184,0.3)",
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={active ? "#fff" : textColor} /> : null}
      <Text style={[styles.chipText, { color: active ? "#fff" : textColor }]}>{label}</Text>
    </Pressable>
  );
}

type ModalOption = {
  color?: string;
  key: string;
  label: string;
};

type FilterSelectorProps = {
  accent: string;
  isRtl: boolean;
  label: string;
  onPress: () => void;
  palette: Palette;
  value: string;
};

export function FilterSelector({
  accent,
  isRtl,
  label,
  onPress,
  palette,
  value,
}: FilterSelectorProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.selectorCard,
        isRtl ? styles.selectorCardRtl : null,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <Text style={[styles.selectorLabel, isRtl ? styles.textRtl : null, { color: palette.muted }]}>
        {label}
      </Text>
      <View style={[styles.selectorValueRow, isRtl ? styles.selectorValueRowRtl : null]}>
        <Text
          style={[styles.selectorValue, isRtl ? styles.textRtl : null, { color: palette.colorsText }]}
          numberOfLines={1}
        >
          {value}
        </Text>
        <Ionicons
          name={isRtl ? "chevron-back" : "chevron-forward"}
          size={18}
          color={accent}
        />
      </View>
    </Pressable>
  );
}

type SelectorModalProps = {
  onClose: () => void;
  onSelect: (key: string) => void;
  options: ModalOption[];
  palette: Palette;
  selected: string;
  title: string;
  visible: boolean;
};

export function SelectorModal({
  onClose,
  onSelect,
  options,
  palette,
  selected,
  title,
  visible,
}: SelectorModalProps) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: palette.card, borderColor: palette.border }]}
          onPress={() => undefined}
        >
          <View style={[styles.modalGrabber, { backgroundColor: palette.border }]} />
          <Text style={[styles.modalTitle, { color: palette.colorsText }]}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const active = option.key === selected;

              return (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    onSelect(option.key);
                    onClose();
                  }}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: active ? `${option.color ?? palette.purple}18` : "transparent",
                      borderColor: active ? option.color ?? palette.purple : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: active ? option.color ?? palette.purple : palette.colorsText },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function lineSegments(points: { x: number; y: number }[], color: string) {
  return points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    const dx = next.x - point.x;
    const dy = next.y - point.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    return (
      <View
        key={`${color}-${index}`}
        style={[
          styles.segment,
          {
            width: length,
            left: (point.x + next.x) / 2 - length / 2,
            top: (point.y + next.y) / 2 - 1.5,
            backgroundColor: color,
            transform: [{ rotateZ: `${angle}rad` }],
          },
        ]}
      />
    );
  });
}