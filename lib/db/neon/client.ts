import "server-only";
import { env } from "@/.env";
import { drizzle } from "drizzle-orm/neon-http";

let cachedNeonDb: ReturnType<typeof drizzle> | null = null;

export function getNeonDb() {
  if (!cachedNeonDb) {
    if (!env.database.url)
      throw new Error(
        "DATABASE_URL is required for Neon database or authentication.",
      );
    cachedNeonDb = drizzle(env.database.url);
  }

  return cachedNeonDb;
}
