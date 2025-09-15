// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Use environment variables to control emulator vs production:
 * - VITE_FIREBASE_USE_EMULATOR (string) = "true" to enable emulator
 * - VITE_FIREBASE_AUTH_EMULATOR_URL (string) = e.g. "http://localhost:9099"
 *
 * Make sure Vite env variables prefixed with VITE_ are set in .env.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyA1CHFQxKQu4pR2wCgJr1qdhxXMSEvPKEI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "hospital-readmission-a5231.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "hospital-readmission-a5231",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "hospital-readmission-a5231.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "936244557596",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:936244557596:web:a6a85d362f2063554e6cd9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-92VJ5030F9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// If you want to use the Firebase Auth emulator locally, set these envs in .env:
// VITE_FIREBASE_USE_EMULATOR=true
// VITE_FIREBASE_AUTH_EMULATOR_URL=http://localhost:9099
//
// This code only connects when the flag is present and valid.
try {
  const useEmulator = (import.meta.env.VITE_FIREBASE_USE_EMULATOR ?? "false").toLowerCase() === "true";
  const emulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL ?? "";

  if (useEmulator && emulatorUrl) {
    // make sure the emulator URL looks like http(s)://host:port
    // connectAuthEmulator requires a URL without a trailing slash in some SDK versions
    connectAuthEmulator(auth, emulatorUrl, { disableWarnings: true });
    console.info(`Firebase Auth: connected to emulator at ${emulatorUrl}`);
  } else {
    console.info("Firebase Auth: using production (no emulator connected).");
  }
} catch (err) {
  // Do not crash the app — log and continue with production auth
  console.warn("Could not connect to Firebase Auth emulator:", err?.message ?? err);
}

export { app, auth, db };
