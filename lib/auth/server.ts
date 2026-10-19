import "server-only";
import { env } from "@/.env";
import type {
  AuthAdapter,
  AuthPasswordUser,
  AuthSession,
  AuthSessionUser,
} from "./types";

let adapter: Promise<AuthAdapter> | undefined;
export function getAuthAdapter(): Promise<AuthAdapter> {
  return (adapter ??=
    env.auth.provider === "neon"
      ? import("./neon-auth").then((module) => module.neonAuthAdapter)
      : import("./firebase-auth").then((module) => module.firebaseAuthAdapter));
}

// Firebase verifies existing tokens/cookies; password signup/login is Neon-only.
export const supportsPasswordAuth = env.auth.provider === "neon";
export const loginWithPassword = async (
  ...args: Parameters<AuthAdapter["loginWithPassword"]>
): Promise<AuthPasswordUser> =>
  (await getAuthAdapter()).loginWithPassword(...args);
export const signupWithPassword = async (
  ...args: Parameters<AuthAdapter["signupWithPassword"]>
): Promise<AuthPasswordUser> =>
  (await getAuthAdapter()).signupWithPassword(...args);
export const createAuthSession = async (
  ...args: Parameters<AuthAdapter["createSession"]>
): Promise<AuthSession> => (await getAuthAdapter()).createSession(...args);
export const getAuthSessionUser = async (
  ...args: Parameters<AuthAdapter["getSessionUser"]>
): Promise<AuthSessionUser | null> =>
  (await getAuthAdapter()).getSessionUser(...args);
export const revokeAuthSession = async (
  ...args: Parameters<AuthAdapter["revokeSession"]>
): Promise<void> => (await getAuthAdapter()).revokeSession(...args);

export const requestAuthPasswordReset = async (email: string): Promise<void> =>
  (await getAuthAdapter()).requestPasswordReset(email);
export const resetAuthPassword = async (
  token: string,
  password: string,
): Promise<void> => (await getAuthAdapter()).resetPassword(token, password);
