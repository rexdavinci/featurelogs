/** Preserve pg's existing certificate verification for legacy SSL mode aliases. */
export function normalizePostgresUrl(connectionString) {
  const url = new URL(connectionString);
  const mode = url.searchParams.get("sslmode");
  if (
    url.searchParams.get("uselibpqcompat") !== "true" &&
    ["prefer", "require", "verify-ca"].includes(mode)
  ) {
    url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  }
  return connectionString;
}
