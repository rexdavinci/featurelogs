import "server-only";
import { env } from "@/.env";

// Do not present a partial wipe as a complete account deletion for mixed deployments.
export const supportsAccountManagement =
  env.database.provider === "neon" && env.auth.provider === "neon";
export async function getAccountService() {
  if (!supportsAccountManagement)
    throw new Error(
      "Account export and deletion currently require Neon storage and authentication.",
    );
  return import("./neon");
}
