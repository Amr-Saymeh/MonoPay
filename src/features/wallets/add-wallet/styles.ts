import { StyleSheet } from "react-native";

import { Fonts } from "@/constants/theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  content: {
    paddingBottom: 32,
    gap: 14,
  },
  heading: {
    fontFamily: Fonts.sansBlack,
  },
  previewWrapper: {
    borderRadius: 24,
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    opacity: 0.65,
    fontFamily: Fonts.sansBold,
  },
  selectedMembersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,28,0.06)",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
  },
  memberChipText: {
    color: "rgba(17,24,28,0.78)",
  },
  suggestionsBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(17,24,28,0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,24,28,0.08)",
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionSub: {
    opacity: 0.6,
    marginTop: 2,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeCard: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
    backgroundColor: "rgba(17,24,28,0.03)",
  },
  typeCardSelected: {
    borderColor: "rgba(124,58,237,0.55)",
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balancesList: {
    gap: 10,
  },
  addCurrencyButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  currencyPill: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(17,24,28,0.06)",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  currencyText: {
    color: "#11181C",
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17,24,28,0.06)",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
  },
  emojiSelected: {
    borderColor: "rgba(124,58,237,0.55)",
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  emojiText: {
    fontSize: 18,
  },
  cancel: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.10)",
    marginTop: 8,
  },
  cancelText: {
    color: "rgba(17,24,28,0.75)",
  },
  pressed: {
    opacity: 0.9,
  },
});
