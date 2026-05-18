import { useMemo, useRef, useState } from "react";

import { Dimensions, View } from "react-native";
import Animated, { FadeInDown, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useI18n } from "@/hooks/use-i18n";
import { CategoryBubble } from "@/src/features/settings/components/category-suggestions/CategoryBubble";
import { CategorySuggestionsFooter } from "@/src/features/settings/components/category-suggestions/CategorySuggestionsFooter";
import { CategorySuggestionsHeader } from "@/src/features/settings/components/category-suggestions/CategorySuggestionsHeader";
import { CategorySuggestionsLoading } from "@/src/features/settings/components/category-suggestions/CategorySuggestionsLoading";
import { CategorySuggestionsSearchBar } from "@/src/features/settings/components/category-suggestions/CategorySuggestionsSearchBar";
import { styles } from "@/src/features/settings/components/category-suggestions/styles";
import { useCategorySuggestionsPalette } from "@/src/features/settings/hooks/useCategorySuggestionsPalette";
import { useCategorySuggestionsScreen } from "@/src/features/settings/hooks/useCategorySuggestionsScreen";
import { useKeyboardInset } from "@/src/features/settings/hooks/useKeyboardInset";
import {
  normalizeCategoryName,
} from "@/src/features/settings/utils/categoryUtils";

const CLOUD_HEIGHT_RATIO = 0.6;
const CATEGORY_CENTER_THRESHOLD = 15;
const FOOTER_MIN_SCROLL_PADDING = 180;
const FOOTER_SCROLL_PADDING = 140;
const FOOTER_INSET_PADDING = 16;
const FOOTER_MIN_PADDING = 24;
const HEADER_TOP_PADDING = 12;

const DEFAULT_CLOUD_HEIGHT = Dimensions.get("window").height * CLOUD_HEIGHT_RATIO;

export default function CategorySuggestionsScreen() {
  const insets = useSafeAreaInsets();
  const { t, isRtl } = useI18n();
  const {
    activeBubbleBg,
    colors,
    ctaShadow,
    idleBubbleBg,
    idleBubbleText,
    isDark,
  } = useCategorySuggestionsPalette();
  const [cloudHeight, setCloudHeight] = useState(DEFAULT_CLOUD_HEIGHT);
  const keyboardInset = useKeyboardInset();
  const scrollY = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const {
    adding,
    customName,
    filteredCategories,
    handleBack,
    handleCancelAdd,
    handleOpenAdd,
    handlePrimaryPress,
    handleToggleCategory,
    primaryDisabled,
    primaryLabel,
    query,
    saving,
    selectedSet,
    setCustomName,
    setQuery,
    showLoading,
    toggleSelectedOnly,
  } = useCategorySuggestionsScreen({ cloudHeight, scrollViewRef });

  const contentBottomPadding = useMemo(
    () => Math.max(FOOTER_MIN_SCROLL_PADDING, insets.bottom + FOOTER_SCROLL_PADDING),
    [insets.bottom],
  );
  const footerBottomPadding = useMemo(
    () => Math.max(insets.bottom + FOOTER_INSET_PADDING, FOOTER_MIN_PADDING) + keyboardInset,
    [insets.bottom, keyboardInset],
  );

  if (showLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.screenBg }]}>
        <CategorySuggestionsLoading
          accent={colors.accentStrong}
          borderColor={colors.border}
          mutedColor={colors.muted}
          surfaceColor={colors.inputBg}
          textColor={colors.text}
          title={t("allCategories")}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.screenBg }]}>
      <CategorySuggestionsHeader
        accent={colors.accent}
        borderColor={colors.border}
        isRtl={isRtl}
        onBack={handleBack}
        onOpenAdd={handleOpenAdd}
        surfaceColor={colors.surfaceSoft}
        textColor={colors.text}
        title={t("allCategories")}
        topPadding={insets.top + HEADER_TOP_PADDING}
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
        toggleSelectedOnly={toggleSelectedOnly}
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
            justifyContent: filteredCategories.length < CATEGORY_CENTER_THRESHOLD ? "center" : "flex-start",
            minHeight: filteredCategories.length < CATEGORY_CENTER_THRESHOLD ? cloudHeight : undefined,
            paddingBottom: contentBottomPadding,
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
                onPress={() => handleToggleCategory(category)}
                scrollY={scrollY}
                selected={selectedSet.has(normalizeCategoryName(category))}
              />
            ))}
          </View>
        )}
      </Animated.ScrollView>

      <CategorySuggestionsFooter
        adding={adding}
        bottomPadding={footerBottomPadding}
        closeBg={colors.closeBg}
        ctaDisabled={primaryDisabled}
        ctaLabel={primaryLabel}
        ctaShadow={ctaShadow}
        customName={customName}
        inputBg={colors.inputBg}
        isDark={isDark}
        isRtl={isRtl}
        mutedColor={colors.muted}
        onCancelAdd={handleCancelAdd}
        onChangeCustomName={setCustomName}
        onPrimaryPress={handlePrimaryPress}
        placeholder={t("customCategoryPlaceholder")}
        placeholderColor={colors.placeholder}
        saving={saving}
        textColor={colors.text}
        tintBorder={colors.border}
      />
    </ThemedView>
  );
}