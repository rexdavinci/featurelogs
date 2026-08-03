import {
  DEFAULT_STYLE_TEMPLATES,
  mergeTemplates,
} from "@/utils/style-templates";
import { FAIR_USE_LIMITS, isoHoursAgo } from "@/utils/tiers";
import type {
  DashboardSnapshot,
  LogRecord,
  Project,
  TemplateRecord,
  StyleTemplates,
} from "@/lib/types";
import { adminDb } from "./firebase-admin";

type FirebaseLikeError = {
  code?: string;
  message?: string;
};

function isMissingIndexError(error: unknown) {
  const firebaseError = error as FirebaseLikeError;
  const code = String(firebaseError?.code ?? "").toLowerCase();
  const message = getErrorMessage(error).toLowerCase();

  return (
    code === "9" ||
    code === "failed-precondition" ||
    message.includes("failed_precondition") ||
    message.includes("requires an index")
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function describeFirestoreError(operation: string, error: unknown) {
  const firebaseError = error as FirebaseLikeError;
  const code = firebaseError?.code ?? "unknown";
  const baseMessage = getErrorMessage(error);

  if (code === "permission-denied") {
    return `Firestore permission denied during ${operation}. If this was executed in a server action, use Admin SDK. If this was executed on the client, verify request.auth and matching Firestore rules. Original: ${baseMessage}`;
  }

  if (code === "failed-precondition") {
    return `Firestore query failed during ${operation}. A required index is missing. Run: firebase deploy --only firestore:indexes`;
  }

  if (code === "unauthenticated") {
    return `Firestore unauthenticated during ${operation}. Ensure the caller is logged in and auth state is available before querying. Original: ${baseMessage}`;
  }

  return `Firestore error during ${operation}. code=${code}. Original: ${baseMessage}`;
}

function throwFirestoreError(operation: string, error: unknown): never {
  console.error(`[Firestore:${operation}]`, error);
  throw new Error(describeFirestoreError(operation, error));
}

function normalizeProjectName(projectName: string) {
  return projectName.trim().toLowerCase();
}

export async function countUsageSince(userId: string, sinceIso: string) {
  try {
    const snapshot = await adminDb
      .collection("usage_events")
      .where("userId", "==", userId)
      .get();

    return snapshot.docs
      .map((docSnapshot) => docSnapshot.data() as { createdAt?: unknown })
      .filter(
        (record) =>
          typeof record.createdAt === "string" && record.createdAt >= sinceIso,
      ).length;
  } catch (error) {
    throwFirestoreError("countUsageSince", error);
  }
}

export async function consumeUsage(
  userId: string,
  action:
    | "create_project"
    | "save_templates"
    | "generate_marketing_kit_ai"
    | "save_log"
    | "generate_monthly_newsletter_ai",
  metadata: Record<string, unknown> = {},
) {
  try {
    const usageRef = adminDb.collection("usage_events").doc();
    await usageRef.set({
      id: usageRef.id,
      userId,
      action,
      metadata,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    throwFirestoreError("consumeUsage", error);
  }
}

export async function loadPublicRanking() {
  try {
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const snapshot = await adminDb
      .collectionGroup("logs")
      .where("createdAt", ">=", thirtyDaysAgo)
      .get();

    const counts: Record<
      string,
      { projectId: string; projectName: string; count: number }
    > = {};

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data() as Partial<LogRecord>;
      const projectId = data.projectId;
      const projectName = data.projectName;

      if (!projectId || !projectName) {
        continue;
      }

      if (!counts[projectId]) {
        counts[projectId] = {
          projectId,
          projectName,
          count: 0,
        };
      }

      counts[projectId].count += 1;
    }

    return Object.values(counts)
      .sort((a, b) => b.count - a.count || a.projectName.localeCompare(b.projectName))
      .slice(0, 100);
  } catch (error) {
    throwFirestoreError("loadPublicRanking", error);
  }
}

export async function countProjects(userId: string) {
  try {
    const snapshot = await adminDb
      .collection("projects")
      .where("userId", "==", userId)
      .get();
    return snapshot.size;
  } catch (error) {
    throwFirestoreError("countProjects", error);
  }
}

export async function ensureProject(userId: string, projectName: string) {
  try {
    const normalized = normalizeProjectName(projectName);
    const projectDocRef = adminDb.collection("projects").doc();
    const now = new Date().toISOString();
    const record: Project = {
      id: projectDocRef.id,
      userId,
      normalized,
      name: projectName,
      createdAt: now,
      updatedAt: now,
    };
    await projectDocRef.set(record);
    return record;
  } catch (error) {
    throwFirestoreError("ensureProject", error);
  }
}

export async function findProjectByName(userId: string, projectName: string) {
  try {
    const normalized = normalizeProjectName(projectName);
    const snapshot = await adminDb
      .collection("projects")
      .where("userId", "==", userId)
      .where("normalized", "==", normalized)
      .limit(1)
      .get();
    return snapshot.docs[0]?.data() as Project | undefined;
  } catch (error) {
    throwFirestoreError("findProjectByName", error);
  }
}

export async function loadDashboardSnapshot(userId: string) {
  try {
    const projectsSnapshot = await adminDb
      .collection("projects")
      .where("userId", "==", userId)
      .orderBy("normalized", "asc")
      .limit(10)
      .get();

    let logs: LogRecord[] = [];

    try {
      const logsSnapshot = await adminDb
        .collectionGroup("logs")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

      logs = logsSnapshot.docs.map(
        (docSnapshot) => docSnapshot.data() as LogRecord,
      );
    } catch (error) {
      if (!isMissingIndexError(error)) {
        throw error;
      }

      // Fallback path while index deploy is pending.
      const fallbackSnapshot = await adminDb
        .collectionGroup("logs")
        .where("userId", "==", userId)
        .get();

      logs = fallbackSnapshot.docs
        .map((docSnapshot) => docSnapshot.data() as LogRecord)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 10);
    }

    const projects = projectsSnapshot.docs.map(
      (docSnapshot) => docSnapshot.data() as Project,
    );
    const latestProjectId = projects[0]?.id;

    let styleTemplates = DEFAULT_STYLE_TEMPLATES;
    if (latestProjectId) {
      const template = await loadTemplates(userId, latestProjectId);
      styleTemplates = mergeTemplates(template);
    }

    const usageCount = await countUsageSince(
      userId,
      isoHoursAgo(FAIR_USE_LIMITS.periodHours),
    );

    return {
      projects,
      logs,
      styleTemplates,
      usageCount,
    } as DashboardSnapshot;
  } catch (error) {
    throwFirestoreError("loadDashboardSnapshot", error);
  }
}

export async function loadProjectById(userId: string, projectId: string) {
  try {
    const snapshot = await adminDb
      .collection("projects")
      .where("userId", "==", userId)
      .where("id", "==", projectId)
      .limit(1)
      .get();
    return snapshot.docs[0]?.data() as Project | undefined;
  } catch (error) {
    throwFirestoreError("loadProjectById", error);
  }
}

export async function loadTemplates(userId: string, projectId: string) {
  try {
    const templateRef = adminDb
      .collection("style_templates")
      .doc(`${userId}:${projectId}`);
    const snapshot = await templateRef.get();
    if (!snapshot.exists) {
      return DEFAULT_STYLE_TEMPLATES;
    }

    const template = snapshot.data() as TemplateRecord | undefined;
    return mergeTemplates(template?.settings);
  } catch (error) {
    throwFirestoreError("loadTemplates", error);
  }
}

export async function saveTemplates(
  userId: string,
  projectId: string,
  settings: StyleTemplates,
) {
  try {
    const templateRef = adminDb
      .collection("style_templates")
      .doc(`${userId}:${projectId}`);
    await templateRef.set({
      userId,
      projectId,
      settings: mergeTemplates(settings),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throwFirestoreError("saveTemplates", error);
  }
}

export async function loadLogsSince(userId: string, sinceIso: string) {
  try {
    const snapshot = await adminDb
      .collectionGroup("logs")
      .where("userId", "==", userId)
      .where("createdAt", ">=", sinceIso)
      .orderBy("createdAt", "asc")
      .get();

    return snapshot.docs.map((docSnapshot) => docSnapshot.data() as LogRecord);
  } catch (error) {
    if (isMissingIndexError(error)) {
      // Fallback path while index deploy is pending.
      const fallbackSnapshot = await adminDb
        .collectionGroup("logs")
        .where("userId", "==", userId)
        .get();

      return fallbackSnapshot.docs
        .map((docSnapshot) => docSnapshot.data() as LogRecord)
        .filter(
          (record) =>
            typeof record.createdAt === "string" && record.createdAt >= sinceIso,
        )
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    throwFirestoreError("loadLogsSince", error);
  }
}

export async function saveLog(input: Record<string, unknown>) {
  try {
    const logRef = adminDb.collection("logs").doc();
    await logRef.set({
      ...input,
      id: logRef.id,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    throwFirestoreError("saveLog", error);
  }
}
