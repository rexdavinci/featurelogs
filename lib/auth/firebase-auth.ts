import "server-only";
import type { AuthAdapter } from "./types";
const unsupportedPasswordAuthError =
  "Password authentication is not configured for this auth provider.";

export const firebaseAuthAdapter: AuthAdapter = {
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
