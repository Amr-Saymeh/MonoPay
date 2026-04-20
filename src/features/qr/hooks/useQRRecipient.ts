import { useEffect, useState } from "react";

import { get, ref } from "firebase/database";

import { AppUser } from "@/src/features/transfer/types/index";
import { db } from "@/src/firebaseConfig";

export type QRRecipientError = "NOT_FOUND" | "UNKNOWN";

interface UseQRRecipientResult {
  recipient: AppUser | null;
  loading: boolean;
  error: QRRecipientError | null;
}

export function useQRRecipient(uid: string | null): UseQRRecipientResult {
  const [recipient, setRecipient] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<QRRecipientError | null>(null);

  useEffect(() => {
    if (!uid) {
      setRecipient(null);
      return;
    }

    setLoading(true);
    setError(null);

    get(ref(db, `users/${uid}`))
      .then((snap) => {
        if (!snap.exists() || snap.val()?.type !== 1) {
          setError("NOT_FOUND");
          setRecipient(null);
          return;
        }
        const data = snap.val() as Omit<AppUser, "uid">;
        setRecipient({ uid, ...data });
      })
      .catch(() => {
        setError("UNKNOWN");
        setRecipient(null);
      })
      .finally(() => setLoading(false));
  }, [uid]);

  return { recipient, loading, error };
}
