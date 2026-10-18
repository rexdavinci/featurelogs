"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/utils/session";
import { ensureUserProfile } from "@/lib/db/server";
import {
  createAuthSession,
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
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    await ensureUserProfile(user.userId, user.email);

    return { ok: true };
  } catch (error: unknown) {
    console.error("Login server action error:", error);
    const message = error instanceof Error ? error.message : "Failed to authenticate session.";
    return { ok: false, error: message };
  }
}

export async function signupUserAction(email: string, password: string) {
  if (!supportsPasswordAuth) {
    return { ok: false, error: "Password signup is not available." };
  }

  try {
    const user = await signupWithPassword(email, password);
    const session = await createAuthSession(user.userId);
    await ensureUserProfile(user.userId, user.email);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.token, {
      maxAge: session.maxAgeSeconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
