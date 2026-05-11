import { ContributionModal } from "./ContributionModal";
import { ThemedView } from "@/components/themed-view";
import { FeedbackBottomSheet } from "@/components/ui/FeedbackBottomSheet";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Animated, Pressable, View } from "react-native";

import {
  GOALS_SUCCESS_BOTTOM_SHEET_INSET,
  GOALS_WHITE_ICON,
} from "../constants";
import { GoalDeleteSheet } from "./GoalDeleteSheet";
import { GoalsContentBody } from "./GoalsContentBody";
import { GoalsHeader } from "./GoalsHeader";
import { styles } from "../stylesheet";

export function GoalsScreenLayout(props: any) {
  return (
    <BottomSheetModalProvider>
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: props.insets.top,
            backgroundColor: props.theme.headerSurface,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.animatedPage,
            {
              opacity: props.pageTransition,
              transform: [
                {
                  translateY: props.pageTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
                {
                  scale: props.pageTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.985, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <ThemedView style={styles.container}>
            <GoalsHeader
              title={props.labels.title}
              isDark={props.isDark}
              backgroundColor={props.theme.headerSurface}
              borderColor={props.theme.headerBorder}
              onBack={props.onBack}
            />

            <GoalsContentBody
              scrollBottomSpacing={props.scrollBottomSpacing}
              totalSaved={props.formattedTotalSaved}
              remaining={props.formattedRemaining}
              progress={props.overallProgress}
              labels={props.labels}
              onAdd={props.onCreateGoal}
              search={{
                enabled: props.searchEnabled,
                value: props.searchQuery,
                isDark: props.isDark,
                backgroundColor: props.theme.searchBg,
                borderColor: props.theme.searchBorder,
                textColor: props.theme.searchText,
                placeholderColor: props.theme.searchPlaceholder,
                onChange: props.setSearchQuery,
              }}
              sort={{
                isDark: props.isDark,
                sortKey: props.sortKey,
                sortDir: props.sortDir,
                backgroundColor: props.theme.sortSurface,
                borderColor: props.theme.sortBorder,
                textColor: props.theme.sortText,
                activeLabel: props.activeSortLabel,
                getLabel: props.getSortOptionLabel,
                onSortSelect: props.handleSortSelect,
                onDirectionChange: props.setSortDir,
              }}
              goals={props.goals}
              visibleGoals={props.visibleGoals}
              userUid={props.userUid}
              onContribute={props.onContribute}
              onEdit={props.handleEdit}
              onDelete={props.handleDelete}
            />

            <ContributionModal
              visible={props.showContributionModal}
              onClose={props.closeContributionModal}
              onSubmit={props.handleContributionSubmit}
              currency={props.selectedGoal?.goalTargetCurrency || "usd"}
              targetAmount={props.selectedGoal?.goalTargetAmount}
              currentAmount={props.selectedGoal?.currentAmount || 0}
            />

            <Pressable
              style={[styles.fabAddButton, { bottom: props.floatingButtonBottom }]}
              onPress={props.onCreateGoal}
              accessibilityRole="button"
              accessibilityLabel={props.labels.add}
            >
              <MaterialIcons name="add" size={28} color={GOALS_WHITE_ICON} />
            </Pressable>
          </ThemedView>
        </Animated.View>
      </View>

      <GoalDeleteSheet
        modalRef={props.deleteSheetRef}
        snapPoints={props.deleteSheetSnapPoints}
        isDark={props.isDark}
        backgroundColor={props.theme.sheetBg}
        handleColor={props.theme.sheetHandle}
        titleColor={props.theme.sheetTitle}
        textColor={props.theme.sheetText}
        borderColor={props.theme.sheetBorder}
        title={props.labels.deleteTitle}
        description={props.labels.deleteConfirm}
        cancelLabel={props.labels.cancel}
        deleteLabel={props.labels.delete}
        onCancel={props.handleCancelDelete}
        onConfirm={props.handleConfirmDelete}
        onDismiss={props.clearPendingDeleteGoal}
      />

      <FeedbackBottomSheet
        modalRef={props.successSheetRef}
        isDark={props.isDark}
        title={props.successTitle}
        description={props.successDescription}
        actionLabel={props.labels.confirm}
        titleIcon={props.successIcon}
        actionIcon="check-circle"
        bottomInset={GOALS_SUCCESS_BOTTOM_SHEET_INSET}
        onAction={() => props.successSheetRef.current?.dismiss()}
      />
    </BottomSheetModalProvider>
  );
}

