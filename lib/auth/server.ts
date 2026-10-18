import type {
  AuthAdapter,
  AuthPasswordUser,
  AuthSession,
  AuthSessionUser,
} from "@/lib/auth/types";
import { neonAuthAdapter } from "@/lib/auth/neon-auth";

function resolveAuthProvider() {
  return (process.env.AUTH_PROVIDER ?? "neon").trim().toLowerCase();
}

const unsupportedPasswordAuthError =
  "Password authentication is not configured for this auth provider.";

const firebaseAuthAdapter: AuthAdapter = {
  supportsPasswordAuth: false,
  async loginWithPassword() {
    throw new Error(unsupportedPasswordAuthError);
  },
  async signupWithPassword() {
    throw new Error(unsupportedPasswordAuthError);
  },
  async createSession() {
    throw new Error(
      "Session creation is not implemented for firebase auth in this adapter.",
    );
  },
  async getSessionUser(sessionToken) {
    const { adminAuth } = await import("@/utils/firebase-admin");
    try {
      const decoded = await adminAuth.verifyIdToken(sessionToken);
      return {
        uid: decoded.uid,
        email: decoded.email,
      };
    } catch {
      try {
        const decoded = await adminAuth.verifySessionCookie(sessionToken, true);
        return {
          uid: decoded.uid,
          email: decoded.email,
        };
      } catch {
        return null;
      }
    }
  },
  async revokeSession() {
    // Stateless cookie verification mode; no server-side session to revoke.
  },
};

function createAuthAdapter(): AuthAdapter {
  const provider = resolveAuthProvider();

  if (provider === "neon") {
    return neonAuthAdapter;
  }

  if (provider === "firebase") {
    return firebaseAuthAdapter;
  }

  throw new Error(
    `Unsupported AUTH_PROVIDER "${provider}". Supported providers: neon, firebase.`,
  );
}

export const authAdapter = createAuthAdapter();

export const supportsPasswordAuth = authAdapter.supportsPasswordAuth;

export const loginWithPassword = (
  ...args: Parameters<AuthAdapter["loginWithPassword"]>
): Promise<AuthPasswordUser> => authAdapter.loginWithPassword(...args);

export const signupWithPassword = (
  ...args: Parameters<AuthAdapter["signupWithPassword"]>
): Promise<AuthPasswordUser> => authAdapter.signupWithPassword(...args);

export const createAuthSession = (
  ...args: Parameters<AuthAdapter["createSession"]>
): Promise<AuthSession> => authAdapter.createSession(...args);

export const getAuthSessionUser = (
  ...args: Parameters<AuthAdapter["getSessionUser"]>
): Promise<AuthSessionUser | null> => authAdapter.getSessionUser(...args);

export const revokeAuthSession = (
  ...args: Parameters<AuthAdapter["revokeSession"]>
): Promise<void> => authAdapter.revokeSession(...args);
