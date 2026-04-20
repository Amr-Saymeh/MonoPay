import { useEffect, useState } from "react";

import * as Contacts from "expo-contacts";
import { get, ref } from "firebase/database";

import { db } from "@/src/firebaseConfig";
import { AppUser } from "../types";

export interface ContactUser extends AppUser {
  contactName: string; // الاسم من جهات الاتصال بالجوال
  isOnApp: boolean; // هل مسجل على التطبيق؟
}

interface UseContactUsersResult {
  onAppContacts: ContactUser[]; // جهات الاتصال المسجلة على التطبيق
  offAppContacts: ContactUser[]; // جهات الاتصال غير المسجلة
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  searchByPhone: (phone: string) => Promise<AppUser | null>;
}

// ─── Helper: ينظّف رقم الهاتف ──────────────────────────────────────────────
function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("970")) {
    digits = "0" + digits.slice(3);
  }

  if (digits.startsWith("972")) {
    digits = "0" + digits.slice(3);
  }

  return digits;
}

// ─── Helper: يجيب كل users من الـ DB ────────────────────────────────────────
async function fetchAllDBUsers(): Promise<AppUser[]> {
  const snap = await get(ref(db, "users"));
  if (!snap.exists()) return [];
  const raw = snap.val() as Record<string, Omit<AppUser, "uid">>;
  return Object.entries(raw)
    .map(([uid, data]) => ({ uid, ...data }))
    .filter((u) => u.type === 1); // فقط المستخدمين العاديين
}


// ─── Main Hook ───────────────────────────────────────────────────────────────
export function useContactUsers(excludeUid?: string): UseContactUsersResult {
  const [onAppContacts, setOnAppContacts] = useState<ContactUser[]>([]);
  const [offAppContacts, setOffAppContacts] = useState<ContactUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [allDBUsers, setAllDBUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        // 1. اطلب إذن جهات الاتصال
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== "granted") {
          setPermissionDenied(true);
          // حتى لو رفض، نجيب الـ DB users كـ fallback
          const dbUsers = await fetchAllDBUsers();
          setAllDBUsers(dbUsers.filter((u) => u.uid !== excludeUid));
          return;
        }

        // 2. جيب جهات الاتصال + الـ DB users بالتوازي
        const [{ data: deviceContacts }, dbUsers] = await Promise.all([
          Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
          }),
          fetchAllDBUsers(),
        ]);

        // احفظ الـ DB users للبحث لاحقاً
        setAllDBUsers(dbUsers.filter((u) => u.uid !== excludeUid));

        // 3. اعمل map من رقم الهاتف → DB user
        const phoneToUser = new Map<string, AppUser>();
        dbUsers.forEach((user) => {
          if (user.number) {
            phoneToUser.set(normalizePhone(String(user.number)), user);
          }
        });

        // 4. قارن جهات الاتصال مع الـ DB
        const seen = new Set<string>(); // لتجنب التكرار
        const onApp: ContactUser[] = [];
        const offApp: ContactUser[] = [];

        deviceContacts.forEach((contact) => {
          const contactName = contact.name ?? "Unknown";
          contact.phoneNumbers?.forEach(({ number }) => {
            if (!number) return;
            const normalized = normalizePhone(number);
            if (seen.has(normalized)) return;
            seen.add(normalized);

            const dbUser = phoneToUser.get(normalized);

            if (dbUser && dbUser.uid !== excludeUid) {
              onApp.push({ ...dbUser, contactName, isOnApp: true });
            } else if (!dbUser) {
              // غير مسجل — نضيفه كـ placeholder
              offApp.push({
                uid: `off_${normalized}`,
                name: contactName,
                number: normalized,
                type: -1,
                contactName,
                isOnApp: false,
              });
            }
          });
        });

        setOnAppContacts(onApp);
        setOffAppContacts(offApp.slice(0, 20)); // أول 20 فقط
      } catch (e) {
        console.error("[useContactUsers]", e);
        setError("Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [excludeUid]);

  // ─── بحث برقم هاتف خارج جهات الاتصال ─────────────────────────────────────
  const searchByPhone = async (phone: string): Promise<AppUser | null> => {
    const normalized = normalizePhone(phone);
    
    // ابحث في الـ DB users المحفوظة أولاً
    const found = allDBUsers.find(
      (u) => normalizePhone(String(u.number ?? "")) === normalized,
    );
    if (found) return found;

    // لو مش موجود في الكاش، تحقق من الـ DB مباشرة
    try {
      const snap = await get(ref(db, "users"));
      if (!snap.exists()) return null;
      const raw = snap.val() as Record<string, Omit<AppUser, "uid">>;
      const entry = Object.entries(raw).find(
        ([, data]) =>
          normalizePhone(String((data as AppUser).number ?? "")) === normalized,
      );
      if (!entry) return null;
      const [uid, data] = entry;
      return { uid, ...(data as Omit<AppUser, "uid">) };
    } catch {
      return null;
    }
  };

  return {
    onAppContacts,
    offAppContacts,
    loading,
    error,
    permissionDenied,
    searchByPhone,
  };
}
