import Link from "next/link";
import { formatUsageText } from "@/utils/tiers";
import { BookOpen, CircleHelp, LayoutDashboard, Scale, Shield, Trophy } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

interface HeaderProps {
  usageCount?: number;
  userEmail?: string | null;
}

export const Header = ({ usageCount, userEmail }: HeaderProps) => {
  return (
    <header className="rounded-3xl border border-white/70 bg-white/75 px-4 py-4 shadow-[0_12px_40px_rgba(44,30,11,0.08)] backdrop-blur sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/feature-logs.svg" alt="FeatureLogs Logo" className="h-8 w-8" />
          <div>
            <p className="text-lg font-semibold text-foreground">FeatureLogs</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Open-source release
            </p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-700">
          <Link href="/dashboard" className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 transition hover:bg-zinc-50">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <Link href="/ranking" className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 transition hover:bg-zinc-50">
            <Trophy className="h-3.5 w-3.5 text-amber-600" />
            Project Ranking
          </Link>
          <Link href="/use-cases" className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 transition hover:bg-zinc-50">
            <BookOpen className="h-3.5 w-3.5" />
            Use Cases
          </Link>
          <Link href="/faq" className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 transition hover:bg-zinc-50">
            <CircleHelp className="h-3.5 w-3.5" />
            FAQ
          </Link>
          <Link href="/terms" className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 transition hover:bg-zinc-50">
            <Scale className="h-3.5 w-3.5" />
            Terms
          </Link>
          <Link href="/privacy" className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 transition hover:bg-zinc-50">
            <Shield className="h-3.5 w-3.5" />
            Privacy
          </Link>
          {usageCount !== undefined ? (
            <span className="inline-flex items-center rounded-full border bg-(--surface-muted) px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-(--accent-strong)">
              {formatUsageText(usageCount)}
            </span>
          ) : null}
          {userEmail ? (
            <div className="flex items-center gap-2 border-l pl-2 ml-1">
              <span className="text-zinc-500 font-normal max-w-[120px] truncate sm:max-w-none">{userEmail}</span>
              <SignOutButton />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
