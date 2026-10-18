import { drizzle } from "drizzle-orm/neon-http";

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not configured. Set DATABASE_URL before using DB_PROVIDER=neon.",
    );
  }

  return databaseUrl;
}

let cachedNeonDb: ReturnType<typeof drizzle> | null = null;

export function getNeonDb() {
  if (!cachedNeonDb) {
    cachedNeonDb = drizzle(getDatabaseUrl());
  }

  return cachedNeonDb;
}
