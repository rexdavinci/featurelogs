import "server-only";
import type { UserProfile } from "@/lib/types";
import type { ServerDatabaseAdapter } from "../types";
import { adminDb } from "@/utils/firebase-admin";
import {
  consumeUsage as consumeUsageFirestore,
  countProjects as countProjectsFirestore,
  countUsageSince as countUsageSinceFirestore,
  ensureProject as ensureProjectFirestore,
  findProjectByName as findProjectByNameFirestore,
  loadDashboardSnapshot as loadDashboardSnapshotFirestore,
  loadLogsSince as loadLogsSinceFirestore,
  loadProjectById as loadProjectByIdFirestore,
  loadPublicRanking as loadPublicRankingFirestore,
  loadTemplates as loadTemplatesFirestore,
  saveLog as saveLogFirestore,
  saveTemplates as saveTemplatesFirestore,
} from "@/utils/firestore";

type FirebaseLikeError = {
  code?: string;
  message?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function throwFirestoreError(operation: string, error: unknown): never {
  const firebaseError = error as FirebaseLikeError;
  const code = firebaseError?.code ?? "unknown";
  const baseMessage = getErrorMessage(error);
  console.error(`[Firestore:${operation}]`, error);
  throw new Error(
    `Firestore error during ${operation}. code=${code}. Original: ${baseMessage}`,
  );
}

export const firestoreServerDatabaseAdapter: ServerDatabaseAdapter = {
  countUsageSince: countUsageSinceFirestore,
  consumeUsage: consumeUsageFirestore,
  loadPublicRanking: loadPublicRankingFirestore,
  countProjects: countProjectsFirestore,
  ensureProject: ensureProjectFirestore,
  findProjectByName: findProjectByNameFirestore,
  loadDashboardSnapshot: loadDashboardSnapshotFirestore,
  loadProjectById: loadProjectByIdFirestore,
  loadTemplates: loadTemplatesFirestore,
  saveTemplates: saveTemplatesFirestore,
  loadLogsSince: loadLogsSinceFirestore,
  saveLog: saveLogFirestore,
  async createUserProfile(newUser) {
    try {
      await adminDb
        .collection("profiles")
        .doc(newUser.uid)
        .set({
          ...newUser,
        });
    } catch (error) {
      throwFirestoreError("createUserProfile", error);
    }
  },
  async getUserProfile(uid) {
    try {
      const snapshot = await adminDb.collection("profiles").doc(uid).get();
      if (!snapshot.exists) {
        return null;
      }
      return snapshot.data() as UserProfile;
    } catch (error) {
      throwFirestoreError("getUserProfile", error);
    }
  },
  async ensureUserProfile(uid, email) {
    try {
      const profile = await firestoreServerDatabaseAdapter.getUserProfile(uid);
      if (profile) {
        return profile;
      }

      const now = new Date().toISOString();
      const record: UserProfile = {
        uid,
        email,
        projects: [],
        createdAt: now,
        updatedAt: now,
      };
      await firestoreServerDatabaseAdapter.createUserProfile(record);
      return record;
    } catch (error) {
      throwFirestoreError("ensureUserProfile", error);
    }
  },
};
