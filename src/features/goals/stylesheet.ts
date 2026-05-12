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

  summaryCard: {
    borderRadius: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  summaryIconWrap: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
  },
  summaryAmount: { fontSize: 22, fontWeight: "700", color: "#FFF" },
  addSmallBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addSmallRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addSmallText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: "100%", backgroundColor: "#FFF", borderRadius: 4 },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  progressPercent: { fontSize: 12, color: "#FFF", fontWeight: "600" },
  remainingText: { fontSize: 12, color: "rgba(255,255,255,0.65)" },
  searchWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 0,
  },
  searchClearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124,58,237,0.12)",
  },
  sortSection: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  sortHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sortHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sortHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.9,
  },
  sortHeaderMeta: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
  },
  sortChipsRow: {
    paddingRight: 6,
    gap: 8,
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  sortChipActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7C3AED",
  },
  sortChipTextActive: {
    color: "#FFFFFF",
  },
  sortDirWrap: {
    flexDirection: "row",
    gap: 8,
  },
  sortDirOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    backgroundColor: "rgba(124,58,237,0.08)",
    paddingVertical: 8,
    borderRadius: 10,
  },
  sortDirOptionActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  sortDirOptionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C3AED",
  },
  sortDirOptionTextActive: {
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
    marginBottom: 64
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
});
