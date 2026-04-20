import { StyleSheet } from "react-native";

import { Fonts } from "@/constants/theme";

export const styles = StyleSheet.create({
  headerIcon: {
    bottom: -80,
    left: -20,
    position: "absolute",
    opacity: 0.25,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countPill: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a7ea4",
  },
  countPillText: {
    color: "#fff",
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  center: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyState: {
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  emptyText: {
    opacity: 0.7,
  },
  list: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(120,120,120,0.18)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerPressed: {
    opacity: 0.9,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(120,120,120,0.12)",
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(120,120,120,0.12)",
    borderWidth: 1,
    borderColor: "rgba(120,120,120,0.18)",
  },
  cardBody: {
    padding: 16,
    paddingTop: 0,
    gap: 10,
  },
  userName: {
    fontFamily: Fonts.rounded,
  },
  userId: {
    opacity: 0.6,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  imagesRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  imageBlock: {
    flex: 1,
    gap: 6,
  },
  imageLabel: {
    opacity: 0.75,
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 14,
    backgroundColor: "rgba(120,120,120,0.12)",
  },
  imagePlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: 14,
    backgroundColor: "rgba(120,120,120,0.12)",
    borderWidth: 1,
    borderColor: "rgba(120,120,120,0.18)",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  actionLabel: {
    color: "#fff",
  },
  actionApprove: {
    backgroundColor: "#16a34a",
  },
  actionReject: {
    backgroundColor: "#dc2626",
  },
  actionPressed: {
    opacity: 0.88,
  },
  actionDisabled: {
    opacity: 0.5,
  },
});
