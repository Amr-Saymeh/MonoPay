import { ThemedView } from "@/components/themed-view";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Animated, View } from "react-native";

import { styles } from "../stylesheet";
import { IncomeSavingsCreateButton } from "./IncomeSavingsCreateButton";
import { IncomeSavingsHeaderSection } from "./IncomeSavingsHeaderSection";
import { IncomeSavingsOverlays } from "./IncomeSavingsOverlays";
import { useIncomeSavingsScreen } from "./IncomeSavingsScreenProvider";
import { IncomeSourceFormOverlay } from "./IncomeSourceFormOverlay";
import { IncomeSourcesSection } from "./IncomeSourcesSection";

export function IncomeSavingsScreenView() {
  const { view } = useIncomeSavingsScreen();

  return (
    <BottomSheetModalProvider>
      <View
        style={[
          styles.safeArea,
          { paddingTop: view.insets.top, backgroundColor: view.theme.headerSurface },
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
            <IncomeSavingsHeaderSection />
            <IncomeSourcesSection />
            <IncomeSavingsCreateButton />
            <IncomeSourceFormOverlay />
          </ThemedView>
        </Animated.View>
      </View>
      <IncomeSavingsOverlays />
    </BottomSheetModalProvider>
  );
}
