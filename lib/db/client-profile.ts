"use client";

import { FirebaseError } from "firebase/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import type { UserProfile } from "@/lib/types";

export interface ClientUserProfileAdapter {
  createUserProfile(newUser: UserProfile): Promise<void>;
  getUserProfile(uid: string): Promise<UserProfile | null>;
}

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

const firestoreClientUserProfileAdapter: ClientUserProfileAdapter = {
  async createUserProfile(newUser) {
    try {
      const profileRef = doc(db, "profiles", newUser.uid);
      await setDoc(profileRef, {
        ...newUser,
      });
    } catch (error) {
      throw toFirestoreError("createUserProfile", error);
    }
  },
  async getUserProfile(uid) {
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
  },
};

function resolveClientDbProvider() {
  return (process.env.NEXT_PUBLIC_DB_PROVIDER ?? "firestore")
    .trim()
    .toLowerCase();
}

function createClientUserProfileAdapter(): ClientUserProfileAdapter {
  const provider = resolveClientDbProvider();

  if (provider === "firestore") {
    return firestoreClientUserProfileAdapter;
  }

  if (provider === "neon") {
    throw new Error(
      "NEXT_PUBLIC_DB_PROVIDER=neon is not implemented yet. Keep NEXT_PUBLIC_DB_PROVIDER=firestore until a Neon client profile adapter is added.",
    );
  }

  throw new Error(
    `Unsupported NEXT_PUBLIC_DB_PROVIDER "${provider}". Supported providers: firestore.`,
  );
}

export const clientUserProfileDb = createClientUserProfileAdapter();

export const createUserProfile = (
  ...args: Parameters<ClientUserProfileAdapter["createUserProfile"]>
) => clientUserProfileDb.createUserProfile(...args);

export const getUserProfile = (
  ...args: Parameters<ClientUserProfileAdapter["getUserProfile"]>
) => clientUserProfileDb.getUserProfile(...args);
