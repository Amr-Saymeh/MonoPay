import { StyleSheet } from "react-native";

import { Fonts } from "@/constants/theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  content: {
    flex: 1,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontFamily: Fonts.sansBlack,
  },
  subtitle: {
    opacity: 0.65,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    paddingVertical: 32,
    alignItems: "center",
  },
  empty: {
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
  },
  emptyText: {
    opacity: 0.7,
  },
  cardsRow: {
    paddingVertical: 2,
  },
  cardsContainer: {
    height: 240,
  },
  cardSeparator: {
    width: 12,
  },
  cardWrap: {
    width: 320,
    borderRadius: 26,
    padding: 2,
    overflow: "hidden",
  },
  cardSelected: {
    backgroundColor: "rgba(124,58,237,0.38)",
  },
  detailsCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
    backgroundColor: "rgba(17,24,28,0.03)",
  },
  sectionTitle: {
    opacity: 0.65,
    fontFamily: Fonts.sansBold,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  detailLabel: {
    opacity: 0.65,
    flex: 1,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(17,24,28,0.08)",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#dc2626",
  },
  deleteButtonDisabled: {
    backgroundColor: "rgba(220,38,38,0.55)",
  },
  deleteButtonText: {
    color: "#fff",
  },
  sharedButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0EA5E9",
  },
  sharedButtonText: {
    color: "#fff",
  },
  pressed: {
    opacity: 0.9,
  },
});
