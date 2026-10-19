// Run after migrations, using the admin URL only for provisioning. Never print passwords.
import nextEnv from "@next/env";
import { Client } from "pg";
import { randomBytes } from "node:crypto";
import { readFile, writeFile, chmod } from "node:fs/promises";
nextEnv.loadEnvConfig(process.cwd());
const adminUrl =
  process.env.DATABASE_ADMIN_URL?.trim() || process.env.DATABASE_URL;
if (!adminUrl) throw new Error("DATABASE_ADMIN_URL is required.");
const client = new Client({ connectionString: adminUrl });
try {
  await client.connect();
  await client.query("BEGIN");
  const password = randomBytes(48).toString("hex");
  const { rows } = await client.query(
    "SELECT rolname FROM pg_roles WHERE rolname = 'featurelogs_runtime'",
  );
  // Password is hex generated here, never a caller-controlled SQL fragment.
  if (!rows.length)
    await client.query(
      `CREATE ROLE featurelogs_runtime LOGIN PASSWORD '${password}' NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`,
    );
  else
    await client.query(
      `ALTER ROLE featurelogs_runtime WITH LOGIN PASSWORD '${password}' NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`,
    );
  await client.query(
    "GRANT featurelogs_app, featurelogs_auth TO featurelogs_runtime",
  );
  const database = new URL(adminUrl).pathname.slice(1);
  const identifier =
    '"' + decodeURIComponent(database).replaceAll('"', '""') + '"';
  await client.query(
    `GRANT CONNECT ON DATABASE ${identifier} TO featurelogs_runtime`,
  );
  const runtimeUrl = new URL(adminUrl);
  runtimeUrl.username = "featurelogs_runtime";
  runtimeUrl.password = password;
  const file = ".env.local";
  let source = await readFile(file, "utf8").catch((error) => {
    if (error.code === "ENOENT") return "";
    throw error;
  });
  function set(name, value) {
    const line = `${name}=${JSON.stringify(value)}`;
    const pattern = new RegExp(`^\\s*(?:export\\s+)?${name}\\s*=.*$`, "gm");
    source = pattern.test(source)
      ? source.replace(pattern, () => line)
      : source.trimEnd() + "\n" + line + "\n";
  }
  set("DATABASE_ADMIN_URL", adminUrl);
  set("DATABASE_URL", runtimeUrl.toString());
  await writeFile(file, source, { mode: 0o600 });
  await chmod(file, 0o600);
  await client.query("COMMIT");
  console.log(
    "Restricted runtime role provisioned; local connection settings updated. Restart the app. Keep DATABASE_ADMIN_URL in migration environments only when deploying.",
  );
} catch {
  await client.query("ROLLBACK").catch(() => {});
  console.error(
    "Database security provisioning failed; no credentials were printed. Check admin role permissions and migrations.",
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
