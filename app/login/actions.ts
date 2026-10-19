"use server";

import { env } from "@/.env";
import {
  validatePasswordConfirmation,
  validateEmail,
} from "@/lib/auth/password";
import { cookies, headers } from "next/headers";
import { assertRateLimit } from "@/utils/rate-limit";
import { SESSION_COOKIE } from "@/utils/session";
import { ensureUserProfile } from "@/lib/db/server";
import {
  createAuthSession,
  requestAuthPasswordReset,
  resetAuthPassword,
  loginWithPassword,
  revokeAuthSession,
  signupWithPassword,
  supportsPasswordAuth,
} from "@/lib/auth/server";

export async function loginUserAction(email: string, password: string) {
  if (!supportsPasswordAuth) {
    return { ok: false, error: "Password login is not available." };
  }

  try {
    const user = await loginWithPassword(email, password);
    const session = await createAuthSession(user.userId);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.token, {
      maxAge: session.maxAgeSeconds,
      httpOnly: true,
      secure: env.production,
      path: "/",
      sameSite: "lax",
    });
    await ensureUserProfile(user.userId, user.email);

    return { ok: true };
  } catch (error: unknown) {
    console.error("Login server action error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to authenticate session.";
    return { ok: false, error: message };
  }
}

export async function signupUserAction(
  email: string,
  password: string,
  confirmation: string,
) {
  if (!supportsPasswordAuth) {
    return { ok: false, error: "Password signup is not available." };
  }

  try {
    validatePasswordConfirmation(password, confirmation);
    const user = await signupWithPassword(email, password);
    const session = await createAuthSession(user.userId);
    await ensureUserProfile(user.userId, user.email);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.token, {
      maxAge: session.maxAgeSeconds,
      httpOnly: true,
      secure: env.production,
      path: "/",
      sameSite: "lax",
    });

    return { ok: true };
  } catch (error: unknown) {
    console.error("Signup server action error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create account.";
    return { ok: false, error: message };
  }
}

export async function logoutUserAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await revokeAuthSession(token);
  }
  cookieStore.delete(SESSION_COOKIE);
  return { ok: true };
}

export async function requestPasswordResetAction(email: string) {
  if (!supportsPasswordAuth)
    return {
      ok: false,
      error: "Password reset is not available for this auth provider.",
    };
  try {
    validateEmail(email);
  } catch {
    return { ok: false, error: "Please enter a valid email address." };
  }
  try {
    const requestHeaders = await headers();
    const ip =
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limit = await assertRateLimit("password-reset", ip);
    if (limit.ok) await requestAuthPasswordReset(email);
  } catch {
    // Keep account existence and provider/database errors out of public responses.
    console.error(
      "Password reset request failed. Check email configuration and database migrations.",
    );
  }
  return {
    ok: true,
    message:
      "If an account exists for that email, a reset link will arrive shortly. You can request another link after one minute.",
  };
}

export async function resetPasswordAction(
  token: string,
  password: string,
  confirmation: string,
) {
  if (!supportsPasswordAuth)
    return {
      ok: false,
      error: "Password reset is not available for this auth provider.",
    };
  try {
    validatePasswordConfirmation(password, confirmation);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Please check your password.",
    };
  }
  try {
    await resetAuthPassword(token, password);
    (await cookies()).delete(SESSION_COOKIE);
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "Unable to reset your password. The link may have expired or already been used. Please request a new one.",
    };
  }
}
