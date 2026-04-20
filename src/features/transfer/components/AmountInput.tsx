import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { CURRENCY_SYMBOLS } from "../types/index";

interface Props {
  amount: string;
  currency: string;
  availableCurrencies: string[];
  onAmountChange: (val: string) => void;
  onCurrencyChange: (val: string) => void;
  isRtl?: boolean;
  placeholder?: string;
}

export function AmountInput({
  amount,
  currency,
  availableCurrencies,
  onAmountChange,
  onCurrencyChange,
  isRtl = false,
  placeholder = "0.00",
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[0] && parts[0].length > 4) return;
    if (parts[1] && parts[1].length > 2) return;
    onAmountChange(cleaned);
  };

  return (
    <>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[styles.container, { direction: isRtl ? "rtl" : "ltr" }]}
      >
        {/* Currency Selector */}
        <TouchableOpacity
          onPress={() => availableCurrencies.length > 1 && setShowPicker(true)}
          style={styles.currencyBtn}
          activeOpacity={availableCurrencies.length > 1 ? 0.6 : 1}
        >
          <View style={styles.currencyBadge}>
            <Text style={styles.currencySymbol}>{symbol}</Text>
          </View>
          {availableCurrencies.length > 1 && (
            <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Amount Input */}
        <TextInput
          ref={inputRef}
          value={amount}
          onChangeText={handleAmountChange}
          placeholder={placeholder}
          placeholderTextColor="#D1D5DB"
          keyboardType="decimal-pad"
          style={styles.input}
          textAlign={isRtl ? "right" : "left"}
          returnKeyType="done"
        />
      </Pressable>

      {/* Currency Picker Modal */}
      {availableCurrencies.length > 1 && (
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.modalContent}>
              {/* Handle */}
              <View style={styles.handleWrap}>
                <View style={styles.handleBar} />
              </View>

              <Text style={styles.modalTitle}>Select Currency</Text>

              {availableCurrencies.map((cur) => {
                const isSelected = cur === currency;
                return (
                  <TouchableOpacity
                    key={cur}
                    onPress={() => {
                      onCurrencyChange(cur);
                      setShowPicker(false);
                    }}
                    style={[
                      styles.currencyItem,
                      isSelected && styles.currencyItemSelected,
                    ]}
                  >
                    <View style={styles.currencyItemLeft}>
                      <View style={styles.currencyItemBadge}>
                        <Text style={styles.currencyItemSymbol}>
                          {CURRENCY_SYMBOLS[cur] ?? cur.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.currencyItemLabel}>
                        {cur.toUpperCase()}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#7C3AED"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

              <View style={{ height: 16 }} />
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 64,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.06)",
  },
  currencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 12,
  },
  currencyBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  currencySymbol: {
    color: "#7C3AED",
    fontWeight: "bold",
    fontSize: 18,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  currencyItemSelected: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  currencyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currencyItemBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  currencyItemSymbol: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  currencyItemLabel: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
});
