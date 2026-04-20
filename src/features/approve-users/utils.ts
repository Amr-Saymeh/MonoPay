import { ref, remove, update } from "firebase/database";

import { db } from "@/src/firebaseConfig";

export function isValidImageUri(uri: unknown): uri is string {
  return typeof uri === "string" && uri.trim().length > 0;
}

export async function approveUser(userId: string) {
  await update(ref(db, `users/${userId}`), { type: 1 });
}

export async function rejectUser(userId: string) {
  await remove(ref(db, `users/${userId}`));
}
