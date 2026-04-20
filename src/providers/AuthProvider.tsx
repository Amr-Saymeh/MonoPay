import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { deleteUser, onAuthStateChanged, User } from "firebase/auth";

import { auth } from "@/src/firebaseConfig";
import { signIn, signOut, signUp } from "@/src/services/auth.service";
import { uploadImageToCloudinary } from "@/src/services/cloudinary.service";
import {
    createUserProfile,
    subscribeUserProfile,
    UserProfile,
} from "@/src/services/user.service";

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  pin: string;
  phone: string;
  address: string;
  identityNumber: number;
  identityImageUri: string;
  personalImageUri: string;
  categories?: string[];
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  profileLoaded: boolean;
  initializing: boolean;
  signingIn: boolean;
  signingOut: boolean;
  registering: boolean;
  signIn: (email: string, pin: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setProfile(null);
      setProfileLoaded(false);

      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (u) {
        profileUnsub = subscribeUserProfile(u.uid, (p) => {
          setProfile(p);
          setProfileLoaded(true);
        });
      }

      setInitializing(false);
    });

    return () => {
      if (profileUnsub) profileUnsub();
      unsub();
    };
  }, []);

  const doSignIn = useCallback(async (email: string, pin: string) => {
    setSigningIn(true);
    try {
      await signIn(email, pin);
    } finally {
      setSigningIn(false);
    }
  }, []);

  const doSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setRegistering(true);

    let credentials: Awaited<ReturnType<typeof signUp>> | null = null;

    try {
      credentials = await signUp(input.email, input.pin);

      const uid = credentials.user.uid;
      const stamp = Date.now();

      const identityImageUrl = await uploadImageToCloudinary({
        uri: input.identityImageUri,
        folder: "monopay/identity",
        fileName: `${uid}-identity-${stamp}`,
      });

      const personalImageUrl = await uploadImageToCloudinary({
        uri: input.personalImageUri,
        folder: "monopay/personal",
        fileName: `${uid}-selfie-${stamp}`,
      });

      await createUserProfile({
        uid,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        identityNumber: input.identityNumber,
        identityImageUrl,
        personalImageUrl,
        categories: input.categories ?? [],
      });
    } catch (e) {
      if (credentials) {
        try {
          await deleteUser(credentials.user);
        } catch {
          // ignore
        }
      }
      throw e;
    } finally {
      setRegistering(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      profileLoaded,
      initializing,
      signingIn,
      signingOut,
      registering,
      signIn: doSignIn,
      signOut: doSignOut,
      register,
    }),
    [
      user,
      profile,
      profileLoaded,
      initializing,
      signingIn,
      signingOut,
      registering,
      doSignIn,
      doSignOut,
      register,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
