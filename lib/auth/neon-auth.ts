import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { getNeonDb } from "@/lib/db/neon/client";
import { authSessions, authUsers } from "@/lib/db/neon/schema";
import type { AuthAdapter, AuthSession, AuthSessionUser } from "@/lib/auth/types";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 5;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateCredentials(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error("Please enter a valid email address.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${digest}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, digest] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !digest) {
    return false;
  }

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, "hex");
  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function registerWithNeonAuth(email: string, password: string) {
  validateCredentials(email, password);
  const neonDb = getNeonDb();
  const normalized = normalizeEmail(email);

  const existing = await neonDb
    .select({ id: authUsers.id })
    .from(authUsers)
    .where(eq(authUsers.emailNormalized, normalized))
    .limit(1);

  if (existing[0]) {
    throw new Error("This email is already registered.");
  }

  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  await neonDb.insert(authUsers).values({
    id: userId,
    email: email.trim(),
    emailNormalized: normalized,
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
  });

  return { userId, email: email.trim() };
}

async function loginWithNeonAuth(email: string, password: string) {
  validateCredentials(email, password);
  const neonDb = getNeonDb();
  const normalized = normalizeEmail(email);

  const rows = await neonDb
    .select()
    .from(authUsers)
    .where(eq(authUsers.emailNormalized, normalized))
    .limit(1);

  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password.");
  }

  return { userId: user.id, email: user.email };
}

async function createNeonAuthSession(userId: string): Promise<AuthSession> {
  const neonDb = getNeonDb();
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString();

  await neonDb.insert(authSessions).values({
    id: crypto.randomUUID(),
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
    createdAt: new Date(now).toISOString(),
  });

  return {
    token,
    expiresAt,
    maxAgeSeconds: Math.floor(SESSION_TTL_MS / 1000),
  };
}

async function getNeonAuthSessionUser(
  sessionToken: string,
): Promise<AuthSessionUser | null> {
  const neonDb = getNeonDb();
  const tokenHash = hashSessionToken(sessionToken);
  const nowIso = new Date().toISOString();

  const rows = await neonDb
    .select({
      userId: authUsers.id,
      email: authUsers.email,
    })
    .from(authSessions)
    .innerJoin(authUsers, eq(authUsers.id, authSessions.userId))
    .where(
      and(
        eq(authSessions.tokenHash, tokenHash),
        gt(authSessions.expiresAt, nowIso),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    uid: row.userId,
    email: row.email,
  };
}

async function deleteNeonAuthSession(sessionToken: string) {
  const neonDb = getNeonDb();
  await neonDb
    .delete(authSessions)
    .where(eq(authSessions.tokenHash, hashSessionToken(sessionToken)));
}

export const neonAuthAdapter: AuthAdapter = {
  supportsPasswordAuth: true,
  async loginWithPassword(email, password) {
    return loginWithNeonAuth(email, password);
  },
  async signupWithPassword(email, password) {
    return registerWithNeonAuth(email, password);
  },
  async createSession(userId) {
    return createNeonAuthSession(userId);
  },
  async getSessionUser(sessionToken) {
    return getNeonAuthSessionUser(sessionToken);
  },
  async revokeSession(sessionToken) {
    await deleteNeonAuthSession(sessionToken);
  },
};
