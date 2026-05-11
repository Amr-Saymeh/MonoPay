import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  sheetHandle: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 112,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "700" },
  closeBtn: { padding: 4 },

  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(139,92,246,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 4,
  },
  hintText: { fontSize: 13, color: "#8B5CF6", fontWeight: "500" },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 14,
    opacity: 0.7,
  },

  walletList: {
    paddingRight: 20,
  },
  walletListScroll: {
    height: 86,
  },
  walletCard: {
    width: 142,
    height: 82,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
    justifyContent: "space-between",
  },
  walletCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walletName: { fontSize: 13, fontWeight: "700" },
  walletBalance: { fontSize: 12, fontWeight: "600", marginTop: 1 },

  stateBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  loadingText: {
    opacity: 0.5,
  },
  errorBox: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239,68,68,0.06)",
  },
  errorBoxTitle: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  errorBoxSub: { fontSize: 12, opacity: 0.6, textAlign: "center" },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  textArea: { height: 90, paddingTop: 12 },

  buttons: {
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
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "600", opacity: 0.7 },
  confirmBtn: { flex: 2 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});

