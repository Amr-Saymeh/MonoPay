import { get, onValue, ref, set, update } from "firebase/database";

import { db } from "@/src/firebaseConfig";

export type UserProfile = {
  address?: string;
  categories?: string[];
  email?: string;
  identityImage?: string;
  identityNumber?: number;
  name?: string;
  number?: string | number;
  personalImage?: string;
  type?: number;
};

export type CreateUserProfileInput = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  identityNumber: number;
  identityImageUrl: string;
  personalImageUrl: string;
  categories?: string[];
};

export async function createUserProfile(input: CreateUserProfileInput) {
  const userRef = ref(db, `users/${input.uid}`);

  const payload: UserProfile = {
    name: `${input.firstName} ${input.lastName}`.trim(),
    email: input.email,
    number: input.phone,
    address: input.address,
    categories: Array.isArray(input.categories) ? input.categories : [],
    identityNumber: input.identityNumber,
    identityImage: input.identityImageUrl,
    personalImage: input.personalImageUrl,
    type: 0,
  };

  await set(userRef, payload);
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>,
) {
  await update(ref(db, `users/${uid}`), updates);
}

export async function getUserProfile(uid: string) {
  const snap = await get(ref(db, `users/${uid}`));
  return (snap.val() ?? null) as UserProfile | null;
}

export function subscribeUserProfile(
  uid: string,
  onChange: (profile: UserProfile | null) => void,
) {
  const unsub = onValue(
    ref(db, `users/${uid}`),
    (snap) => onChange((snap.val() ?? null) as UserProfile | null),
    () => onChange(null),
  );

  return () => unsub();
}
