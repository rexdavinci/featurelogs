import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

let serviceAccount = undefined;

if (serviceAccountPath) {
  // Load JSON synchronously so cert() receives a real object
  const raw = fs.readFileSync(serviceAccountPath, "utf8");
  serviceAccount = JSON.parse(raw);
}

const appConfig = serviceAccount
  ? {
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    }
  : {
      projectId: process.env.FIREBASE_PROJECT_ID,
    };

const app =
  getApps().length === 0
    ? initializeApp(appConfig)
    : getApps()[0];

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { adminAuth, adminDb };
