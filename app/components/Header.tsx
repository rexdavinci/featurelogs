import Image from "next/image";
import Link from "next/link";
import { formatUsageText } from "@/utils/tiers";

import { CreditCard, CircleHelp, LogOut } from "lucide-react";
import { startTransition } from "react";
import { logout } from "../dashboard/actions";

interface HeaderProps {
  isSubscribed?: boolean;
  usageCount?: number;
}

export const Header = ({ isSubscribed, usageCount }: HeaderProps) => {
  return (
    <header className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image
          src="/feature-logs.svg"
          alt="FeatureLogs Logo"
          width={30}
          height={30}
          style={{ height: "auto" }}
        />
        <div>
          <p className="text-lg font-semibold">FeatureLogs</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Build In Public Engine
          </p>
        </div>
      </div>
      {isSubscribed && usageCount !== undefined && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold text-zinc-700">
            {formatUsageText(isSubscribed, usageCount)}
          </span>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 rounded-full border bg-white/80 px-3 py-1 cursor-pointer text-xs font-semibold text-zinc-700 hover:bg-white/20"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Billing
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-1 rounded-full border bg-white/80 px-3 py-1 cursor-pointer text-xs font-semibold text-zinc-700 hover:bg-white/20"
          >
            <CircleHelp className="h-3.5 w-3.5" />
            FAQ
          </Link>
          <button
            type="button"
            onClick={() => {
              startTransition(async () => {
                await logout();
                window.location.href = "/";
              });
            }}
            className="inline-flex items-center gap-1 rounded-full border bg-white/80 px-3 cursor-pointer py-1 text-xs font-semibold text-zinc-700 hover:bg-white/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};
