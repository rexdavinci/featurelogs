import type {
  DashboardSnapshot,
  LogRecord,
  Project,
  StyleTemplates,
  UserProfile,
} from "@/lib/types";
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
import { neonServerDatabaseAdapter } from "@/lib/db/neon/server-adapter";

type UsageAction =
  | "create_project"
  | "save_templates"
  | "generate_marketing_kit_ai"
  | "save_log"
  | "generate_monthly_newsletter_ai";

export interface ServerDatabaseAdapter {
  countUsageSince(userId: string, sinceIso: string): Promise<number>;
  consumeUsage(
    userId: string,
    action: UsageAction,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
  loadPublicRanking(): Promise<
    { projectId: string; projectName: string; count: number }[]
  >;
  countProjects(userId: string): Promise<number>;
  ensureProject(userId: string, projectName: string): Promise<Project>;
  findProjectByName(
    userId: string,
    projectName: string,
  ): Promise<Project | undefined>;
  loadDashboardSnapshot(userId: string): Promise<DashboardSnapshot>;
  loadProjectById(userId: string, projectId: string): Promise<Project | undefined>;
  loadTemplates(userId: string, projectId: string): Promise<StyleTemplates>;
  saveTemplates(
    userId: string,
    projectId: string,
    settings: StyleTemplates,
  ): Promise<void>;
  loadLogsSince(userId: string, sinceIso: string): Promise<LogRecord[]>;
  saveLog(input: Record<string, unknown>): Promise<void>;
  createUserProfile(newUser: UserProfile): Promise<void>;
  getUserProfile(uid: string): Promise<UserProfile | null>;
  ensureUserProfile(uid: string, email: string): Promise<UserProfile>;
}

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

const firestoreServerDatabaseAdapter: ServerDatabaseAdapter = {
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
      await adminDb.collection("profiles").doc(newUser.uid).set({
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

function resolveServerDbProvider() {
  return (process.env.DB_PROVIDER ?? "firestore").trim().toLowerCase();
}

function createServerDatabaseAdapter(): ServerDatabaseAdapter {
  const provider = resolveServerDbProvider();

  if (provider === "firestore") {
    return firestoreServerDatabaseAdapter;
  }

  if (provider === "neon") {
    return neonServerDatabaseAdapter;
  }

  throw new Error(
    `Unsupported DB_PROVIDER "${provider}". Supported providers: firestore, neon.`,
  );
}

export const serverDb = createServerDatabaseAdapter();

export const countUsageSince = (...args: Parameters<ServerDatabaseAdapter["countUsageSince"]>) =>
  serverDb.countUsageSince(...args);
export const consumeUsage = (...args: Parameters<ServerDatabaseAdapter["consumeUsage"]>) =>
  serverDb.consumeUsage(...args);
export const loadPublicRanking = (...args: Parameters<ServerDatabaseAdapter["loadPublicRanking"]>) =>
  serverDb.loadPublicRanking(...args);
export const countProjects = (...args: Parameters<ServerDatabaseAdapter["countProjects"]>) =>
  serverDb.countProjects(...args);
export const ensureProject = (...args: Parameters<ServerDatabaseAdapter["ensureProject"]>) =>
  serverDb.ensureProject(...args);
export const findProjectByName = (...args: Parameters<ServerDatabaseAdapter["findProjectByName"]>) =>
  serverDb.findProjectByName(...args);
export const loadDashboardSnapshot = (...args: Parameters<ServerDatabaseAdapter["loadDashboardSnapshot"]>) =>
  serverDb.loadDashboardSnapshot(...args);
export const loadProjectById = (...args: Parameters<ServerDatabaseAdapter["loadProjectById"]>) =>
  serverDb.loadProjectById(...args);
export const loadTemplates = (...args: Parameters<ServerDatabaseAdapter["loadTemplates"]>) =>
  serverDb.loadTemplates(...args);
export const saveTemplates = (...args: Parameters<ServerDatabaseAdapter["saveTemplates"]>) =>
  serverDb.saveTemplates(...args);
export const loadLogsSince = (...args: Parameters<ServerDatabaseAdapter["loadLogsSince"]>) =>
  serverDb.loadLogsSince(...args);
export const saveLog = (...args: Parameters<ServerDatabaseAdapter["saveLog"]>) =>
  serverDb.saveLog(...args);
export const createUserProfile = (
  ...args: Parameters<ServerDatabaseAdapter["createUserProfile"]>
) => serverDb.createUserProfile(...args);
export const getUserProfile = (
  ...args: Parameters<ServerDatabaseAdapter["getUserProfile"]>
) => serverDb.getUserProfile(...args);
export const ensureUserProfile = (
  ...args: Parameters<ServerDatabaseAdapter["ensureUserProfile"]>
) => serverDb.ensureUserProfile(...args);
