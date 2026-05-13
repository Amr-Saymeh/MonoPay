import React, { useEffect } from "react";

import { Pressable, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";

import { styles } from "./styles";

type CategoryBubbleProps = {
  activeBubbleBg: string;
  activeLabelColor: string;
  activeShadowColor: string;
  containerHeight: number;
  disableFisheye?: boolean;
  idleBubbleBg: string;
  idleLabelColor: string;
  isRtl: boolean;
  name: string;
  onPress: () => void;
  scrollY: SharedValue<number>;
  selected: boolean;
};

export function CategoryBubble({
  activeBubbleBg,
  activeLabelColor,
  activeShadowColor,
  containerHeight,
  disableFisheye,
  idleBubbleBg,
  idleLabelColor,
  isRtl,
  name,
  onPress,
  scrollY,
  selected,
}: CategoryBubbleProps) {
  const itemY = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const selectAnim = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selectAnim.value = withTiming(selected ? 1 : 0, { duration: 150 });
  }, [selected, selectAnim]);

  const onLayout = (event: LayoutChangeEvent) => {
    itemY.value = event.nativeEvent.layout.y;
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (disableFisheye) {
      return {
        opacity: 1,
        transform: [{ scale: pressScale.value }],
      };
    }

    const viewportCenter = containerHeight / 2;
    const itemCenter = itemY.value - scrollY.value + 25;
    const distanceFromCenter = Math.abs(itemCenter - viewportCenter);
    const maxDistance = containerHeight / 2;
    const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);

    return {
      opacity: interpolate(normalizedDistance, [0, 0.4, 1], [1, 0.7, 0.35]),
      transform: [
        {
          scale:
            interpolate(normalizedDistance, [0, 0.5, 1], [1.1, 0.95, 0.75]) *
            pressScale.value,
        },
      ],
    };
  });

  const bubbleStyle = useAnimatedStyle(() => ({
    elevation: selectAnim.value * 6,
    shadowOpacity: selectAnim.value * 0.4,
  }));

  return (
    <Animated.View style={[styles.bubbleWrap, animatedStyle]} onLayout={onLayout}>
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
          <View
            style={[
              styles.bubble,
              selected ? styles.bubbleActive : styles.bubbleIdle,
              {
                backgroundColor: selected ? activeBubbleBg : idleBubbleBg,
                shadowColor: selected ? activeShadowColor : undefined,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.bubbleLabel,
                selected ? styles.bubbleLabelActive : styles.bubbleLabelIdle,
                { color: selected ? activeLabelColor : idleLabelColor },
                isRtl ? styles.rtlText : null,
              ]}
            >
              {name}
            </ThemedText>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}