import * as admin from "firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

function initAdmin() {
  if (admin.apps.length) {
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Add your Firebase service account JSON to Vercel env vars (or .env.local for vercel dev).",
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
  });
}

let dbInstance: admin.firestore.Firestore | null = null;

export function getDb(): admin.firestore.Firestore {
  initAdmin();
  if (!dbInstance) {
    dbInstance = admin.firestore();
  }
  return dbInstance;
}

export { FieldValue };

export type SessionDoc = {
  createdAt: Timestamp | FieldValue;
  secretHash: string;
  device?: string;
  lastBpm?: number;
  lastAt?: Timestamp | FieldValue;
};

export type HeartDoc = {
  bpm: number;
  createdAt: Timestamp | FieldValue;
};
