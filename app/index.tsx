import React, { useEffect } from "react";

import { Redirect, useRouter } from "expo-router";

import { useAuth } from "@/src/providers/AuthProvider";

export default function Index() {
  const { user, profile, initializing, profileLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      router.replace("/(auth)/login" as any);
      return;
    }

    if (!profileLoaded) return;

    if (!profile) {
      router.replace("/(auth)/welcome" as any);
      return;
    }

    if (Number(profile.type) === 0) {
      router.replace("/(auth)/pending" as any);
      return;
    }

    router.replace("/(tabs)" as any);
  }, [initializing, user, profile, profileLoaded, router]);

  if (initializing) return null;

  if (!user) {
    return <Redirect href={"/(auth)/login" as any} />;
  }

  return null;
}
