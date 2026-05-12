import { ThemedText } from "@/components/themed-text";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetFooter } from "@gorhom/bottom-sheet";
import React from "react";
import { Pressable, View } from "react-native";

import { styles } from "./stylesheet";

type ContributionModalFooterProps = {
  bottomSheetProps: any;
  backgroundColor: string;
  cancelBorder: string;
  cancelTextColor: string;
  disabled: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ContributionModalFooter({
  bottomSheetProps,
  backgroundColor,
  cancelBorder,
  cancelTextColor,
  disabled,
  loading,
  onCancel,
  onConfirm,
}: ContributionModalFooterProps) {
  const { t } = useI18n();

  return (
    <BottomSheetFooter {...bottomSheetProps} bottomInset={0}>
      <View style={[styles.buttons, { backgroundColor }]}>
        <Pressable
          onPress={onCancel}
          style={[styles.cancelBtn, { borderColor: cancelBorder }]}
        >
          <View style={styles.actionRow}>
            <MaterialIcons name="close" size={16} color={cancelTextColor} />
            <ThemedText style={[styles.cancelText, { color: cancelTextColor }]}>
              {t("common.cancel")}
            </ThemedText>
          </View>
        </Pressable>
        <View style={styles.confirmBtn}>
          <GradientButton
            label={t("goals.contribute")}
            iconName="add-circle-outline"
            onPress={onConfirm}
            loading={loading}
            disabled={disabled}
          />
        </View>
      </View>
    </BottomSheetFooter>
  );
}

