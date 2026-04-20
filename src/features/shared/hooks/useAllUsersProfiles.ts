import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { db } from "@/src/firebaseConfig";
import { UserProfile } from "../types";

interface UseAllUsersProfilesResult {
  allUsers: Record<string, UserProfile>;
}

export function useAllUsersProfiles(user: { uid: string } | null): UseAllUsersProfilesResult {
  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await import("firebase/database").then(({ get }) =>
          get(ref(db, "users"))
        );
        if (cancelled) return;
        setAllUsers((snap.val?.() ?? {}) as Record<string, UserProfile>);
      } catch {
        if (!cancelled) setAllUsers({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { allUsers };
}
