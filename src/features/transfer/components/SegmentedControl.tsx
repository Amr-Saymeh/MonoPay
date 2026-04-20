import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isRtl?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  isRtl = false,
}: Props<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value);
  const animatedValue = useRef(new Animated.Value(selectedIndex)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: selectedIndex,
      useNativeDriver: false,
      tension: 120,
      friction: 10,
    }).start();
  }, [selectedIndex, animatedValue]);

  const segmentWidth = animatedValue.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map(() => `${100 / options.length}%`),
  });

  const segmentLeft = animatedValue.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map((_, i) => `${(i * 100) / options.length}%`),
  });

  return (
    <View style={styles.container}>
      {/* Animated pill */}
      <Animated.View
        style={[
          styles.pill,
          { width: segmentWidth, left: segmentLeft },
        ]}
      />

      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={styles.segment}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={styles.segmentIcon}>{option.icon}</Text>
            <Text
              style={[
                styles.segmentLabel,
                isActive ? styles.segmentLabelActive : styles.segmentLabelInactive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    padding: 4,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pill: {
    position: "absolute",
    top: 4,
    bottom: 4,
    backgroundColor: "white",
    borderRadius: 14,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  segmentIcon: {
    fontSize: 16,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  segmentLabelActive: {
    color: "#7C3AED",
  },
  segmentLabelInactive: {
    color: "rgba(255,255,255,0.75)",
  },
});
