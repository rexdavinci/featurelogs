"use server";

import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE } from "@/utils/session";
import { getAccountService } from "@/lib/account/server";
import { loginWithPassword } from "@/lib/auth/server";
import { assertRateLimit } from "@/utils/rate-limit";

export async function deleteAccountAction(
  password: string,
  confirmation: string,
) {
  const user = await getSessionUser();
  if (!user?.email)
    return {
      ok: false,
      error: "Please sign in again before deleting your account.",
    };
  if (confirmation !== "DELETE")
    return { ok: false, error: "Type DELETE to confirm." };
  const limit = await assertRateLimit("account-delete", user.uid);
  if (!limit.ok) return { ok: false, error: limit.error };
  let service: Awaited<ReturnType<typeof getAccountService>>;
  try {
    service = await getAccountService();
    if (!(await service.reserveDeletionAttempt(user.uid)))
      return {
        ok: false,
        error: "Too many attempts. Please try again in 15 minutes.",
      };
  } catch {
    return { ok: false, error: "Account deletion is temporarily unavailable." };
  }
  try {
    const verified = await loginWithPassword(user.email, password);
    if (verified.userId !== user.uid) throw new Error("Account mismatch.");
  } catch {
    return {
      ok: false,
      error: "Your password is incorrect. Please try again.",
    };
  }
  try {
    await service.deleteAccount(user.uid);
    (await cookies()).delete(SESSION_COOKIE);
    return { ok: true };
  } catch {
    console.error("Account deletion failed.");
    return {
      ok: false,
      error: "Unable to delete your account. Please try again.",
    };
  }
}
