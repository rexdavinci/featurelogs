"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/utils/session";
import { adminAuth } from "@/utils/firebase-admin";

export async function loginUserAction(idToken: string) {
  try {
    // Verify the ID token to ensure it is valid
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid } = decodedToken;

    if (!uid) {
      return { ok: false, error: "Invalid token claims." };
    }

    const cookieStore = await cookies();

    // Try setting a full Firebase Session Cookie if service account credentials permit,
    // otherwise fallback to storing the ID Token directly in the session cookie.
    try {
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
      cookieStore.set(SESSION_COOKIE, sessionCookie, {
        maxAge: expiresIn / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
    } catch {
      // Fallback: store the ID token directly. It will be verified via verifyIdToken.
      cookieStore.set(SESSION_COOKIE, idToken, {
        maxAge: 60 * 60, // 1 hour (standard ID token lifespan)
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
    }

    // Ensure user profile document exists in Firestore
    // const profileRef = adminDb.collection("profiles").doc(uid);
    // const profileSnap = await profileRef.get();

    // if (!profileSnap.exists) {
    //   await profileRef.set({
    //     userId: uid,
    //     email: email || "",
    //     createdAt: new Date().toISOString(),
    //   });
    // }

    return { ok: true };
  } catch (error: unknown) {
    console.error("Login server action error:", error);
    const message = error instanceof Error ? error.message : "Failed to authenticate session.";
    return { ok: false, error: message };
  }
}

export async function logoutUserAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return { ok: true };
}
