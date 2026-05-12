import { ThemedView } from "@/components/themed-view";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Animated, View } from "react-native";

import { styles } from "../stylesheet";
import { GoalsBodySection } from "./GoalsBodySection";
import { GoalsContributionOverlay } from "./GoalsContributionOverlay";
import { GoalsCreateButton } from "./GoalsCreateButton";
import { GoalsHeaderSection } from "./GoalsHeaderSection";
import { GoalsOverlays } from "./GoalsOverlays";
import { useGoalsScreen } from "./GoalsScreenProvider";

export function GoalsScreenView() {
  const { view } = useGoalsScreen();

  return (
    <BottomSheetModalProvider>
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: view.insets.top,
            backgroundColor: view.theme.headerSurface,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.animatedPage,
            {
              opacity: view.pageTransition,
              transform: [
                {
                  translateY: view.pageTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
                {
                  scale: view.pageTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.985, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <ThemedView style={styles.container}>
            <GoalsHeaderSection />
            <GoalsBodySection />
            <GoalsContributionOverlay />
            <GoalsCreateButton />
          </ThemedView>
        </Animated.View>
      </View>
      <GoalsOverlays />
    </BottomSheetModalProvider>
  );
}
