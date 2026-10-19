import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { DEFAULT_STYLE_TEMPLATES, mergeTemplates } from "@/utils/style-templates";
import { FAIR_USE_LIMITS, isoHoursAgo } from "@/utils/tiers";
import type {
  DashboardSnapshot,
  LogRecord,
  Project,
  UserProfile,
} from "@/lib/types";
import { getNeonDb } from "./client";
import { logs, profiles, projects, styleTemplates, usageEvents } from "./schema";
import type { ServerDatabaseAdapter } from "@/lib/db/types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function throwNeonError(operation: string, error: unknown): never {
  console.error(`[Neon:${operation}]`, error);
  throw new Error(
    `Neon error during ${operation}. Original: ${getErrorMessage(error)}`,
  );
}

function normalizeProjectName(projectName: string) {
  return projectName.trim().toLowerCase();
}

function toProject(row: {
  id: string;
  userId: string;
  name: string;
  normalized: string;
  createdAt: string;
  updatedAt: string;
}): Project {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    normalized: row.normalized,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function assertStringField(
  value: unknown,
  field: keyof Omit<LogRecord, "id" | "createdAt">,
) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid log payload: "${field}" must be a non-empty string.`);
  }
}

function toUserProfile(row: {
  uid: string;
  email: string;
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}): UserProfile {
  return {
    uid: row.uid,
    email: row.email,
    projects: Array.isArray(row.projects) ? row.projects : [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const usageCountExpr = sql<number>`count(*)::int`;

export const neonServerDatabaseAdapter: ServerDatabaseAdapter = {
  async countUsageSince(userId, sinceIso) {
    try {
      const neonDb = getNeonDb();
      const rows = await neonDb
        .select({
          count: usageCountExpr,
        })
        .from(usageEvents)
        .where(and(eq(usageEvents.userId, userId), gte(usageEvents.createdAt, sinceIso)));

      return rows[0]?.count ?? 0;
    } catch (error) {
      throwNeonError("countUsageSince", error);
    }
  },

  async consumeUsage(userId, action, metadata = {}) {
    try {
      const neonDb = getNeonDb();
      await neonDb.insert(usageEvents).values({
        id: crypto.randomUUID(),
        userId,
        action,
        metadata,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      throwNeonError("consumeUsage", error);
    }
  },

  async loadPublicRanking() {
    try {
      const neonDb = getNeonDb();
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const rows = await neonDb
        .select({
          projectId: logs.projectId,
          projectName: logs.projectName,
          count: usageCountExpr,
        })
        .from(logs)
        .where(gte(logs.createdAt, thirtyDaysAgo))
        .groupBy(logs.projectId, logs.projectName)
        .orderBy(desc(usageCountExpr), asc(logs.projectName))
        .limit(100);

      return rows;
    } catch (error) {
      throwNeonError("loadPublicRanking", error);
    }
  },

  async countProjects(userId) {
    try {
      const neonDb = getNeonDb();
      const rows = await neonDb
        .select({ count: usageCountExpr })
        .from(projects)
        .where(eq(projects.userId, userId));
      return rows[0]?.count ?? 0;
    } catch (error) {
      throwNeonError("countProjects", error);
    }
  },

  async ensureProject(userId, projectName) {
    try {
      const neonDb = getNeonDb();
      const now = new Date().toISOString();
      const record: Project = {
        id: crypto.randomUUID(),
        userId,
        normalized: normalizeProjectName(projectName),
        name: projectName,
        createdAt: now,
        updatedAt: now,
      };

      await neonDb.insert(projects).values({
        id: record.id,
        userId: record.userId,
        normalized: record.normalized,
        name: record.name,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });

      return record;
    } catch (error) {
      throwNeonError("ensureProject", error);
    }
  },

  async findProjectByName(userId, projectName) {
    try {
      const neonDb = getNeonDb();
      const normalized = normalizeProjectName(projectName);
      const rows = await neonDb
        .select()
        .from(projects)
        .where(
          and(eq(projects.userId, userId), eq(projects.normalized, normalized)),
        )
        .limit(1);
      const row = rows[0];

      if (!row) {
        return undefined;
      }

      return toProject(row);
    } catch (error) {
      throwNeonError("findProjectByName", error);
    }
  },

  async loadDashboardSnapshot(userId) {
    try {
      const neonDb = getNeonDb();
      const [projectRows, logRows] = await Promise.all([
        neonDb
          .select()
          .from(projects)
          .where(eq(projects.userId, userId))
          .orderBy(asc(projects.normalized))
          .limit(10),
        neonDb
          .select()
          .from(logs)
          .where(eq(logs.userId, userId))
          .orderBy(desc(logs.createdAt))
          .limit(10),
      ]);

      const dashboardProjects = projectRows.map(toProject);
      const latestProjectId = dashboardProjects[0]?.id;
      let templates = DEFAULT_STYLE_TEMPLATES;

      if (latestProjectId) {
        templates = await neonServerDatabaseAdapter.loadTemplates(
          userId,
          latestProjectId,
        );
      }

      const usageCount = await neonServerDatabaseAdapter.countUsageSince(
        userId,
        isoHoursAgo(FAIR_USE_LIMITS.periodHours),
      );

      return {
        projects: dashboardProjects,
        logs: logRows as LogRecord[],
        styleTemplates: templates,
        usageCount,
      } satisfies DashboardSnapshot;
    } catch (error) {
      throwNeonError("loadDashboardSnapshot", error);
    }
  },

  async loadProjectById(userId, projectId) {
    try {
      const neonDb = getNeonDb();
      const rows = await neonDb
        .select()
        .from(projects)
        .where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
        .limit(1);
      const row = rows[0];

      if (!row) {
        return undefined;
      }

      return toProject(row);
    } catch (error) {
      throwNeonError("loadProjectById", error);
    }
  },

  async loadTemplates(userId, projectId) {
    try {
      const neonDb = getNeonDb();
      const rows = await neonDb
        .select()
        .from(styleTemplates)
        .where(
          and(
            eq(styleTemplates.userId, userId),
            eq(styleTemplates.projectId, projectId),
          ),
        )
        .limit(1);
      const row = rows[0];

      if (!row) {
        return DEFAULT_STYLE_TEMPLATES;
      }

      return mergeTemplates(row.settings);
    } catch (error) {
      throwNeonError("loadTemplates", error);
    }
  },

  async saveTemplates(userId, projectId, settings) {
    try {
      const neonDb = getNeonDb();
      await neonDb
        .insert(styleTemplates)
        .values({
          userId,
          projectId,
          settings: mergeTemplates(settings),
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: [styleTemplates.userId, styleTemplates.projectId],
          set: {
            settings: mergeTemplates(settings),
            updatedAt: new Date().toISOString(),
          },
        });
    } catch (error) {
      throwNeonError("saveTemplates", error);
    }
  },

  async loadLogsSince(userId, sinceIso) {
    try {
      const neonDb = getNeonDb();
      const rows = await neonDb
        .select()
        .from(logs)
        .where(and(eq(logs.userId, userId), gte(logs.createdAt, sinceIso)))
        .orderBy(asc(logs.createdAt));

      return rows as LogRecord[];
    } catch (error) {
      throwNeonError("loadLogsSince", error);
    }
  },

  async saveLog(input) {
    try {
      const neonDb = getNeonDb();
      assertStringField(input.userId, "userId");
      assertStringField(input.projectId, "projectId");
      assertStringField(input.projectName, "projectName");
      assertStringField(input.rawInput, "rawInput");
      assertStringField(input.outputChangelog, "outputChangelog");
      assertStringField(input.outputTwitter, "outputTwitter");
      assertStringField(input.outputLinkedin, "outputLinkedin");
      assertStringField(input.outputHelpFaq, "outputHelpFaq");
      assertStringField(input.outputEmailNewsletter, "outputEmailNewsletter");

      await neonDb.insert(logs).values({
        id: crypto.randomUUID(),
        userId: input.userId as string,
        projectId: input.projectId as string,
        projectName: input.projectName as string,
        rawInput: input.rawInput as string,
        outputChangelog: input.outputChangelog as string,
        outputTwitter: input.outputTwitter as string,
        outputLinkedin: input.outputLinkedin as string,
        outputHelpFaq: input.outputHelpFaq as string,
        outputEmailNewsletter: input.outputEmailNewsletter as string,
        outputMonthlyRecap:
          typeof input.outputMonthlyRecap === "string"
            ? input.outputMonthlyRecap
            : null,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      throwNeonError("saveLog", error);
    }
  },

  async createUserProfile(newUser) {
    try {
      const neonDb = getNeonDb();
      await neonDb
        .insert(profiles)
        .values({
          uid: newUser.uid,
          email: newUser.email,
          projects: Array.isArray(newUser.projects) ? newUser.projects : [],
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        })
        .onConflictDoUpdate({
          target: profiles.uid,
          set: {
            email: newUser.email,
            projects: Array.isArray(newUser.projects) ? newUser.projects : [],
            updatedAt: new Date().toISOString(),
          },
        });
    } catch (error) {
      throwNeonError("createUserProfile", error);
    }
  },

  async getUserProfile(uid) {
    try {
      const neonDb = getNeonDb();
      const rows = await neonDb
        .select()
        .from(profiles)
        .where(eq(profiles.uid, uid))
        .limit(1);
      const row = rows[0];

      if (!row) {
        return null;
      }

      return toUserProfile(row);
    } catch (error) {
      throwNeonError("getUserProfile", error);
    }
  },

  async ensureUserProfile(uid, email) {
    try {
      const existing = await neonServerDatabaseAdapter.getUserProfile(uid);
      if (existing) {
        return existing;
      }

      const now = new Date().toISOString();
      const profile: UserProfile = {
        uid,
        email,
        projects: [],
        createdAt: now,
        updatedAt: now,
      };

      await neonServerDatabaseAdapter.createUserProfile(profile);
      return profile;
    } catch (error) {
      throwNeonError("ensureUserProfile", error);
    }
  },
};
