import { StyleSheet } from "react-native";

export const captureScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  cameraWrap: {
    flex: 1,
    padding: 16,
  },
  camera: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  previewWrap: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  actions: {
    padding: 16,
    alignItems: "center",
  },
  capturePrimary: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "stretch",
  },
  inlinePrimary: {
    width: "100%",
    minHeight: 58,
    minWidth: 0,
  },
  row: {
    gap: 12,
    alignItems: "stretch",
    justifyContent: "center",
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  secondary: {
    flex: 1,
    minHeight: 58,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryWithIcon: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryLabel: {
    textAlign: "center",
    flexShrink: 1,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  idFrame: {
    width: "92%",
    aspectRatio: 1.6,
    borderRadius: 18,
  },
  corner: {
    position: "absolute",
    width: 26,
    height: 26,
    borderColor: "#A78BFA",
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  selfieOval: {
    width: 240,
    height: 320,
    borderRadius: 160,
    borderWidth: 5,
    borderColor: "rgba(167, 139, 250, 0.95)",
  },
  glow1: {
    position: "absolute",
    width: 260,
    height: 340,
    borderRadius: 180,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.35)",
  },
  glow2: {
    position: "absolute",
    width: 285,
    height: 370,
    borderRadius: 190,
    borderWidth: 2,
    borderColor: "rgba(109, 40, 217, 0.18)",
  },
});