import React from "react";

import { Image } from "expo-image";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";

import { styles } from "../styles";
import type { PendingUser } from "../types";
import { isValidImageUri } from "../utils";
import { ActionButton } from "./ActionButton";

type PendingUserCardProps = {
  item: PendingUser;
  expanded: boolean;
  approveLabel: string;
  rejectLabel: string;
  emailLabel: string;
  phoneLabel: string;
  addressLabel: string;
  identityNumberLabel: string;
  personalLabel: string;
  identityLabel: string;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
};

export function PendingUserCard({
  item,
  expanded,
  approveLabel,
  rejectLabel,
  emailLabel,
  phoneLabel,
  addressLabel,
  identityNumberLabel,
  personalLabel,
  identityLabel,
  onToggle,
  onApprove,
  onReject,
}: PendingUserCardProps) {
  const { id, data } = item;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.cardHeader, pressed ? styles.headerPressed : null]}
      >
        <View style={styles.headerLeft}>
          {isValidImageUri(data.personalImage) ? (
            <Image
              source={{ uri: data.personalImage.trim() }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <View style={styles.headerText}>
            <ThemedText type="subtitle" style={styles.userName}>
              {data.name ?? id}
            </ThemedText>
           
          </View>
        </View>

        <IconSymbol
          size={18}
          name="chevron.right"
          color="#6b7280"
          style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.cardBody}>
          {data.email ? (
            <View style={styles.detailRow}>
              <ThemedText type="defaultSemiBold">{emailLabel}</ThemedText>
              <ThemedText>{data.email}</ThemedText>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <ThemedText type="defaultSemiBold">{phoneLabel}</ThemedText>
            <ThemedText>{data.number ?? "-"}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText type="defaultSemiBold">{addressLabel}</ThemedText>
            <ThemedText>{data.address ?? "-"}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText type="defaultSemiBold">{identityNumberLabel}</ThemedText>
            <ThemedText>{data.identityNumber ?? "-"}</ThemedText>
          </View>

          <View style={styles.imagesRow}>
            <View style={styles.imageBlock}>
              <ThemedText type="defaultSemiBold" style={styles.imageLabel}>
                {personalLabel}
              </ThemedText>
              {isValidImageUri(data.personalImage) ? (
                <Image
                  source={{ uri: data.personalImage.trim() }}
                  style={styles.image}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
            </View>

            <View style={styles.imageBlock}>
              <ThemedText type="defaultSemiBold" style={styles.imageLabel}>
                {identityLabel}
              </ThemedText>
              {isValidImageUri(data.identityImage) ? (
                <Image
                  source={{ uri: data.identityImage.trim() }}
                  style={styles.image}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
            </View>
          </View>

          <View style={styles.actionsRow}>
            <ActionButton label={approveLabel} variant="approve" onPress={onApprove} />
            <ActionButton label={rejectLabel} variant="reject" onPress={onReject} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
