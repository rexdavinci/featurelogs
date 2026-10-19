import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { env } from "@/.env";

export type NeonTransaction = Parameters<
  Parameters<ReturnType<typeof drizzle>["transaction"]>[0]
>[0];
let database: Promise<ReturnType<typeof drizzle>> | undefined;

function getDatabase() {
  return (database ??= (async () => {
    if (!env.database.url)
      throw new Error("DATABASE_URL is required for Neon.");
    const pool = new Pool({
      connectionString: env.database.url,
      max: 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
    pool.on("error", () => console.error("Neon connection error."));
    try {
      const {
        rows: [role],
      } = await pool.query(`SELECT r.rolsuper, r.rolbypassrls, r.rolcreaterole,
        EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tableowner = current_user) AS owns_tables
        FROM pg_roles r WHERE r.rolname = current_user`);
      if (
        !role ||
        role.rolsuper ||
        role.rolbypassrls ||
        role.rolcreaterole ||
        role.owns_tables
      )
        throw new Error(
          "DATABASE_URL must use a restricted runtime role. Run db:secure with an admin connection first.",
        );
      return drizzle({ client: pool });
    } catch (error) {
      await pool.end();
      database = undefined;
      throw error;
    }
  })());
}

async function scoped<T>(
  role: "featurelogs_app" | "featurelogs_auth",
  userId: string,
  work: (db: NeonTransaction) => Promise<T>,
) {
  const db = await getDatabase();
  return db.transaction(async (tx) => {
    // Role names are fixed server constants, never input. Context is transaction-local.
    await tx.execute(sql.raw(`SET LOCAL ROLE ${role}`));
    await tx.execute(sql`SELECT set_config('app.user_id', ${userId}, true)`);
    return work(tx);
  });
}

export function withNeonAuthDb<T>(work: (db: NeonTransaction) => Promise<T>) {
  return scoped("featurelogs_auth", "", work);
}

export function withNeonPublicDb<T>(work: (db: NeonTransaction) => Promise<T>) {
  return scoped("featurelogs_app", "", work);
}

export function withNeonUserDb<T>(
  userId: string,
  work: (db: NeonTransaction) => Promise<T>,
) {
  if (!userId) throw new Error("Authenticated user context is required.");
  return scoped("featurelogs_app", userId, async (tx) => {
    // Serialize deletion against in-flight writes. A removed account cannot recreate data.
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
    );
    if (env.auth.provider === "neon") {
      const user = await tx.execute(
        sql`SELECT id FROM public.auth_users WHERE id = ${userId}`,
      );
      if (!user.rows.length) throw new Error("Account is no longer available.");
    }
    return work(tx);
  });
}

// Reset workflows issue independent, atomic SQL statements under the auth-only role.
export function getNeonDb() {
  return {
    execute<T extends Record<string, unknown> = Record<string, unknown>>(
      query: import("drizzle-orm").SQL,
    ) {
      return withNeonAuthDb((db) => db.execute<T>(query));
    },
  };
}
