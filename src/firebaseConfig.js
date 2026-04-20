import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
    getAuth,
    getReactNativePersistence,
    initializeAuth,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyA74I3FfbRjPgNhyUkrPtMSCWWngzZCWa0",
  authDomain: "restym-e4f1a.firebaseapp.com",
  databaseURL:
    "https://restym-e4f1a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "restym-e4f1a",
  storageBucket: "restym-e4f1a.firebasestorage.app",
  messagingSenderId: "912802481384",
  appId: "1:912802481384:web:e41e186542b45ebff0b55d",
  measurementId: "G-62TEL1EP9T",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getDatabase(app);

const globalAny = globalThis;

export const auth =
  globalAny.__MONOPAY_FIREBASE_AUTH__ ??
  (globalAny.__MONOPAY_FIREBASE_AUTH__ =
    Platform.OS === "web"
      ? getAuth(app)
      : (() => {
          try {
            return initializeAuth(app, {
              persistence: getReactNativePersistence(AsyncStorage),
            });
          } catch {
            return getAuth(app);
          }
        })());

export { app };

