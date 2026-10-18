import { Header } from "../../components/Header";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Changelog Generator",
  description:
    "Generate polished public changelogs from raw feature notes, commits, and bug-fix summaries.",
  alternates: {
    canonical: "/use-cases/ai-changelog-generator",
  },
};

export default function AIChangelogGeneratorPage() {
  return (
    <main className="content-shell">
      <Header />
      <div className="article-content">
        <Link href="/use-cases" className="text-link mb-6 text-(--accent)">← All use cases</Link>
        <h1 className="text-4xl font-semibold text-foreground">AI Changelog Generator</h1>
        <p className="mt-3 text-sm leading-7 text-(--text-secondary)">
          FeatureLogs helps product teams create clean, customer-facing changelog
          entries from rough internal notes. Paste updates once and publish a
          consistent changelog every release cycle.
        </p>

        <h2 className="mt-6 text-2xl font-semibold">Why teams use this workflow</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-(--text-secondary)">
          <li>Removes manual rewriting for every release.</li>
          <li>Keeps tone and structure consistent across updates.</li>
          <li>Lets founders ship updates faster and stay visible publicly.</li>
        </ul>

        <div className="mt-6 rounded-2xl border bg-(--surface) p-4">
          <p className="text-sm text-(--text-secondary)">
            Explore related pages: {" "}
            <Link href="/use-cases/release-notes-generator-for-startups" className="font-semibold text-(--accent-strong) underline underline-offset-2">
              release notes generator for startups
            </Link>
            , {" "}
            <Link href="/use-cases/social-content-from-git-commits" className="font-semibold text-(--accent-strong) underline underline-offset-2">
              social content from git commits
            </Link>
            , and the {" "}
            <Link href="/faq" className="font-semibold text-(--accent-strong) underline underline-offset-2">
              FeatureLogs FAQ
            </Link>
            .
          </p>
        </div>
        <Link href="/login?mode=signup" className="button button-accent mt-8">Create your first kit →</Link>
      </div>
    </main>
  );
}
