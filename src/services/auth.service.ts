import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';

import { auth } from '@/src/firebaseConfig';

export async function signIn(email: string, pin: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email.trim(), pin);
}

export async function signUp(email: string, pin: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email.trim(), pin);
}

export async function isEmailInUse(email: string): Promise<boolean> {
  const methods = await fetchSignInMethodsForEmail(auth, email.trim());
  return methods.length > 0;
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
