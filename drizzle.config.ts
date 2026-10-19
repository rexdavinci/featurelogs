import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

const databaseUrl =
  process.env.DATABASE_ADMIN_URL?.trim() || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to run drizzle-kit commands for Neon.",
  );
}

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/neon/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  migrations: {
    schema: "public",
    table: "__drizzle_migrations",
  },
});
