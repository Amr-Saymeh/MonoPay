import React from "react";

import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";

type AuthFooterLinkProps = {
  href: any;
  isRtl?: boolean;
  label: string;
  prompt: string;
  tint: string;
};

export function AuthFooterLink({
  href,
  isRtl,
  label,
  prompt,
  tint,
}: AuthFooterLinkProps) {
  return (
    <View style={[styles.row, isRtl ? styles.rowRtl : null]}>
      <ThemedText style={styles.prompt}>{prompt} </ThemedText>
      <Link href={href} style={styles.link}>
        <ThemedText style={[styles.label, { color: tint }]}>{label}</ThemedText>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  rowRtl: {
    flexDirection: "row-reverse",
  },
  prompt: {
    opacity: 0.7,
  },
  link: {
    paddingHorizontal: 2,
  },
  label: {
    fontFamily: Fonts.sansBold,
  },
});