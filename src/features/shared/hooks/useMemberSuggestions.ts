import { useMemo } from "react";
import { UserProfile } from "../types";

interface UseMemberSuggestionsResult {
  suggestions: Array<{ uid: string; profile: UserProfile }>;
}

export function useMemberSuggestions(
  search: string,
  isOwner: boolean,
  allUsers: Record<string, UserProfile>,
  memberUids: string[],
  currentUserUid: string | undefined
): UseMemberSuggestionsResult {
  const suggestions = useMemo(() => {
    if (!isOwner) return [] as Array<{ uid: string; profile: UserProfile }>;
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const selected = new Set(memberUids);
    return Object.entries(allUsers)
      .filter(([uid, profile]) => {
        if (uid === currentUserUid || selected.has(uid) || profile?.type !== 1) return false;
        const n = String(profile?.name ?? "").toLowerCase();
        const e = String(profile?.email ?? "").toLowerCase();
        const num = String(profile?.number ?? "").toLowerCase();
        return n.includes(q) || e.includes(q) || num.includes(q);
      })
      .slice(0, 10)
      .map(([uid, profile]) => ({ uid, profile }));
  }, [allUsers, isOwner, memberUids, search, currentUserUid]);

  return { suggestions };
}
