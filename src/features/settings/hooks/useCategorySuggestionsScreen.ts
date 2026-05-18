import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Alert, Keyboard } from "react-native";

import { useI18n } from "@/hooks/use-i18n";

import {
    buildCategorySuggestionState,
    getCategoryScrollPosition,
    getPreparedCustomCategory,
    normalizeCategoryName,
    syncCategoryValues,
    syncLocalizedCategoryValues,
    toggleSelectedCategory,
} from "../utils/categoryUtils";
import { useCategoryData } from "./useCategoryData";

const ADD_CATEGORY_SCROLL_DELAY_MS = 150;
const SETTINGS_ROUTE = "/(tabs)/settings";
const SIGNUP_ROUTE = "/(auth)/signup-details";
const NEXT_ROUTE = "/(auth)/id-scan";

type UseCategorySuggestionsScreenParams = {
  cloudHeight: number;
  scrollViewRef: RefObject<any>;
};

export function useCategorySuggestionsScreen({
  cloudHeight,
  scrollViewRef,
}: UseCategorySuggestionsScreenParams) {
  const { t, language } = useI18n();
  const router = useRouter();
  const {
    initialSelected,
    initializing,
    isSettingsMode,
    localizedDefaults,
    persistCategories,
    profileCategories,
    profileLoaded,
    signupCategories,
    signupDetails,
  } = useCategoryData();

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const userEditedRef = useRef(false);

  const { allCategories, filteredCategories, selectedSet } = useMemo(
    () =>
      buildCategorySuggestionState({
        customCategories,
        language,
        localizedDefaults,
        profileCategories,
        query,
        selected,
        showSelectedOnly,
        signupCategories,
      }),
    [
      customCategories,
      language,
      localizedDefaults,
      profileCategories,
      query,
      selected,
      showSelectedOnly,
      signupCategories,
    ],
  );

  const showLoading =
    initializing ||
    (isSettingsMode && !profileLoaded) ||
    (!isSettingsMode && !signupDetails);

  useEffect(() => {
    if (userEditedRef.current) return;

    setSelected((current) => syncCategoryValues(current, initialSelected));
  }, [initialSelected]);

  useEffect(() => {
    setSelected((current) => syncLocalizedCategoryValues(current, language));
    setCustomCategories((current) => syncLocalizedCategoryValues(current, language));
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      if (initializing) return;
      if (isSettingsMode && !profileLoaded) return;

      if (!isSettingsMode && !signupDetails) {
        router.replace(SIGNUP_ROUTE as any);
      }
    }, [initializing, isSettingsMode, profileLoaded, router, signupDetails]),
  );

  const handleBack = useCallback(() => {
    if ((router as any).canGoBack?.()) {
      router.back();
      return;
    }

    if (isSettingsMode) {
      router.replace(SETTINGS_ROUTE as any);
      return;
    }

    router.replace(SIGNUP_ROUTE as any);
  }, [isSettingsMode, router]);

  const handleToggleCategory = useCallback((name: string) => {
    userEditedRef.current = true;
    setSelected((current) => toggleSelectedCategory(current, name));
  }, []);

  const handleOpenAdd = useCallback(() => {
    setAdding(true);
  }, []);

  const handleCancelAdd = useCallback(() => {
    setCustomName("");
    setAdding(false);
    Keyboard.dismiss();
  }, []);

  const handleAddCustomCategory = useCallback(() => {
    const result = getPreparedCustomCategory({
      allCategories,
      customCategories,
      customName,
      selected,
    });

    if (!result) {
      return;
    }

    userEditedRef.current = true;
    setCustomCategories(result.customCategories);
    setSelected(result.selected);
    setCustomName("");
    setAdding(false);
    setQuery("");
    setShowSelectedOnly(false);
    Keyboard.dismiss();

    setTimeout(() => {
      const { filteredCategories: nextFilteredCategories } = buildCategorySuggestionState({
        customCategories: result.customCategories,
        language,
        localizedDefaults,
        profileCategories,
        query: "",
        selected: result.selected,
        showSelectedOnly: false,
        signupCategories,
      });

      const targetIndex = nextFilteredCategories.findIndex(
        (category) => normalizeCategoryName(category) === normalizeCategoryName(result.focusCategory),
      );

      if (targetIndex < 0 || !scrollViewRef.current) return;

      scrollViewRef.current.scrollTo?.({
        y: getCategoryScrollPosition(targetIndex, cloudHeight),
        animated: true,
      });
    }, ADD_CATEGORY_SCROLL_DELAY_MS);
  }, [
    allCategories,
    cloudHeight,
    customCategories,
    customName,
    language,
    localizedDefaults,
    profileCategories,
    scrollViewRef,
    selected,
    signupCategories,
  ]);

  const finish = useCallback(async () => {
    if (saving) return;

    setSaving(true);
    try {
      await persistCategories(selected);

      if (isSettingsMode) {
        if ((router as any).canGoBack?.()) {
          router.back();
        } else {
          router.replace(SETTINGS_ROUTE as any);
        }
        return;
      }

      router.push(NEXT_ROUTE as any);
    } catch (error) {
      Alert.alert(t("error"), error instanceof Error ? error.message : "Failed");
    } finally {
      setSaving(false);
    }
  }, [isSettingsMode, persistCategories, router, saving, selected, t]);

  const handlePrimaryPress = useCallback(() => {
    if (adding) {
      handleAddCustomCategory();
      return;
    }

    void finish();
  }, [adding, finish, handleAddCustomCategory]);

  return {
    adding,
    customName,
    filteredCategories,
    handleBack,
    handleCancelAdd,
    handleOpenAdd,
    handlePrimaryPress,
    handleToggleCategory,
    isSettingsMode,
    primaryDisabled: adding ? !customName.trim() : saving,
    primaryLabel: adding ? t("add") : isSettingsMode ? t("save") : t("next"),
    query,
    saving,
    selectedSet,
    setCustomName,
    setQuery,
    showLoading,
    showSelectedOnly,
    toggleSelectedOnly: () => setShowSelectedOnly((current) => !current),
  };
}