import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { get, ref } from "firebase/database";

import { auth, db } from '@/src/firebaseConfig';

export type EmailAvailabilityStatus = "available" | "exists" | "unknown";

export async function signIn(email: string, pin: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email.trim(), pin);
}

export async function signUp(email: string, pin: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email.trim(), pin);
}

export async function getEmailAvailability(email: string): Promise<EmailAvailabilityStatus> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
    if (methods.length > 0) {
      return "exists";
    }
  } catch {
    // Fall through to the user profile lookup.
  }

  try {
    const snapshot = await get(ref(db, "users"));
    const users = snapshot.val() as Record<string, { email?: string }> | null;

    const exists = Object.values(users ?? {}).some(
      (user) => user.email?.trim().toLowerCase() === normalizedEmail,
    );

    return exists ? "exists" : "available";
  } catch {
    return "unknown";
  }
}

export function isEmailAlreadyInUseError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "auth/email-already-in-use"
  );
}

export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}
