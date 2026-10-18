import { Header } from "../../components/Header";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Generate Social Content from Git Commits",
  description:
    "Turn git commits and engineering updates into X threads, LinkedIn posts, and newsletters with consistent messaging.",
  alternates: {
    canonical: "/use-cases/social-content-from-git-commits",
  },
};

export default function SocialContentFromGitCommitsPage() {
  return (
    <main className="content-shell">
      <Header />
      <div className="article-content">
        <Link href="/use-cases" className="text-link mb-6 text-(--accent)">← All use cases</Link>
        <h1 className="text-4xl font-semibold text-foreground">
          Generate Social Content from Git Commits
        </h1>
        <p className="mt-3 text-sm leading-7 text-(--text-secondary)">
          FeatureLogs converts raw development activity into audience-ready
          social content. Teams can build in public consistently without
          manually rewriting updates for every platform.
        </p>

        <h2 className="mt-6 text-2xl font-semibold">Outputs included</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-(--text-secondary)">
          <li>X/Twitter thread drafts from change summaries.</li>
          <li>LinkedIn post drafts for product storytelling.</li>
          <li>Email newsletter snippets for release communication.</li>
        </ul>

        <div className="mt-6 rounded-2xl border bg-(--surface) p-4">
          <p className="text-sm text-(--text-secondary)">
            Learn more: {" "}
            <Link href="/use-cases/ai-changelog-generator" className="font-semibold text-(--accent-strong) underline underline-offset-2">
              AI changelog generator
            </Link>
            , {" "}
            <Link href="/use-cases/release-notes-generator-for-startups" className="font-semibold text-(--accent-strong) underline underline-offset-2">
              release notes generator for startups
            </Link>
            , and the {" "}
            <Link href="/faq" className="font-semibold text-(--accent-strong) underline underline-offset-2">
              FAQ
            </Link>
            .
          </p>
        </div>
        <Link href="/login?mode=signup" className="button button-accent mt-8">Create your first kit →</Link>
      </div>
    </main>
  );
}
