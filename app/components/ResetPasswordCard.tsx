"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";
import { resetPasswordAction } from "@/app/login/actions";
import { PasswordField } from "./PasswordField";

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
function readToken() {
  const value =
    new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
  return /^[a-f0-9]{64}$/.test(value) ? value : "";
}

export function ResetPasswordCard() {
  const token = useSyncExternalStore(subscribeToHash, readToken, () => null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <section className="auth-card animate-rise w-full max-w-md">
      <h1 className="text-xl font-semibold">
        {success ? "Password updated" : "Choose a new password"}
      </h1>
      <p className="mt-2 mb-6 text-sm text-(--text-muted)">
        {success
          ? "Your old sessions have been signed out. Sign in with your new password."
          : "Use at least 6 characters. Your reset link expires after 15 minutes."}
      </p>
      {token === null ? (
        <p role="status">Loading your reset link…</p>
      ) : success ? (
        <Link href="/login" className="text-link">
          Sign in
        </Link>
      ) : !token ? (
        <div role="alert" className="space-y-4">
          <p>This reset link is missing or invalid.</p>
          <Link href="/login?mode=forgot" className="text-link">
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            if (password !== confirmation) {
              setError("Passwords do not match.");
              return;
            }
            startTransition(async () => {
              try {
                const result = await resetPasswordAction(
                  token,
                  password,
                  confirmation,
                );
                if (!result.ok)
                  setError(result.error || "Unable to reset your password.");
                else {
                  setSuccess(true);
                  setPassword("");
                  setConfirmation("");
                  window.history.replaceState(
                    null,
                    "",
                    window.location.pathname,
                  );
                }
              } catch {
                setError("Unable to reset your password. Please try again.");
              }
            });
          }}
        >
          {error && (
            <p role="alert" className="text-sm text-(--danger)">
              {error}
            </p>
          )}
          <PasswordField
            id="reset-password"
            label="New password"
            value={password}
            onChange={setPassword}
            disabled={pending}
          />
          <PasswordField
            id="reset-confirm-password"
            label="Confirm password"
            value={confirmation}
            onChange={setConfirmation}
            disabled={pending}
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-(--accent) px-4 py-3 text-sm font-semibold text-(--on-accent) hover:bg-(--accent-strong) disabled:opacity-70 cursor-pointer"
          >
            {pending ? "Updating password…" : "Reset password"}
          </button>
          <Link href="/login?mode=forgot" className="text-link">
            Request a new reset link
          </Link>
        </form>
      )}
    </section>
  );
}
