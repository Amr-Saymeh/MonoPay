import { useEffect, useState } from "react";

import { get, ref } from "firebase/database";

import { db } from "@/src/firebaseConfig";

import type { SharedSuggestion, UserProfile } from "../types";

type UseSharedMembersParams = {
  enabled: boolean;
  currentUserId?: string;
};

export function useSharedMembers({ enabled, currentUserId }: UseSharedMembersParams) {
  const [sharedSearch, setSharedSearch] = useState("");
  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>({});
  const [selectedMemberUids, setSelectedMemberUids] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled || !currentUserId) return;

    let cancelled = false;

    (async () => {
      try {
        const snapshot = await get(ref(db, "users"));
        if (cancelled) return;
        setAllUsers((snapshot.val() ?? {}) as Record<string, UserProfile>);
      } catch {
        if (cancelled) return;
        setAllUsers({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, enabled]);

  useEffect(() => {
    if (enabled) return;
    setSharedSearch("");
    setSelectedMemberUids([]);
  }, [enabled]);

  const sharedSuggestions: SharedSuggestion[] = (() => {
    if (!enabled || !currentUserId) return [];

    const query = sharedSearch.trim().toLowerCase();
    if (!query) return [];

    const selected = new Set(selectedMemberUids);

    return Object.entries(allUsers)
      .filter(([uid, profile]) => {
        if (uid === currentUserId) return false;
        if (selected.has(uid)) return false;
        if (profile?.type !== 1) return false;

        const name = String(profile?.name ?? "").toLowerCase();
        const number = String(profile?.number ?? "").toLowerCase();
        return name.includes(query) || number.includes(query);
      })
      .slice(0, 8)
      .map(([uid, profile]) => ({ uid, profile }));
  })();

  return {
    allUsers,
    sharedSearch,
    selectedMemberUids,
    setSharedSearch,
    setSelectedMemberUids,
    sharedSuggestions,
  };
}
