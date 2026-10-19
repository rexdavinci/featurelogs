import type { Metadata } from "next";
import { Header } from "../components/Header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product updates for every kind of team",
  description:
    "Explore ways to communicate launches, improvements, and everyday progress with FeatureLogs.",
  alternates: {
    canonical: "/use-cases",
  },
};

const USE_CASES = [
  {
    href: "/dashboard",
    title: "Products & collections",
    summary:
      "Introduce a new product, explain what makes it useful, and prepare social and email drafts for launch day.",
  },
  {
    href: "/dashboard",
    title: "Courses & resources",
    summary:
      "Share a new course, guide, or workshop with the people it was made for.",
  },
  {
    href: "/dashboard",
    title: "Communities & services",
    summary:
      "Keep members and customers close to new offerings, events, and improvements.",
  },
  {
    href: "/use-cases/ai-changelog-generator",
    title: "AI Changelog Generator",
    summary:
      "Create public changelogs from raw engineering notes and release updates.",
  },
  {
    href: "/use-cases/release-notes-generator-for-startups",
    title: "Release Notes Generator for Startups",
    summary:
      "Turn weekly shipped work into clear customer-facing release notes in minutes.",
  },
  {
    href: "/use-cases/social-content-from-git-commits",
    title: "Social Content from Git Commits",
    summary:
      "Convert commits into X threads, LinkedIn posts, and email updates automatically.",
  },
];

export default function UseCasesPage() {
  return (
    <main className="content-shell">
      <div className="space-y-8">
        <Header />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-(--text-muted)">
          FeatureLogs Use Cases
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-foreground">
          A small update. So many ways to share it.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-(--text-secondary)">
          Launching an app, teaching a course, or growing a brand? Turn what’s
          new into a reason for people to come back.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {USE_CASES.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-2xl border bg-(--surface) p-4 hover:bg-(--surface-muted)"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {item.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-(--text-muted)">
                {item.summary}
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-sm text-(--text-muted)">
          Looking for setup help? Read the{" "}
          <Link
            href="/faq"
            className="font-semibold text-(--accent-strong) underline underline-offset-2"
          >
            FAQ
          </Link>{" "}
          or go back to the{" "}
          <Link
            href="/"
            className="font-semibold text-(--accent-strong) underline underline-offset-2"
          >
            homepage
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
