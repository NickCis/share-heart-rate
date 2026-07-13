import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyCnEaKX7dNMnjYtsqPgkydzAfzRtFjJY0w",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "share-heart-rate.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "share-heart-rate",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "share-heart-rate.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "46947561288",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:46947561288:web:8bafa7ae7c9800c4828d7d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

let emulatorsConnected = false;

export function connectEmulatorsIfNeeded() {
  if (emulatorsConnected) {
    return;
  }
  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS !== "true") {
    return;
  }
  const host = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
  const [hostname, portStr] = host.split(":");
  const port = Number(portStr ?? 8080);
  connectFirestoreEmulator(db, hostname, port);
  emulatorsConnected = true;
}
