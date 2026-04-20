import { useEffect, useState } from "react";

import { get, ref } from "firebase/database";

import { db } from "@/src/firebaseConfig";
import { AppUser } from "../types/index";

interface UseAllUsersResult {
  users: AppUser[];
  loading: boolean;
  error: string | null;
  findByPhone: (phone: string) => AppUser | undefined;
}

export function useAllUsers(excludeUid?: string): UseAllUsersResult {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const snap = await get(ref(db, "users"));
        if (!snap.exists()) {
          setUsers([]);
          return;
        }

        const raw = snap.val() as Record<string, Omit<AppUser, "uid">>;
        const list: AppUser[] = Object.entries(raw)
          .map(([uid, data]) => ({ uid, ...data }))
          // Only show type=1 users (regular users)
          .filter((u) => u.type === 1)
          // Exclude current user
          .filter((u) => (excludeUid ? u.uid !== excludeUid : true));

        setUsers(list);
      } catch (e) {
        console.error("[useAllUsers]", e);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, [excludeUid]);

  const findByPhone = (phone: string): AppUser | undefined => {
    const normalized = phone.replace(/\s+/g, "");
    return users.find(
      (u) => String(u.number).replace(/\s+/g, "") === normalized
    );
  };

  return { users, loading, error, findByPhone };
}
