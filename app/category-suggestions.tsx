import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Alert,
  Dimensions,
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { useSignup } from "@/hooks/use-signup-flow";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  DEFAULT_PRESELECTED,
  getLocalizedSuggestions,
  localizeCategoryList,
} from "@/src/features/categories/data";
import {
  normalizeCategoryName,
  sameNormalizedSet,
  sortCloudCategories,
  uniqByNormalized,
} from "@/src/features/categories/utils";
import { useAuth } from "@/src/providers/AuthProvider";
import { updateUserProfile } from "@/src/services/user.service";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BubbleProps {
  name: string;
  selected: boolean;
  index: number;
  totalCount: number;
  onPress: () => void;
  isRtl: boolean;
  scrollY: SharedValue<number>;
  containerHeight: number;
  disableFisheye?: boolean;
  idleBubbleBg: string;
  activeBubbleBg: string;
  idleLabelColor: string;
  activeLabelColor: string;
  activeShadowColor: string;
}

function Bubble({
  name,
  selected,
  index,
  totalCount,
  onPress,
  isRtl,
  scrollY,
  containerHeight,
  disableFisheye,
  idleBubbleBg,
  activeBubbleBg,
  idleLabelColor,
  activeLabelColor,
  activeShadowColor,
}: BubbleProps) {
  const selectAnim = useSharedValue(selected ? 1 : 0);
  const pressScale = useSharedValue(1);
  const itemY = useSharedValue(0);

  useEffect(() => {
    selectAnim.value = withTiming(selected ? 1 : 0, { duration: 150 });
  }, [selected, selectAnim]);

  const onLayout = (e: LayoutChangeEvent) => {
    itemY.value = e.nativeEvent.layout.y;
  };

  const animatedStyle = useAnimatedStyle(() => {
    // Disable fisheye when searching
    if (disableFisheye) {
      return {
        transform: [{ scale: pressScale.value }],
        opacity: 1,
      };
    }

    const viewportCenter = containerHeight / 2;
    const itemCenter = itemY.value - scrollY.value + 25;
    const distanceFromCenter = Math.abs(itemCenter - viewportCenter);
    const maxDistance = containerHeight / 2;
    const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);

    const scale = interpolate(
      normalizedDistance,
      [0, 0.5, 1],
      [1.1, 0.95, 0.75],
    );
    const opacity = interpolate(
      normalizedDistance,
      [0, 0.4, 1],
      [1, 0.7, 0.35],
    );

    return {
      transform: [{ scale: scale * pressScale.value }],
      opacity,
    };
  });

  const bubbleStyle = useAnimatedStyle(() => {
    const bgOpacity = interpolate(selectAnim.value, [0, 1], [0.6, 1]);
    return {
      shadowOpacity: selectAnim.value * 0.4,
      elevation: selectAnim.value * 6,
    };
  });

  return (
    <Animated.View
      style={[styles.bubbleWrap, animatedStyle]}
      onLayout={onLayout}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          pressScale.value = withSpring(0.92, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, { damping: 20, stiffness: 400 });
        }}
      >
        <Animated.View style={bubbleStyle}>
          {selected ? (
            <View
              style={[
                styles.bubble,
                styles.bubbleActive,
                {
                  backgroundColor: activeBubbleBg,
                  shadowColor: activeShadowColor,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.bubbleLabel,
                  styles.bubbleLabelActive,
                  { color: activeLabelColor },
                  isRtl && styles.rtlText,
                ]}
              >
                {name}
              </ThemedText>
            </View>
          ) : (
            <View
              style={[styles.bubble, styles.bubbleIdle, { backgroundColor: idleBubbleBg }]}
            >
              <ThemedText
                style={[
                  styles.bubbleLabel,
                  styles.bubbleLabelIdle as any,
                  { color: idleLabelColor },
                  isRtl && styles.rtlText,
                ]}
              >
                {name}
              </ThemedText>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function CategorySuggestionsScreen() {
  const { t, isRtl, language } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, profile, initializing, profileLoaded } = useAuth();
  const signup = useSignup();
  const colorScheme = useColorScheme();

  const isSettingsMode = Boolean(user);
  const isDark = colorScheme === "dark";

  const screenBg = useThemeColor(
    { light: "#F8F5FC", dark: "#0F0D13" },
    "background",
  );
  const textColor = useThemeColor(
    { light: "#1A1A2E", dark: "#F5F5F7" },
    "text",
  );
  const mutedColor = useThemeColor(
    { light: "#6B7280", dark: "rgba(255,255,255,0.6)" },
    "text",
  );
  const inputBg = useThemeColor(
    { light: "#FFFFFF", dark: "rgba(255,255,255,0.08)" },
    "inputBackground",
  );
  const accent = useThemeColor({ light: "#6200EE", dark: "#A78BFA" }, "tint");
  const accentStrong = useThemeColor(
    { light: "#6200EE", dark: "#8B5CF6" },
    "tint",
  );
  const chromeBorder = useThemeColor(
    { light: "rgba(98,0,238,0.15)", dark: "rgba(167,139,250,0.34)" },
    "border",
  );
  const surfaceSoft = useThemeColor(
    { light: "rgba(232,222,248,0.45)", dark: "rgba(167,139,250,0.16)" },
    "surface",
  );
  const closeBg = useThemeColor(
    { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.12)" },
    "surface",
  );
  const idleBubbleBg = isDark ? "rgba(167,139,250,0.2)" : "rgba(232,222,248,0.6)";
  const idleBubbleText = isDark ? "#E9D5FF" : "#6200EE";
  const activeBubbleBg = isDark ? "#8B5CF6" : "#6200EE";
  const ctaShadow = isDark ? "rgba(139,92,246,0.65)" : "#6200EE";
  const placeholderColor = useThemeColor(
    { light: "#9CA3AF", dark: "rgba(255,255,255,0.4)" },
    "placeholder",
  );

  const localizedDefaults = useMemo(
    () => getLocalizedSuggestions(language),
    [language],
  );

  const initialSelected = useMemo(() => {
    const seeded = isSettingsMode
      ? (profile?.categories ?? [])
      : signup.categories.length
        ? signup.categories
        : DEFAULT_PRESELECTED;
    return localizeCategoryList(seeded, language);
  }, [isSettingsMode, language, profile?.categories, signup.categories]);

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [cloudHeight, setCloudHeight] = useState(SCREEN_HEIGHT * 0.6);
  const scrollY = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const dirtyRef = useRef(false);

  const allCategories = useMemo(
    () =>
      uniqByNormalized([
        ...localizedDefaults,
        ...localizeCategoryList(profile?.categories ?? [], language),
        ...localizeCategoryList(signup.categories, language),
        ...customCategories,
        ...selected,
      ]),
    [
      customCategories,
      language,
      localizedDefaults,
      profile?.categories,
      selected,
      signup.categories,
    ],
  );

  const sortedCategories = useMemo(
    () => sortCloudCategories(allCategories, localizedDefaults),
    [allCategories, localizedDefaults],
  );

  const filteredCategories = useMemo(() => {
    const q = normalizeCategoryName(query);
    let base = showSelectedOnly
      ? sortedCategories.filter((c) =>
          selected.some(
            (s) => normalizeCategoryName(s) === normalizeCategoryName(c),
          ),
        )
      : sortedCategories;
    if (q) {
      base = base.filter((c) => normalizeCategoryName(c).includes(q));
    }
    return base;
  }, [query, selected, showSelectedOnly, sortedCategories]);

  const selectedSet = useMemo(
    () => new Set(selected.map((s) => normalizeCategoryName(s))),
    [selected],
  );

  useEffect(() => {
    if (dirtyRef.current) return;
    setSelected((prev) =>
      sameNormalizedSet(prev, initialSelected) ? prev : initialSelected,
    );
  }, [initialSelected]);

  useEffect(() => {
    setSelected((prev) => {
      const loc = localizeCategoryList(prev, language);
      return sameNormalizedSet(prev, loc) ? prev : loc;
    });
    setCustomCategories((prev) => {
      const loc = localizeCategoryList(prev, language);
      return sameNormalizedSet(prev, loc) ? prev : loc;
    });
  }, [language]);

  useEffect(() => {
    if (initializing) return;
    if (isSettingsMode && !profileLoaded) return;
    if (!user && !signup.details && !isSettingsMode) {
      router.replace("/signup-details" as any);
    }
  }, [
    initializing,
    isSettingsMode,
    profileLoaded,
    router,
    signup.details,
    user,
  ]);

  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvt, (e) =>
      setKeyboardHeight(e.endCoordinates?.height ?? 0),
    );
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const toggle = useCallback(
    async (name: string) => {
      dirtyRef.current = true;
      const n = normalizeCategoryName(name);
      const newSelected = selected.some((s) => normalizeCategoryName(s) === n)
        ? selected.filter((s) => normalizeCategoryName(s) !== n)
        : uniqByNormalized([...selected, name]);

      setSelected(newSelected);
      if (!isSettingsMode) {
        signup.setCategories(newSelected);
      }

      // Save to RTDB immediately if user is signed in
      if (user) {
        try {
          await updateUserProfile(user.uid, { categories: newSelected });
        } catch (e) {
          console.error("Failed to save categories:", e);
        }
      }
    },
    [selected, user],
  );

  const addCustom = useCallback(async () => {
    const clean = customName.trim().replace(/\s+/g, " ");
    if (!clean) return;
    dirtyRef.current = true;
    const n = normalizeCategoryName(clean);
    const existing = allCategories.find((c) => normalizeCategoryName(c) === n);

    let newSelected: string[];
    if (existing) {
      newSelected = selected.some((s) => normalizeCategoryName(s) === n)
        ? selected
        : uniqByNormalized([...selected, existing]);
    } else {
      setCustomCategories((prev) => uniqByNormalized([...prev, clean]));
      newSelected = uniqByNormalized([...selected, clean]);
    }

    setSelected(newSelected);
    if (!isSettingsMode) {
      signup.setCategories(newSelected);
    }
    setCustomName("");
    setAdding(false);
    Keyboard.dismiss();

    // Save to RTDB immediately if user is signed in
    if (user) {
      try {
        await updateUserProfile(user.uid, { categories: newSelected });
      } catch (e) {
        console.error("Failed to save categories:", e);
      }
    }

    // Scroll to show the new category - find its index and scroll to it
    const categoryToFind = existing || clean;
    setTimeout(() => {
      const newSorted = sortCloudCategories(
        uniqByNormalized([...allCategories, clean]),
        localizedDefaults,
      );
      const targetIndex = newSorted.findIndex(
        (c) =>
          normalizeCategoryName(c) === normalizeCategoryName(categoryToFind),
      );
      if (targetIndex >= 0 && scrollViewRef.current) {
        // Estimate position: each row is ~50px, ~4 items per row
        const rowIndex = Math.floor(targetIndex / 4);
        const scrollPosition = Math.max(
          0,
          rowIndex * 56 - cloudHeight / 2 + 28,
        );
        (scrollViewRef.current as any).scrollTo({
          y: scrollPosition,
          animated: true,
        });
      }
    }, 150);
  }, [
    allCategories,
    customName,
    selected,
    user,
    localizedDefaults,
    cloudHeight,
  ]);

  const handleDone = useCallback(async () => {
    if (isSettingsMode) {
      if (!user) return;
      setSaving(true);
      try {
        await updateUserProfile(user.uid, { categories: selected });
        if ((router as any).canGoBack?.()) {
          router.back();
        } else {
          router.replace("/(tabs)/settings" as any);
        }
      } catch (e) {
        Alert.alert(t("error"), e instanceof Error ? e.message : "Failed");
      } finally {
        setSaving(false);
      }
      return;
    }
    signup.setCategories(selected);
    router.push("/id-scan" as any);
  }, [isSettingsMode, router, selected, signup, t, user]);

  const handleBack = useCallback(() => {
    if ((router as any).canGoBack?.()) {
      router.back();
      return;
    }
    if (isSettingsMode) {
      router.replace("/(tabs)/settings" as any);
      return;
    }
    router.replace("/(auth)/signup-details" as any);
  }, [isSettingsMode, router]);

  const avatarUri = profile?.personalImage;
  const ctaDisabled = adding && !customName.trim();

  return (
    <ThemedView style={[styles.container, { backgroundColor: screenBg }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View
          style={[
            styles.headerRow,
            isRtl && styles.headerRowRtl,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flex: 0,
              height: 60,
              minHeight: 60,
              maxHeight: 60,
              width: "100%",
            },
          ]}
        >
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                flex: 0,
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: chromeBorder,
                backgroundColor: surfaceSoft,
              },
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name={isRtl ? "arrow-forward" : "arrow-back"}
              size={24}
              color={textColor}
            />
          </Pressable>

          <ThemedText
            numberOfLines={1}
            style={[
              styles.headerTitle,
              {
                color: textColor,
                flex: 1,
                textAlign: "center",
              },
            ]}
          >
            {t("allCategories")}
          </ThemedText>

          <Pressable
            onPress={() => setAdding(true)}
            style={({ pressed }) => [
              styles.avatarBtn,
              {
                flex: 0,
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: chromeBorder,
                backgroundColor: surfaceSoft,
              },
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="add" size={24} color={accent} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Search */}
      <Animated.View
        entering={FadeInDown.delay(80).duration(300)}
        style={styles.searchWrap}
      >
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: inputBg,
              borderColor: chromeBorder,
              shadowColor: isDark ? "transparent" : "rgba(0,0,0,0.06)",
            },
          ]}
        >
          <MaterialIcons name="search" size={22} color={accent} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={
              language === "ar" ? "ابحث في الفئات..." : "Search categories..."
            }
            placeholderTextColor={placeholderColor}
            style={[
              styles.searchInput,
              { color: textColor, textAlign: isRtl ? "right" : "left" },
            ]}
            returnKeyType="search"
          />
          <Pressable
            onPress={() => setShowSelectedOnly((p) => !p)}
            style={({ pressed }) => [
              styles.filterBtn,
              { backgroundColor: accentStrong },
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="tune" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </Animated.View>

      {/* Categories Cloud */}
      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        onLayout={(e) => setCloudHeight(e.nativeEvent.layout.height)}
        contentContainerStyle={[
          styles.cloudContent,
          {
            paddingBottom: Math.max(180, insets.bottom + 140),
            // Center content vertically when searching (fewer items)
            minHeight: filteredCategories.length < 15 ? cloudHeight : undefined,
            justifyContent:
              filteredCategories.length < 15 ? "center" : "flex-start",
          },
        ]}
      >
        {filteredCategories.length === 0 ? (
          <Animated.View
            entering={FadeInDown.duration(200)}
            style={styles.emptyBox}
          >
            <ThemedText style={[styles.emptyText, { color: mutedColor }]}>
              {language === "ar"
                ? "لم يتم العثور على فئات."
                : "No categories found."}
            </ThemedText>
          </Animated.View>
        ) : (
          <View style={[styles.cloudGrid, isRtl && styles.cloudGridRtl]}>
            {filteredCategories.map((cat, idx) => {
              const n = normalizeCategoryName(cat);
              return (
                <Bubble
                  key={n}
                  name={cat}
                  selected={selectedSet.has(n)}
                  index={idx}
                  totalCount={filteredCategories.length}
                  onPress={() => toggle(cat)}
                  isRtl={isRtl}
                  scrollY={scrollY}
                  containerHeight={cloudHeight}
                  disableFisheye={query.length > 0}
                  idleBubbleBg={idleBubbleBg}
                  activeBubbleBg={activeBubbleBg}
                  idleLabelColor={idleBubbleText}
                  activeLabelColor="#FFFFFF"
                  activeShadowColor={accentStrong}
                />
              );
            })}
          </View>
        )}
      </Animated.ScrollView>

      {/* Bottom CTA */}
      <View
        pointerEvents="box-none"
        style={[
          styles.bottomArea,
          { paddingBottom: Math.max(insets.bottom + 16, 24) + keyboardHeight },
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ["rgba(15,13,19,0)", "rgba(15,13,19,0.95)", "#0F0D13"]
              : ["rgba(248,245,252,0)", "rgba(248,245,252,0.95)", "#F8F5FC"]
          }
          style={styles.bottomGradient}
        />
        {adding && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            style={[
              styles.customInputRow,
              {
                backgroundColor: inputBg,
                borderColor: chromeBorder,
              },
            ]}
          >
            <TextInput
              value={customName}
              onChangeText={setCustomName}
              placeholder={t("customCategoryPlaceholder")}
              placeholderTextColor={placeholderColor}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={addCustom}
              style={[
                styles.customInput,
                { color: textColor, textAlign: isRtl ? "right" : "left" },
              ]}
            />
            <Pressable
              onPress={() => {
                setCustomName("");
                setAdding(false);
                Keyboard.dismiss();
              }}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: closeBg },
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons name="close" size={20} color={mutedColor} />
            </Pressable>
          </Animated.View>
        )}
        <Pressable
          disabled={adding ? ctaDisabled : saving}
          onPress={() => {
            if (adding) {
              addCustom();
            } else {
              handleDone();
            }
          }}
          style={({ pressed }) => [
            styles.ctaWrap,
            { shadowColor: ctaShadow },
            (adding ? ctaDisabled : saving) && styles.disabled,
            pressed && !(adding ? ctaDisabled : saving) && styles.pressed,
          ]}
        >
          <LinearGradient
            colors={isDark ? ["#8B5CF6", "#6D28D9"] : ["#6200EE", "#5000D0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.ctaBtn, isRtl && styles.ctaBtnRtl]}
          >
            <ThemedText style={styles.ctaLabel}>
              {adding ? t("add") : isSettingsMode ? t("save") : t("next")}
            </ThemedText>
          </LinearGradient>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRowRtl: { flexDirection: "row-reverse" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: Fonts.sansBlack, fontSize: 22 },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.5 },

  searchWrap: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingRight: 8,
    gap: 12,
    backgroundColor: "rgba(232,222,248,0.4)",
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    height: "100%",
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6200EE",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  cloudContent: { paddingHorizontal: 16, paddingTop: 8 },
  cloudGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  cloudGridRtl: { flexDirection: "row-reverse" },
  emptyBox: { minHeight: 240, alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: Fonts.sansMedium, fontSize: 15 },

  bubbleWrap: { marginBottom: 6 },
  bubble: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 9999,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleIdle: {
    backgroundColor: "rgba(232,222,248,0.6)",
  },
  bubbleActive: {
    backgroundColor: "#6200EE",
    shadowColor: "#6200EE",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  bubbleFocused: { borderColor: "#6200EE", borderWidth: 2 },
  bubbleLabel: { fontFamily: Fonts.sansBold, fontSize: 15, lineHeight: 20 },
  bubbleLabelActive: { color: "#FFFFFF" },
  bubbleLabelIdle: { color: "#6200EE" },
  rtlText: { textAlign: "right" },

  bottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -90,
    bottom: 0,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 14,
    backgroundColor: "rgba(232,222,248,0.5)",
    shadowColor: "#6200EE",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  customInput: {
    flex: 1,
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    height: "100%",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  ctaWrap: {
    borderRadius: 9999,
    shadowColor: "#6200EE",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  ctaBtn: {
    height: 60,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 28,
  },
  ctaBtnRtl: { flexDirection: "row-reverse" },
  ctaLabel: { color: "#FFFFFF", fontFamily: Fonts.sansBold, fontSize: 18 },
});
