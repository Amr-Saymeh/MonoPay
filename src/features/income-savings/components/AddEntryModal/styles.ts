import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  sheetHandle: {
    width: 44,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 112,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 18,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 8,
    opacity: 0.75,
  },
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124,58,237,0.1)",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  pillTextSelected: {
    color: "#7C3AED",
  },
  walletList: {
    paddingRight: 20,
  },
  walletListScroll: {
    height: 50,
  },
  walletOption: {
    width: 112,
    height: 46,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginRight: 8,
    justifyContent: "center",
  },
  walletOptionSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  walletOptionText: {
    paddingRight: 16,
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
  walletCheckIcon: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(124,58,237,0.12)",
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.7,
  },
  saveBtn: {
    flex: 2,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7C3AED",
  },
  saveBtnDisabled: {
    opacity: 0.65,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
