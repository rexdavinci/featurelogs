"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginUserAction, signupUserAction } from "@/app/login/actions";
import { KeyRound, Mail, Loader2, AlertCircle } from "lucide-react";

export function AuthCard({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const res =
          mode === "login"
            ? await loginUserAction(email, password)
            : await signupUserAction(email, password);

        if (!res.ok) {
          setError(res.error || "Failed to establish server session.");
          return;
        }

        setSuccessMsg(
          mode === "login"
            ? "Signed in successfully!"
            : "Account created successfully!",
        );

        // Refresh page to update Server Component state (Header and page layouts)
        router.refresh();
        // Redirect to dashboard
        router.push("/dashboard");
      } catch (err: unknown) {
        console.error(err);
        setError("An authentication error occurred.");
      }
    });
  };

  return (
    <div className="auth-card animate-rise">
      <div className="mb-5 space-y-1">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          {mode === "login" ? <>Welcome back</> : <>Start sharing your progress</>}
        </h2>
        <p className="text-xs text-(--text-muted)">
          {mode === "login"
            ? "Your projects and drafts are right where you left them."
            : "Create your free account. Your first kit is next."}
        </p>
        <p className="inline-flex rounded-full border border-(--border) bg-(--surface-muted) px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--hope)">
          Free credits reset every 24h
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl bg-(--error-surface) border border-(--error-border) p-3 text-xs text-(--danger)">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {successMsg && (
          <div role="status" className="flex items-start gap-2 rounded-xl bg-(--success-surface) border border-(--success-border) p-3 text-xs text-(--hope) animate-pulse">
            <p>{successMsg}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="block text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
            <input
              id="auth-email"
              name="email"
              autoComplete="email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isPending}
              className="w-full rounded-xl border border-(--border) bg-(--surface) pl-10 pr-3 py-2.5 text-sm outline-none focus:border-(--accent) focus:bg-(--surface) transition disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="auth-password" className="block text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
            Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
            <input
              id="auth-password"
              name="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={6}
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isPending}
              className="w-full rounded-xl border border-(--border) bg-(--surface) pl-10 pr-3 py-2.5 text-sm outline-none focus:border-(--accent) focus:bg-(--surface) transition disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-(--accent) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--accent-strong) disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-4 border-t pt-4 text-center">
        <p className="text-xs text-(--text-muted)">
          {mode === "login"
            ? "New to FeatureLogs? "
            : "Already have an account? "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setSuccessMsg("");
            }}
            className="font-semibold text-(--accent) hover:underline cursor-pointer"
          >
            {mode === "login" ? "Create an account" : "Sign in instead"}
          </button>
        </p>
      </div>
    </div>
  );
}
