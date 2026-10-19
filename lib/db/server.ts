import "server-only";
import { env } from "@/.env";
import type { ServerDatabaseAdapter } from "./types";
export type { ServerDatabaseAdapter } from "./types";

let adapter: Promise<ServerDatabaseAdapter> | undefined;

/** Lazy imports keep Firebase credentials and SDK initialization out of Neon deployments. */
export function getServerDatabaseAdapter(): Promise<ServerDatabaseAdapter> {
  return (adapter ??=
    env.database.provider === "neon"
      ? import("./neon/server-adapter").then(
          (module) => module.neonServerDatabaseAdapter,
        )
      : import("./firestore/server-adapter").then(
          (module) => module.firestoreServerDatabaseAdapter,
        ));
}

export const countUsageSince = async (
  ...args: Parameters<ServerDatabaseAdapter["countUsageSince"]>
) => (await getServerDatabaseAdapter()).countUsageSince(...args);
export const consumeUsage = async (
  ...args: Parameters<ServerDatabaseAdapter["consumeUsage"]>
) => (await getServerDatabaseAdapter()).consumeUsage(...args);
export const loadPublicRanking = async (
  ...args: Parameters<ServerDatabaseAdapter["loadPublicRanking"]>
) => (await getServerDatabaseAdapter()).loadPublicRanking(...args);
export const countProjects = async (
  ...args: Parameters<ServerDatabaseAdapter["countProjects"]>
) => (await getServerDatabaseAdapter()).countProjects(...args);
export const ensureProject = async (
  ...args: Parameters<ServerDatabaseAdapter["ensureProject"]>
) => (await getServerDatabaseAdapter()).ensureProject(...args);
export const findProjectByName = async (
  ...args: Parameters<ServerDatabaseAdapter["findProjectByName"]>
) => (await getServerDatabaseAdapter()).findProjectByName(...args);
export const loadDashboardSnapshot = async (
  ...args: Parameters<ServerDatabaseAdapter["loadDashboardSnapshot"]>
) => (await getServerDatabaseAdapter()).loadDashboardSnapshot(...args);
export const loadProjectById = async (
  ...args: Parameters<ServerDatabaseAdapter["loadProjectById"]>
) => (await getServerDatabaseAdapter()).loadProjectById(...args);
export const loadTemplates = async (
  ...args: Parameters<ServerDatabaseAdapter["loadTemplates"]>
) => (await getServerDatabaseAdapter()).loadTemplates(...args);
export const saveTemplates = async (
  ...args: Parameters<ServerDatabaseAdapter["saveTemplates"]>
) => (await getServerDatabaseAdapter()).saveTemplates(...args);
export const loadLogsSince = async (
  ...args: Parameters<ServerDatabaseAdapter["loadLogsSince"]>
) => (await getServerDatabaseAdapter()).loadLogsSince(...args);
export const saveLog = async (
  ...args: Parameters<ServerDatabaseAdapter["saveLog"]>
) => (await getServerDatabaseAdapter()).saveLog(...args);
export const createUserProfile = async (
  ...args: Parameters<ServerDatabaseAdapter["createUserProfile"]>
) => (await getServerDatabaseAdapter()).createUserProfile(...args);
export const getUserProfile = async (
  ...args: Parameters<ServerDatabaseAdapter["getUserProfile"]>
) => (await getServerDatabaseAdapter()).getUserProfile(...args);
export const ensureUserProfile = async (
  ...args: Parameters<ServerDatabaseAdapter["ensureUserProfile"]>
) => (await getServerDatabaseAdapter()).ensureUserProfile(...args);
