import { Fonts } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  animatedPage: { flex: 1 },
  container: { flex: 1 },
  headerSection: {
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageTitle: { fontSize: 26, fontWeight: "700", fontFamily: Fonts.sansBlack },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  backButtonLight: {
    backgroundColor: "rgba(124,58,237,0.07)",
    borderColor: "rgba(124,58,237,0.25)",
  },
  backButtonDark: {
    backgroundColor: "rgba(124,58,237,0.15)",
    borderColor: "rgba(196,181,253,0.3)",
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 120 },
  listHeaderWrap: {
    gap: 12,
  },
  filterWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  filterChipsRow: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    borderRadius: 999,
    minWidth: 82,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  filterChipActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C3AED",
    textAlign: "center",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", opacity: 0.45 },
  emptySubtext: { fontSize: 14, opacity: 0.35, textAlign: "center" },

  fabAddButton: {
    position: "absolute",
    right: 20,
    zIndex: 1200,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    width: 44,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sheetDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    marginBottom: 64,
  },
  sheetButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  sheetButtonSecondary: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  sheetButtonSecondaryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sheetButtonDanger: {
    backgroundColor: "#EF4444",
  },
  sheetButtonDangerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sheetBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pressablePressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
});
