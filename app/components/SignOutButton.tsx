"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logoutUserAction } from "@/app/login/actions";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await logoutUserAction();
        router.refresh();
        router.push("/");
      } catch (error) {
        console.error("Sign out failed:", error);
      }
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-(--error-border) bg-(--error-surface)/50 px-3 py-1.5 text-xs font-semibold text-(--danger) transition hover:bg-(--error-surface) disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" />
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
