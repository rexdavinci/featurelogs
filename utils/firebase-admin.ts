import "server-only";
import { env } from "@/.env";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const { privateKey, projectId, clientEmail } = env.firebase;

if (!privateKey || !projectId || !clientEmail) {
  throw new Error(
    "Firebase requires FIREBASE_PROJECT_ID, FIREBASE_SERVICE_KEY, and FIREBASE_CLIENT_EMAIL.",
  );
}

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId,
          privateKey,
          clientEmail,
        }),
      })
    : getApps()[0];

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { app, adminAuth, adminDb };
