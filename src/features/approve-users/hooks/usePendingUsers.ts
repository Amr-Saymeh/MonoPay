import { useEffect, useState } from "react";

import { onValue, ref } from "firebase/database";

import { db } from "@/src/firebaseConfig";

import type { PendingUser, UserRecord } from "../types";

export function usePendingUsers() {
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const data = (snapshot.val() ?? {}) as Record<string, UserRecord>;
        const list: PendingUser[] = Object.entries(data)
          .filter(([, value]) => Number(value?.type) === 0)
          .map(([id, value]) => ({ id, data: value }));

        setPendingUsers(list);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return {
    loading,
    pendingUsers,
  };
}
