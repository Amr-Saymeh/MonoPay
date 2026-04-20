import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CURRENCY_SYMBOLS } from "../types";
import { EnrichedWalletSlot } from "../hooks/useUserWallets";

interface Props {
  label: string;
  placeholder: string;
  selectedSlot: EnrichedWalletSlot | null;
  wallets: EnrichedWalletSlot[];
  loading: boolean;
  onSelect: (slot: EnrichedWalletSlot) => void;
  isRtl?: boolean;
}

function WalletBadge({ slot }: { slot: EnrichedWalletSlot }) {
  const currencies = Object.keys(slot.wallet?.currancies ?? {});
  const emoji = slot.emoji ?? (slot.wallet?.type === "credit" ? "💳" : "👛");

  return (
    <View style={styles.badgeRow}>
      <View style={[styles.badgeIcon, { backgroundColor: slot.color ?? "#EDE9FE" }]}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.badgeName}>{slot.slotName}</Text>
        <Text style={styles.badgeSub}>
          {slot.wallet?.type === "credit" ? "Credit" : "Wallet"} ·{" "}
          {currencies.length > 0
            ? currencies
                .map(
                  (c) =>
                    `${CURRENCY_SYMBOLS[c] ?? c.toUpperCase()}${(slot.wallet!.currancies![c] ?? 0).toFixed(2)}`,
                )
                .join(", ")
            : "No balance"}
        </Text>
      </View>
    </View>
  );
}

export function WalletPicker({
  label,
  placeholder,
  selectedSlot,
  wallets,
  loading,
  onSelect,
  isRtl = false,
}: Props) {
  const [visible, setVisible] = useState(false);

  const handleSelect = (slot: EnrichedWalletSlot) => {
    onSelect(slot);
    setVisible(false);
  };

  return (
    <>
      {/* ── Trigger ── */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={[
          styles.trigger,
          { flexDirection: isRtl ? "row-reverse" : "row" },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#7C3AED" />
        ) : selectedSlot ? (
          <View style={styles.triggerSelected}>
            <WalletBadge slot={selectedSlot} />
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </View>
        ) : (
          <View style={styles.triggerEmpty}>
            <Ionicons name="wallet-outline" size={20} color="#9CA3AF" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </View>
        )}
      </TouchableOpacity>

      {/* ── Modal ── */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View style={styles.handleWrap}>
              <View style={styles.handleBar} />
            </View>

            <View style={styles.modalInner}>
              <Text style={styles.modalTitle}>{label}</Text>

              {loading ? (
                <ActivityIndicator
                  color="#7C3AED"
                  style={{ paddingVertical: 32 }}
                />
              ) : wallets.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="wallet-outline" size={36} color="#C4B5FD" />
                  </View>
                  <Text style={styles.emptyText}>No active wallets</Text>
                </View>
              ) : (
                <FlatList
                  data={wallets}
                  keyExtractor={(item) => item.slotKey}
                  style={{ maxHeight: 320 }}
                  renderItem={({ item }) => {
                    const isSelected = selectedSlot?.slotKey === item.slotKey;
                    return (
                      <TouchableOpacity
                        onPress={() => handleSelect(item)}
                        activeOpacity={0.7}
                        style={[
                          styles.walletItem,
                          isSelected && styles.walletItemSelected,
                        ]}
                      >
                        <WalletBadge slot={item} />
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#7C3AED"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
              <View style={{ height: 24 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  trigger: {
    backgroundColor: "white",
    borderRadius: 18,
    alignItems: "center",
    paddingHorizontal: 16,
    height: 64,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.06)",
  },
  triggerSelected: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  triggerEmpty: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  placeholderText: {
    color: "#9CA3AF",
    fontSize: 15,
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeName: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 15,
  },
  badgeSub: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  modalInner: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  walletItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  walletItemSelected: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
});
