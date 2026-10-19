import "server-only";
import { and, eq, gte, or, sql } from "drizzle-orm";
import { withNeonUserDb, type NeonTransaction } from "@/lib/db/neon/client";
import {
  authPasswordResets,
  authSessions,
  authUsers,
  logs,
  profiles,
  projects,
  styleTemplates,
  usageEvents,
} from "@/lib/db/neon/schema";

// Explicit allowlist: exports never contain password hashes or session/reset tokens.
export async function exportNeonAccount(db: NeonTransaction, uid: string) {
  const [account] = await db
    .select({
      id: authUsers.id,
      email: authUsers.email,
      createdAt: authUsers.createdAt,
      updatedAt: authUsers.updatedAt,
    })
    .from(authUsers)
    .where(eq(authUsers.id, uid));
  const data = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    account: account ?? null,
    profiles: await db.select().from(profiles).where(eq(profiles.uid, uid)),
    projects: await db.select().from(projects).where(eq(projects.userId, uid)),
    logs: await db.select().from(logs).where(eq(logs.userId, uid)),
    styleTemplates: await db
      .select()
      .from(styleTemplates)
      .where(eq(styleTemplates.userId, uid)),
    usageEvents: await db
      .select()
      .from(usageEvents)
      .where(eq(usageEvents.userId, uid)),
    sessions: await db
      .select({
        id: authSessions.id,
        createdAt: authSessions.createdAt,
        expiresAt: authSessions.expiresAt,
      })
      .from(authSessions)
      .where(eq(authSessions.userId, uid)),
    passwordResetRequests: await db
      .select({
        requestedAt: authPasswordResets.requestedAt,
        expiresAt: authPasswordResets.expiresAt,
      })
      .from(authPasswordResets)
      .where(
        account
          ? or(
              eq(authPasswordResets.userId, uid),
              eq(
                authPasswordResets.emailNormalized,
                account.email.trim().toLowerCase(),
              ),
            )
          : eq(authPasswordResets.userId, uid),
      ),
  };
  return data;
}

export async function deleteNeonAccount(db: NeonTransaction, uid: string) {
  const [account] = await db
    .select({ emailNormalized: authUsers.emailNormalized })
    .from(authUsers)
    .where(eq(authUsers.id, uid));
  if (!account) throw new Error("Account not found.");
  await db.delete(styleTemplates).where(eq(styleTemplates.userId, uid));
  await db.delete(logs).where(eq(logs.userId, uid));
  await db.delete(usageEvents).where(eq(usageEvents.userId, uid));
  await db.delete(projects).where(eq(projects.userId, uid));
  await db.delete(profiles).where(eq(profiles.uid, uid));
  await db
    .delete(authPasswordResets)
    .where(
      or(
        eq(authPasswordResets.userId, uid),
        eq(authPasswordResets.emailNormalized, account.emailNormalized),
      ),
    );
  await db.delete(authSessions).where(eq(authSessions.userId, uid));
  await db.delete(authUsers).where(eq(authUsers.id, uid));
}

export const exportAccount = (uid: string) =>
  withNeonUserDb(uid, (db) => exportNeonAccount(db, uid));
export const deleteAccount = (uid: string) =>
  withNeonUserDb(uid, (db) => deleteNeonAccount(db, uid));

// Database-backed limit also applies when Redis is not configured.
export const reserveDeletionAttempt = (uid: string) =>
  withNeonUserDb(uid, async (db) => {
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usageEvents)
      .where(
        and(
          eq(usageEvents.userId, uid),
          eq(usageEvents.action, "account_delete_attempt"),
          gte(usageEvents.createdAt, since),
        ),
      );
    if (count >= 5) return false;
    await db
      .insert(usageEvents)
      .values({
        id: crypto.randomUUID(),
        userId: uid,
        action: "account_delete_attempt",
        metadata: {},
        createdAt: new Date().toISOString(),
      });
    return true;
  });
