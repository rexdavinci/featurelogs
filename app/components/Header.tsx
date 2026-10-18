"use client";

import { Github } from "./SocialIcons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { FAIR_USE_LIMITS } from "@/utils/tiers";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { SignOutButton } from "./SignOutButton";

interface HeaderProps {
  usageCount?: number;
  userEmail?: string | null;
}

export function Header({ usageCount, userEmail }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const items = userEmail
    ? [
        { href: "/dashboard", label: "Workspace" },
        { href: "/ranking", label: "Community" },
        { href: "/use-cases", label: "Use cases" },
      ]
    : [
        { href: "/#how-it-works", label: "How it works" },
        { href: "/use-cases", label: "Use cases" },
        { href: "/#roadmap", label: "Roadmap" },
      ];

  return (
    <header className="site-header">
      <div className="header-main">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="desktop-nav header-actions">
          {usageCount !== undefined && (
            <span className="credit-pill">
              {Math.max(FAIR_USE_LIMITS.periodCap - usageCount, 0)} credits left
            </span>
          )}
          <a
            href="https://github.com/rexdavinci/featurelogs"
            target="_blank"
            rel="noreferrer"
            className="github-link"
          >
            <Github size={17} /> <span>GitHub</span>
            <ArrowUpRight size={13} />
          </a>
          {userEmail ? (
            <SignOutButton />
          ) : (
            <>
              <Link href="/login" className="login-link">
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className="button button-dark button-small"
              >
                Get started <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>
        <div className="header-utilities">
          <ThemeToggle />
          <button
            className="mobile-toggle"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://github.com/rexdavinci/featurelogs"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
          {userEmail ? (
            <SignOutButton />
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className="button button-dark"
                onClick={() => setMobileOpen(false)}
              >
                Get started <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
