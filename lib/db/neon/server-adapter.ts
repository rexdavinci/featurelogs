import "server-only";
import { and, asc, desc, eq, gte, ne, sql } from "drizzle-orm";
import {
  DEFAULT_STYLE_TEMPLATES,
  mergeTemplates,
} from "@/utils/style-templates";
import { FAIR_USE_LIMITS, isoHoursAgo } from "@/utils/tiers";
import type { LogRecord, Project } from "@/lib/types";
import type { ServerDatabaseAdapter } from "@/lib/db/types";
import { withNeonPublicDb, withNeonUserDb } from "./client";
import {
  logs,
  profiles,
  projects,
  styleTemplates,
  usageEvents,
} from "./schema";

const count = sql<number>`count(*)::int`;

export const neonServerDatabaseAdapter: ServerDatabaseAdapter = {
  countUsageSince: (uid, since) =>
    withNeonUserDb(
      uid,
      async (db) =>
        (
          await db
            .select({ count })
            .from(usageEvents)
            .where(
              and(
                eq(usageEvents.userId, uid),
                ne(usageEvents.action, "account_delete_attempt"),
                gte(usageEvents.createdAt, since),
              ),
            )
        )[0]?.count ?? 0,
    ),
  consumeUsage: (uid, action, metadata = {}) =>
    withNeonUserDb(uid, async (db) => {
      await db.insert(usageEvents).values({
        id: crypto.randomUUID(),
        userId: uid,
        action,
        metadata,
        createdAt: new Date().toISOString(),
      });
    }),
  loadPublicRanking: () =>
    withNeonPublicDb(async (db) => {
      const result = await db.execute<{
        project_id: string;
        project_name: string;
        count: number;
      }>(sql`SELECT * FROM public.featurelogs_public_ranking()`);
      return result.rows.map((row) => ({
        projectId: row.project_id,
        projectName: row.project_name,
        count: row.count,
      }));
    }),
  countProjects: (uid) =>
    withNeonUserDb(
      uid,
      async (db) =>
        (
          await db
            .select({ count })
            .from(projects)
            .where(eq(projects.userId, uid))
        )[0]?.count ?? 0,
    ),
  ensureProject: (uid, name) =>
    withNeonUserDb(uid, async (db) => {
      const now = new Date().toISOString();
      const project: Project = {
        id: crypto.randomUUID(),
        userId: uid,
        name,
        normalized: name.trim().toLowerCase(),
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(projects).values(project);
      return project;
    }),
  findProjectByName: (uid, name) =>
    withNeonUserDb(
      uid,
      async (db) =>
        (
          await db
            .select()
            .from(projects)
            .where(
              and(
                eq(projects.userId, uid),
                eq(projects.normalized, name.trim().toLowerCase()),
              ),
            )
            .limit(1)
        )[0],
    ),
  loadProjectById: (uid, id) =>
    withNeonUserDb(
      uid,
      async (db) =>
        (
          await db
            .select()
            .from(projects)
            .where(and(eq(projects.userId, uid), eq(projects.id, id)))
            .limit(1)
        )[0],
    ),
  loadDashboardSnapshot: (uid) =>
    withNeonUserDb(uid, async (db) => {
      const projectRows = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, uid))
        .orderBy(asc(projects.normalized))
        .limit(10);
      const logRows = await db
        .select()
        .from(logs)
        .where(eq(logs.userId, uid))
        .orderBy(desc(logs.createdAt))
        .limit(10);
      const templateRows = projectRows[0]
        ? await db
            .select()
            .from(styleTemplates)
            .where(
              and(
                eq(styleTemplates.userId, uid),
                eq(styleTemplates.projectId, projectRows[0].id),
              ),
            )
            .limit(1)
        : [];
      const usageRows = await db
        .select({ count })
        .from(usageEvents)
        .where(
          and(
            eq(usageEvents.userId, uid),
            ne(usageEvents.action, "account_delete_attempt"),
            gte(
              usageEvents.createdAt,
              isoHoursAgo(FAIR_USE_LIMITS.periodHours),
            ),
          ),
        );
      return {
        projects: projectRows,
        logs: logRows as LogRecord[],
        styleTemplates: templateRows[0]
          ? mergeTemplates(templateRows[0].settings)
          : DEFAULT_STYLE_TEMPLATES,
        usageCount: usageRows[0]?.count ?? 0,
      };
    }),
  loadTemplates: (uid, projectId) =>
    withNeonUserDb(uid, async (db) => {
      const rows = await db
        .select()
        .from(styleTemplates)
        .where(
          and(
            eq(styleTemplates.userId, uid),
            eq(styleTemplates.projectId, projectId),
          ),
        )
        .limit(1);
      return rows[0]
        ? mergeTemplates(rows[0].settings)
        : DEFAULT_STYLE_TEMPLATES;
    }),
  saveTemplates: (uid, projectId, settings) =>
    withNeonUserDb(uid, async (db) => {
      const project = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.userId, uid)))
        .limit(1);
      if (!project[0]) throw new Error("Project not found.");
      const record = {
        userId: uid,
        projectId,
        settings: mergeTemplates(settings),
        updatedAt: new Date().toISOString(),
      };
      await db
        .insert(styleTemplates)
        .values(record)
        .onConflictDoUpdate({
          target: [styleTemplates.userId, styleTemplates.projectId],
          set: { settings: record.settings, updatedAt: record.updatedAt },
        });
    }),
  loadLogsSince: (uid, since) =>
    withNeonUserDb(
      uid,
      async (db) =>
        (await db
          .select()
          .from(logs)
          .where(and(eq(logs.userId, uid), gte(logs.createdAt, since)))
          .orderBy(asc(logs.createdAt))) as LogRecord[],
    ),
  async saveLog(input) {
    const required = [
      "userId",
      "projectId",
      "projectName",
      "rawInput",
      "outputChangelog",
      "outputTwitter",
      "outputLinkedin",
      "outputHelpFaq",
      "outputEmailNewsletter",
    ] as const;
    for (const field of required)
      if (typeof input[field] !== "string" || !(input[field] as string).trim())
        throw new Error(`Invalid log field: ${field}.`);
    const record = Object.fromEntries(
      required.map((field) => [field, input[field]]),
    ) as Omit<typeof logs.$inferInsert, "id" | "createdAt">;
    await withNeonUserDb(record.userId, async (db) => {
      await db.insert(logs).values({
        ...record,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        outputMonthlyRecap:
          typeof input.outputMonthlyRecap === "string"
            ? input.outputMonthlyRecap
            : null,
      });
    });
  },
  createUserProfile: (profile) =>
    withNeonUserDb(profile.uid, async (db) => {
      await db
        .insert(profiles)
        .values(profile)
        .onConflictDoUpdate({
          target: profiles.uid,
          set: {
            email: profile.email,
            projects: profile.projects,
            updatedAt: new Date().toISOString(),
          },
        });
    }),
  getUserProfile: (uid) =>
    withNeonUserDb(
      uid,
      async (db) =>
        (
          await db.select().from(profiles).where(eq(profiles.uid, uid)).limit(1)
        )[0] ?? null,
    ),
  ensureUserProfile: (uid, email) =>
    withNeonUserDb(uid, async (db) => {
      const now = new Date().toISOString();
      await db
        .insert(profiles)
        .values({ uid, email, projects: [], createdAt: now, updatedAt: now })
        .onConflictDoNothing();
      return (
        await db.select().from(profiles).where(eq(profiles.uid, uid)).limit(1)
      )[0];
    }),
};
