"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserCredential } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as authSignOut,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/utils/firebase";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  // isMock: boolean;
  loginWithEmail: (email: string, password: string) => Promise<UserCredential | null>;
  signupWithEmail: (email: string, password: string) => Promise<UserCredential | null>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const generateUser = (email: string, uid: string): UserProfile => {
  return {
    uid,
    email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: [],
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        try {
          if (fbUser) {
            setUser(generateUser(fbUser.email || "", fbUser.uid));
          } else {
            setUser(null);
          }
        } catch (e) {
          console.error("Auth change error:", e);
        } finally {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    if (isFirebaseConfigured) {
      try {
        return await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error("Login error:", error);
      }
    }
    return null;
  };

  const signupWithEmail = async (email: string, password: string) => {
    if (isFirebaseConfigured) {
      try {
        // Create firebase auth user
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        setUser(generateUser(email, credential.user.uid));
        return credential;
      } catch (error) {
        console.error("Signup error:", error);
      }
    }
    return null;
  };

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured) {
      const credential = await signInWithPopup(auth, googleProvider);
      setUser(generateUser(credential.user.email || "", credential.user.uid));
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await authSignOut(auth);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
