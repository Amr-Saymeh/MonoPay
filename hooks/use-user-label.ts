import { useEffect, useState } from "react";

import { getUserProfile } from "@/src/services/user.service";
import { getUserLabel } from "@/src/utils/userLabel";

const labelCache = new Map<string, string>();

export function useUserLabel(uid?: string | null) {
  const normalizedUid = typeof uid === "string" ? uid.trim() : "";
  const effectiveUid = normalizedUid.length > 0 ? normalizedUid : null;

  const [label, setLabel] = useState(() => {
    if (!effectiveUid) return "—";
    return labelCache.get(effectiveUid) ?? effectiveUid;
  });

  useEffect(() => {
    if (!effectiveUid) {
      setLabel("—");
      return;
    }

    const cached = labelCache.get(effectiveUid);
    if (cached) {
      setLabel(cached);
      return;
    }

    setLabel(effectiveUid);

    let cancelled = false;

    getUserProfile(effectiveUid)
      .then((profile) => {
        if (cancelled) return;
        const next = getUserLabel(profile, effectiveUid);
        labelCache.set(effectiveUid, next);
        setLabel(next);
      })
      .catch(() => {
        if (!cancelled) setLabel(effectiveUid);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveUid]);

  return label;
}
