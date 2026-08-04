import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceKey = process.env.FIREBASE_SERVICE_KEY;

if (!serviceKey) {
  throw new Error("FIREBASE_SERVICE_KEY environment variable is not set");
}

const app = getApps().length === 0 ? initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    privateKey: serviceKey?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
}) : getApps()[0];

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { app, adminAuth, adminDb };
