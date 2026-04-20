import React, { useMemo, useState } from "react";

import { ref, update } from "firebase/database";
import { Alert, Button, StyleSheet, View } from "react-native";

import { AuthInput } from "@/components/ui/auth-input";
import { useI18n } from "@/hooks/use-i18n";
import { db } from "@/src/firebaseConfig";

export default function EditCard({
  bundle,
  onComplete,
}: {
  bundle: { id: string; name?: string | null };
  onComplete: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(String(bundle?.name ?? ""));
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    const next = name.trim();
    const current = String(bundle?.name ?? "").trim();
    return next.length > 0 && next !== current;
  }, [bundle?.name, name]);

  const onSave = async () => {
    if (!canSave || saving) {
      onComplete();
      return;
    }

    setSaving(true);
    try {
      await update(ref(db, `Bundles/${bundle.id}`), { name: name.trim() });
      onComplete();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("error");
      Alert.alert(t("error"), msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AuthInput
        value={name}
        onChangeText={setName}
        placeholder={t("bundleName")}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={() => void onSave()}
      />

      <View style={styles.row}>
        <Button title={t("cancel")} onPress={onComplete} disabled={saving} />
        <Button
          title={saving ? t("saving") : t("updateBundle")}
          onPress={() => void onSave()}
          disabled={!canSave || saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
});
