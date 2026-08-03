import { FirebaseError } from "firebase/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import type { UserProfile } from "@/lib/types";

function toFirestoreError(operation: string, error: unknown): Error {
  if (error instanceof FirebaseError) {
    return new Error(
      `Firestore ${operation} failed (${error.code}): ${error.message}`,
    );
  }

  if (error instanceof Error) {
    return new Error(`Firestore ${operation} failed: ${error.message}`);
  }

  return new Error(`Firestore ${operation} failed.`);
}

export async function createUserProfile(newUser: UserProfile) {
  try {
    const profileRef = doc(db, "profiles", newUser.uid);
    await setDoc(profileRef, {
      ...newUser,
    });
  } catch (error) {
    throw toFirestoreError("createUserProfile", error);
  }
}

export async function getUserProfile(uid: string) {
  try {
    const profileRef = doc(db, "profiles", uid);
    const snapshot = await getDoc(profileRef);

    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }

    return null;
  } catch (error) {
    throw toFirestoreError("getUserProfile", error);
  }
}
