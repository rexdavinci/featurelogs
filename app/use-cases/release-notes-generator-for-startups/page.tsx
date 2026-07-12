import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Release Notes Generator for Startups",
  description:
    "Generate startup-friendly release notes that explain shipped value clearly to users and stakeholders.",
  alternates: {
    canonical: "/use-cases/release-notes-generator-for-startups",
  },
};

export default function ReleaseNotesGeneratorForStartupsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 sm:px-8">
      <div className="relative mx-auto w-full max-w-4xl">
        <h1 className="text-4xl font-semibold text-foreground">
          Release Notes Generator for Startups
        </h1>
        <p className="mt-3 text-sm leading-7 text-zinc-700">
          FeatureLogs turns technical implementation notes into concise release
          notes built for startup product updates. Teams can keep customers
          informed without slowing down engineering velocity.
        </p>

        <h2 className="mt-6 text-2xl font-semibold">What you can publish faster</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-zinc-700">
          <li>Customer-facing release notes.</li>
          <li>Public changelog summaries.</li>
          <li>Launch-ready distribution snippets for social channels.</li>
        </ul>

        <div className="mt-6 rounded-2xl border bg-white/75 p-4">
          <p className="text-sm text-zinc-700">
            Related resources: {" "}
            <Link href="/use-cases/ai-changelog-generator" className="font-semibold text-(--accent-strong) underline underline-offset-2">
              AI changelog generator
            </Link>
            , {" "}
            <Link href="/use-cases/social-content-from-git-commits" className="font-semibold text-(--accent-strong) underline underline-offset-2">
              social content from git commits
            </Link>
            , and the {" "}
            <Link href="/use-cases" className="font-semibold text-(--accent-strong) underline underline-offset-2">
              complete use-case library
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
