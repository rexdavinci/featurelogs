"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FAIR_USE_LIMITS, formatUsageText } from "@/utils/tiers";
import {
  BookOpen,
  CircleHelp,
  LayoutDashboard,
  Menu,
  Scale,
  Shield,
  Trophy,
  X,
} from "lucide-react";
import { SignOutButton } from "./SignOutButton";

interface HeaderProps {
  usageCount?: number;
  userEmail?: string | null;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/use-cases", label: "Use Cases", icon: BookOpen },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/terms", label: "Terms", icon: Scale },
  { href: "/privacy", label: "Privacy", icon: Shield },
];

function CreditBadge({ usageCount }: { usageCount?: number }) {
  if (usageCount === undefined) return null;

  const remaining = Math.max(FAIR_USE_LIMITS.periodCap - usageCount, 0);

  return (
    <div className="inline-flex min-w-[160px] flex-col rounded-xl border border-indigo-200/70 bg-indigo-50/80 px-3 py-2 text-[11px]">
      <span className="font-mono uppercase tracking-[0.16em] text-indigo-700">
        {remaining} credits left
      </span>
      <span className="text-[10px] text-indigo-600/90">
        {formatUsageText(usageCount)}
      </span>
    </div>
  );
}

export const Header = ({ usageCount, userEmail }: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-3 z-20 rounded-3xl border border-white/70 bg-white/85 px-4 py-4 shadow-[0_14px_45px_rgba(57,74,126,0.14)] backdrop-blur sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/feature-logs.svg"
            alt="FeatureLogs Logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl border border-indigo-100 bg-white p-1 shadow-sm"
          />
          <div>
            <p className="text-lg font-semibold text-foreground">FeatureLogs</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Ship in public
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2 text-zinc-700 lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="hidden items-center gap-2 lg:flex">
          <CreditBadge usageCount={usageCount} />
          {userEmail ? (
            <div className="ml-1 flex items-center gap-2 border-l pl-2">
              <span className="max-w-[180px] truncate text-sm text-zinc-500">
                {userEmail}
              </span>
              <SignOutButton />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 hidden flex-wrap items-center gap-2 text-xs font-semibold text-zinc-700 lg:flex">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 transition hover:bg-zinc-50"
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {mobileOpen ? (
        <div className="mt-4 space-y-3 rounded-2xl border border-zinc-200/80 bg-white/90 p-3 lg:hidden">
          <CreditBadge usageCount={usageCount} />
          <div className="grid gap-2 sm:grid-cols-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-zinc-700"
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          {userEmail ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border bg-zinc-50 px-3 py-2">
              <span className="max-w-[180px] truncate text-sm text-zinc-500">
                {userEmail}
              </span>
              <SignOutButton />
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
};
