import {
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { auth } from '@/src/firebaseConfig';

export async function signIn(email: string, pin: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email.trim(), pin);
}

export async function signUp(email: string, pin: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email.trim(), pin);
}

export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}
