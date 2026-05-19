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

    get(ref(db, "users")).then((snapshot) => {
      if (cancelled) return;
      setAllUsers((snapshot.val() ?? {}) as Record<string, UserProfile>);
    });

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

    const queryDigitsRaw = query.replace(/\D/g, "");
    const isNumberSearch = queryDigitsRaw.length > 0;

    // Avoid dumping many users on small queries.
    if (isNumberSearch) {
      if (queryDigitsRaw.length < 3) return [];
    } else {
      if (query.length < 2) return [];
    }

    const queryDigitsNormalized = queryDigitsRaw.replace(/^0+/, "");

    const selected = new Set(selectedMemberUids);

    return Object.entries(allUsers)
      .filter(([uid, profile]) => {
        if (uid === currentUserId) return false;
        if (selected.has(uid)) return false;
        if (profile?.type !== 1) return false;

        const name = String(profile?.name ?? "").toLowerCase();

        if (!isNumberSearch) {
          const numberText = String(profile?.number ?? "").toLowerCase();
          return name.includes(query) || numberText.includes(query);
        }

        const numberDigitsRaw = String(profile?.number ?? "").replace(/\D/g, "");
        const numberDigitsNormalized = numberDigitsRaw.replace(/^0+/, "");

        if (queryDigitsRaw.length > 0 && numberDigitsRaw.includes(queryDigitsRaw)) {
          return true;
        }

        if (!queryDigitsNormalized) return false;

        return (
          numberDigitsNormalized.includes(queryDigitsNormalized) ||
          numberDigitsNormalized.endsWith(queryDigitsNormalized) ||
          numberDigitsRaw.endsWith(queryDigitsNormalized)
        );
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
