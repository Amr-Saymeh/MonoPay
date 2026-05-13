import React, { useEffect, useMemo, useRef, useState } from "react";

import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Alert, Dimensions, Keyboard, Platform, View } from "react-native";
import Animated, { FadeInDown, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { CategoryBubble } from "@/src/features/settings/components/category-suggestions/CategoryBubble";
import { CategorySuggestionsFooter } from "@/src/features/settings/components/category-suggestions/CategorySuggestionsFooter";
import { CategorySuggestionsHeader } from "@/src/features/settings/components/category-suggestions/CategorySuggestionsHeader";
import { CategorySuggestionsSearchBar } from "@/src/features/settings/components/category-suggestions/CategorySuggestionsSearchBar";
import { styles } from "@/src/features/settings/components/category-suggestions/styles";
import { useCategorySuggestions } from "@/src/features/settings/hooks/useCategorySuggestions";
import {
  buildCategorySuggestionState,
  getCategoryScrollPosition,
  getPreparedCustomCategory,
  normalizeCategoryName,
  syncCategoryValues,
  syncLocalizedCategoryValues,
  toggleSelectedCategory,
} from "@/src/features/settings/utils/categorySuggestions";

const DEFAULT_CLOUD_HEIGHT = Dimensions.get("window").height * 0.6;

export default function CategorySuggestionsScreen() {
  const insets = useSafeAreaInsets();
  const { t, isRtl } = useI18n();
  const { language } = useI18n();
  const router = useRouter();
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    screenBg: useThemeColor({ light: "#F8F5FC", dark: "#0F0D13" }, "background"),
    text: useThemeColor({ light: "#1A1A2E", dark: "#F5F5F7" }, "text"),
    muted: useThemeColor({ light: "#6B7280", dark: "rgba(255,255,255,0.6)" }, "text"),
    inputBg: useThemeColor({ light: "#FFFFFF", dark: "rgba(255,255,255,0.08)" }, "inputBackground"),
    accent: useThemeColor({ light: "#6200EE", dark: "#A78BFA" }, "tint"),
    accentStrong: useThemeColor({ light: "#6200EE", dark: "#8B5CF6" }, "tint"),
    border: useThemeColor(
      { light: "rgba(98,0,238,0.15)", dark: "rgba(167,139,250,0.34)" },
      "border",
    ),
    surfaceSoft: useThemeColor(
      { light: "rgba(232,222,248,0.45)", dark: "rgba(167,139,250,0.16)" },
      "surface",
    ),
    closeBg: useThemeColor({ light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.12)" }, "surface"),
    placeholder: useThemeColor({ light: "#9CA3AF", dark: "rgba(255,255,255,0.4)" }, "placeholder"),
  };

  const idleBubbleBg = isDark ? "rgba(167,139,250,0.2)" : "rgba(232,222,248,0.6)";
  const idleBubbleText = isDark ? "#E9D5FF" : "#6200EE";
  const activeBubbleBg = isDark ? "#8B5CF6" : "#6200EE";
  const ctaShadow = isDark ? "rgba(139,92,246,0.65)" : "#6200EE";

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
  } = useCategorySuggestions();

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [cloudHeight, setCloudHeight] = useState(DEFAULT_CLOUD_HEIGHT);

  const scrollY = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const dirtyRef = useRef(false);

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
    [customCategories, language, localizedDefaults, profileCategories, query, selected, showSelectedOnly, signupCategories],
  );

  useEffect(() => {
    if (dirtyRef.current) return;

    setSelected((current) => syncCategoryValues(current, initialSelected));
  }, [initialSelected]);

  useEffect(() => {
    setSelected((current) => syncLocalizedCategoryValues(current, language));
    setCustomCategories((current) => syncLocalizedCategoryValues(current, language));
  }, [language]);

  useEffect(() => {
    if (!isFocused) return;
    if (initializing) return;
    if (isSettingsMode && !profileLoaded) return;
    if (!isSettingsMode && !signupDetails) {
      router.replace("/(auth)/signup-details" as any);
    }
  }, [initializing, isFocused, isSettingsMode, profileLoaded, router, signupDetails]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleBack = () => {
    if ((router as any).canGoBack?.()) {
      router.back();
      return;
    }

    if (isSettingsMode) {
      router.replace("/(tabs)/settings" as any);
      return;
    }

    router.replace("/(auth)/signup-details" as any);
  };

  const handleToggleCategory = async (name: string) => {
    dirtyRef.current = true;

    const nextSelected = toggleSelectedCategory(selected, name);
    setSelected(nextSelected);
    await persistCategories(nextSelected, { silent: true });
  };

  const handleAddCustomCategory = async () => {
    const result = getPreparedCustomCategory({
      allCategories,
      customCategories,
      customName,
      selected,
    });

    if (!result) {
      return;
    }

    dirtyRef.current = true;
    setCustomCategories(result.customCategories);
    setSelected(result.selected);
    setCustomName("");
    setAdding(false);
    Keyboard.dismiss();

    await persistCategories(result.selected, { silent: true });

    setTimeout(() => {
      const { sortedCategories: nextSorted } = buildCategorySuggestionState({
        customCategories: result.customCategories,
        language,
        localizedDefaults,
        profileCategories,
        query: "",
        selected: result.selected,
        showSelectedOnly: false,
        signupCategories,
      });
      const targetIndex = nextSorted.findIndex(
        (category) => normalizeCategoryName(category) === normalizeCategoryName(result.focusCategory),
      );

      if (targetIndex < 0 || !scrollViewRef.current) return;

      (scrollViewRef.current as any).scrollTo({
        y: getCategoryScrollPosition(targetIndex, cloudHeight),
        animated: true,
      });
    }, 150);
  };

  const finish = async () => {
    setSaving(true);
    try {
      await persistCategories(selected);

      if (isSettingsMode) {
        if ((router as any).canGoBack?.()) {
          router.back();
        } else {
          router.replace("/(tabs)/settings" as any);
        }
        return;
      }

      router.push("/(auth)/id-scan" as any);
    } catch (error) {
      Alert.alert(t("error"), error instanceof Error ? error.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.screenBg }]}>
      <CategorySuggestionsHeader
        accent={colors.accent}
        borderColor={colors.border}
        isRtl={isRtl}
        onBack={handleBack}
        onOpenAdd={() => setAdding(true)}
        surfaceColor={colors.surfaceSoft}
        textColor={colors.text}
        title={t("allCategories")}
        topPadding={insets.top + 12}
      />

      <CategorySuggestionsSearchBar
        accent={colors.accent}
        accentStrong={colors.accentStrong}
        backgroundColor={colors.inputBg}
        borderColor={colors.border}
        isDark={isDark}
        isRtl={isRtl}
        onChangeQuery={setQuery}
        placeholder={isRtl ? "ابحث في الفئات..." : "Search categories..."}
        placeholderColor={colors.placeholder}
        query={query}
        textColor={colors.text}
        toggleSelectedOnly={() => setShowSelectedOnly((current) => !current)}
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        onLayout={(event) => setCloudHeight(event.nativeEvent.layout.height)}
        contentContainerStyle={[
          styles.cloudContent,
          {
            justifyContent: filteredCategories.length < 15 ? "center" : "flex-start",
            minHeight: filteredCategories.length < 15 ? cloudHeight : undefined,
            paddingBottom: Math.max(180, insets.bottom + 140),
          },
        ]}
      >
        {filteredCategories.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(200)} style={styles.emptyBox}>
            <ThemedText style={[styles.emptyText, { color: colors.muted }]}>
              {isRtl ? "لم يتم العثور على فئات." : "No categories found."}
            </ThemedText>
          </Animated.View>
        ) : (
          <View style={[styles.cloudGrid, isRtl ? styles.cloudGridRtl : null]}>
            {filteredCategories.map((category) => (
              <CategoryBubble
                key={normalizeCategoryName(category)}
                activeBubbleBg={activeBubbleBg}
                activeLabelColor="#FFFFFF"
                activeShadowColor={colors.accentStrong}
                containerHeight={cloudHeight}
                disableFisheye={query.length > 0}
                idleBubbleBg={idleBubbleBg}
                idleLabelColor={idleBubbleText}
                isRtl={isRtl}
                name={category}
                onPress={() => void handleToggleCategory(category)}
                scrollY={scrollY}
                selected={selectedSet.has(normalizeCategoryName(category))}
              />
            ))}
          </View>
        )}
      </Animated.ScrollView>

      <CategorySuggestionsFooter
        adding={adding}
        bottomPadding={Math.max(insets.bottom + 16, 24) + keyboardHeight}
        closeBg={colors.closeBg}
        ctaDisabled={adding && !customName.trim()}
        ctaLabel={adding ? t("add") : isSettingsMode ? t("save") : t("next")}
        ctaShadow={ctaShadow}
        customName={customName}
        inputBg={colors.inputBg}
        isDark={isDark}
        isRtl={isRtl}
        mutedColor={colors.muted}
        onCancelAdd={() => {
          setCustomName("");
          setAdding(false);
        }}
        onChangeCustomName={setCustomName}
        onPrimaryPress={() => {
          if (adding) {
            void handleAddCustomCategory();
            return;
          }

          void finish();
        }}
        placeholder={t("customCategoryPlaceholder")}
        placeholderColor={colors.placeholder}
        saving={saving}
        textColor={colors.text}
        tintBorder={colors.border}
      />
    </ThemedView>
  );
}