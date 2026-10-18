import { cookies } from "next/headers";
import { getAuthSessionUser, revokeAuthSession } from "@/lib/auth/server";

export const SESSION_COOKIE = "featurelogs_session";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return await getAuthSessionUser(token);
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await revokeAuthSession(token);
  }
  cookieStore.delete(SESSION_COOKIE);
}

// Keep this for any legacy code, but let it return the authenticated userId if present, otherwise fallback
export async function getVisitorSessionId() {
  const user = await getSessionUser();
  if (user) {
    return user.uid;
  }

  const cookieStore = await cookies();
  const existing = cookieStore.get("featurelogs_session")?.value;
  if (existing && !existing.includes(".")) { // basic check that it's not a JWT
    return existing;
  }

  return "";
}
