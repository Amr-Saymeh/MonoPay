import React from "react";

import { Stack } from "expo-router";

import { Fonts } from "@/constants/theme";

export default function WalletsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          fontFamily: Fonts.sansBold,
        },
        headerBackTitleStyle: {
          fontFamily: Fonts.sans,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Wallets" }} />
      <Stack.Screen name="add" options={{ title: "Add wallet" }} />
      <Stack.Screen name="shared" options={{ title: "Shared wallet" }} />
    </Stack>
  );
}
