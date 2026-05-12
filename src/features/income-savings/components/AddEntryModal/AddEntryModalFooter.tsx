import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetFooter } from "@gorhom/bottom-sheet";
import { Pressable, View } from "react-native";

import { styles } from "./styles";

type AddEntryModalFooterProps = {
  bottomSheetProps: any;
  saving: boolean;
  sheetBg: string;
  cancelBorder: string;
  cancelTextColor: string;
  onCancel: () => void;
  onSave: () => void;
};

export function AddEntryModalFooter({
  bottomSheetProps,
  saving,
  sheetBg,
  cancelBorder,
  cancelTextColor,
  onCancel,
  onSave,
}: AddEntryModalFooterProps) {
  const { t } = useI18n();

  return (
    <BottomSheetFooter {...bottomSheetProps} bottomInset={0}>
      <View style={[styles.modalButtons, { backgroundColor: sheetBg }]}>
        <Pressable
          style={[styles.cancelBtn, { borderColor: cancelBorder }]}
          onPress={onCancel}
        >
          <View style={styles.actionRow}>
            <MaterialIcons name="close" size={16} color={cancelTextColor} />
            <ThemedText style={[styles.cancelText, { color: cancelTextColor }]}>
              {t("common.cancel")}
            </ThemedText>
          </View>
        </Pressable>
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          disabled={saving}
          onPress={onSave}
        >
          <View style={styles.actionRow}>
            <MaterialIcons
              name={saving ? "hourglass-top" : "add-circle-outline"}
              size={16}
              color="#FFFFFF"
            />
            <ThemedText style={styles.saveText}>
              {saving
                ? t("incomeSavings.modal.saving")
                : t("incomeSavings.modal.saveAndAddBalance")}
            </ThemedText>
          </View>
        </Pressable>
      </View>
    </BottomSheetFooter>
  );
}
