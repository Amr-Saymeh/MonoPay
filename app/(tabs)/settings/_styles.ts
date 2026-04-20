import { StyleSheet } from "react-native";

import { Fonts } from "@/constants/theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  headerRtl: {
    flexDirection: "row-reverse",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPressed: {
    opacity: 0.8,
  },
  headerTitle: {
    fontFamily: Fonts.sansBlack,
    fontSize: 28,
    letterSpacing: -0.4,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  headerAvatarImage: {
    width: "100%",
    height: "100%",
  },
  headerAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  profileCard: {
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    marginBottom: 28,
    alignItems: "center",
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    overflow: "hidden",
    marginBottom: 12,
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%",
  },
  profileAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  profileName: {
    fontFamily: Fonts.sansBlack,
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 16,
  },
  editProfileBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editProfileText: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  sectionLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    marginBottom: 14,
    marginTop: 8,
  },
  sectionLabelRtl: {
    textAlign: "right",
  },

  rowCard: {
    borderRadius: 20,
    marginBottom: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowRtl: {
    flexDirection: "row-reverse",
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
    marginHorizontal: 14,
  },
  rowContentRtl: {
    alignItems: "flex-end",
  },
  rowLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
  },
  rowValue: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    marginTop: 2,
  },
  rowChevron: {
    opacity: 0.5,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginTop: 16,
    gap: 8,
  },
  logoutBtnRtl: {
    flexDirection: "row-reverse",
  },
  logoutText: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
  },

  textRtl: {
    textAlign: "right",
  },
});
