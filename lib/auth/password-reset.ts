import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { env } from "@/.env";
import { getNeonDb } from "@/lib/db/neon/client";
import { getEmailAdapter } from "@/lib/email/server";
import type { EmailAdapter } from "@/lib/email/types";
import { hashPassword, validateEmail, validatePassword } from "./password";

export const RESET_TTL_MS = 15 * 60 * 1000;
export const RESET_COOLDOWN_MS = 60 * 1000;
export const INVALID_RESET_LINK =
  "This reset link is invalid or has expired. Please request a new one.";

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetService({
  database,
  email: getMailer,
  siteUrl,
  now: clock = Date.now,
}: {
  database: () => Pick<ReturnType<typeof getNeonDb>, "execute">;
  email: () => EmailAdapter;
  siteUrl: string;
  now?: () => number;
}) {
  async function requestPasswordReset(email: string) {
    const normalized = validateEmail(email);
    // Validate delivery configuration before issuing any token.
    const mailer = getMailer();
    const token = randomBytes(32).toString("hex");
    const now = clock();
    const requestedAt = new Date(now).toISOString();
    const expiresAt = new Date(now + RESET_TTL_MS).toISOString();
    const cooldown = new Date(now - RESET_COOLDOWN_MS).toISOString();
    const tokenHash = hashResetToken(token);
    // Unknown addresses take the same database path and receive the same UI result.
    // UPSERT atomically enforces cooldown across workers and replaces old links.
    const result = await database().execute<{ user_id: string | null }>(sql`
    INSERT INTO auth_password_resets (email_normalized, user_id, token_hash, expires_at, requested_at)
    VALUES (${normalized}, (SELECT id FROM auth_users WHERE email_normalized = ${normalized} LIMIT 1),
      ${tokenHash}, ${expiresAt}, ${requestedAt})
    ON CONFLICT (email_normalized) DO UPDATE SET
      user_id = EXCLUDED.user_id, token_hash = EXCLUDED.token_hash,
      expires_at = EXCLUDED.expires_at, requested_at = EXCLUDED.requested_at
    WHERE auth_password_resets.requested_at < ${cooldown}
    RETURNING user_id
  `);
    if (!result.rows[0]?.user_id) return;
    const url = new URL("/reset-password", siteUrl);
    // A fragment keeps the secret out of HTTP access logs and referrer headers.
    url.hash = new URLSearchParams({ token }).toString();
    try {
      await mailer.send({
        to: normalized,
        subject: "Reset your FeatureLogs password",
        text: `Reset your FeatureLogs password using this link:\n\n${url}\n\nThis link expires in 15 minutes and can be used once. If you didn't request this, you can ignore this email.`,
      });
    } catch {
      // Allow an immediate retry after a failed delivery without clearing newer tokens.
      await database().execute(
        sql`DELETE FROM auth_password_resets WHERE token_hash = ${tokenHash}`,
      );
      throw new Error("Password reset email delivery failed.");
    }
  }

  async function resetPassword(token: string, password: string) {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
      throw new Error(INVALID_RESET_LINK);
    validatePassword(password);
    const tokenHash = hashResetToken(token);
    const passwordHash = hashPassword(password);
    const now = new Date(clock()).toISOString();
    // The statement runs in one scoped transaction. DELETE claims the link;
    // concurrent submissions cannot both update the password. Revoke all sessions.
    const result = await database().execute<{ id: string }>(sql`
    WITH consumed AS (
      DELETE FROM auth_password_resets
      WHERE token_hash = ${tokenHash} AND expires_at > ${now} AND user_id IS NOT NULL
      RETURNING user_id
    ), updated AS (
      UPDATE auth_users SET password_hash = ${passwordHash}, updated_at = ${now}
      WHERE id IN (SELECT user_id FROM consumed) RETURNING id
    ), revoked AS (
      DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM updated)
    )
    SELECT id FROM updated
  `);
    if (!result.rows.length) throw new Error(INVALID_RESET_LINK);
  }

  return { requestPasswordReset, resetPassword };
}

export const { requestPasswordReset, resetPassword } =
  createPasswordResetService({
    database: getNeonDb,
    email: getEmailAdapter,
    siteUrl: env.site.url,
  });
